/*
  # Create inboxes table for email management

  1. New Tables
    - `inboxes`
      - `id` (uuid, primary key)
      - `name` (text, required) - Display name for the inbox
      - `description` (text, optional) - Description of the inbox purpose
      - `provider` (text, required) - Email provider type (gmail, outlook, imap, pop3, exchange)
      - `email_address` (text, required) - The email address for this inbox
      - `brand_id` (uuid, optional) - Associated brand
      - `is_active` (boolean, default true) - Whether the inbox is active
      - `settings` (jsonb) - Provider-specific connection settings (encrypted)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Updates
    - Add `inbox_id` to tickets table to track which inbox received the email

  3. Security
    - Enable RLS on `inboxes` table
    - Add policies for inbox management (admin only)
*/

-- Create inboxes table
CREATE TABLE IF NOT EXISTS inboxes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    provider text CHECK (provider IN ('gmail', 'outlook', 'imap', 'pop3', 'exchange')) NOT NULL,
    email_address text NOT NULL,
    brand_id uuid REFERENCES brands(id),
    is_active boolean DEFAULT true,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add inbox_id to tickets table
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS inbox_id uuid REFERENCES inboxes(id);

-- Enable RLS on inboxes table
ALTER TABLE inboxes ENABLE ROW LEVEL SECURITY;

-- Inboxes policies (admin only for security)
CREATE POLICY "Admins can manage inboxes" ON inboxes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Agents can read inboxes for ticket assignment
CREATE POLICY "Agents can read inboxes" ON inboxes
    FOR SELECT USING (is_admin_or_agent());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_inboxes_email_address ON inboxes(email_address);
CREATE INDEX IF NOT EXISTS idx_inboxes_provider ON inboxes(provider);
CREATE INDEX IF NOT EXISTS idx_inboxes_brand_id ON inboxes(brand_id);
CREATE INDEX IF NOT EXISTS idx_tickets_inbox_id ON tickets(inbox_id);

-- Insert sample inboxes
INSERT INTO inboxes (name, description, provider, email_address, brand_id, settings) 
SELECT 
    'General Support',
    'Main support inbox for customer inquiries',
    'gmail',
    'support@company.com',
    b.id,
    jsonb_build_object(
        'host', 'imap.gmail.com',
        'port', 993,
        'secure', true,
        'auth', jsonb_build_object(
            'user', 'support@company.com',
            'pass', '[ENCRYPTED]'
        ),
        'auto_reply', true,
        'signature', 'Best regards,\nSupport Team'
    )
FROM brands b 
WHERE b.name = 'ServiceDesk Pro'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO inboxes (name, description, provider, email_address, brand_id, settings)
SELECT 
    'Enterprise Support',
    'Dedicated inbox for enterprise client support',
    'outlook',
    'enterprise@company.com',
    b.id,
    jsonb_build_object(
        'host', 'outlook.office365.com',
        'port', 993,
        'secure', true,
        'auth', jsonb_build_object(
            'user', 'enterprise@company.com',
            'pass', '[ENCRYPTED]'
        ),
        'auto_reply', false,
        'signature', 'Best regards,\nEnterprise Support Team'
    )
FROM brands b 
WHERE b.name = 'Enterprise Support'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO inboxes (name, description, provider, email_address, settings)
VALUES (
    'Airline Bookings',
    'Dedicated inbox for airline booking issues',
    'imap',
    'bookings@company.com',
    jsonb_build_object(
        'host', 'mail.company.com',
        'port', 993,
        'secure', true,
        'auth', jsonb_build_object(
            'user', 'bookings@company.com',
            'pass', '[ENCRYPTED]'
        ),
        'auto_reply', true,
        'signature', 'Best regards,\nBooking Support Team'
    )
)
ON CONFLICT DO NOTHING;