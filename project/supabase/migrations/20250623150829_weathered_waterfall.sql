/*
  # Create tickets table

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `ticket_number` (text, unique, auto-generated)
      - `subject` (text, required)
      - `description` (text, required)
      - `status` (text, check constraint)
      - `priority` (text, check constraint)
      - `satisfaction` (text, check constraint)
      - `requester_id` (uuid, references users)
      - `assignee_id` (uuid, references users, optional)
      - `organization_id` (uuid, references organizations, optional)
      - `due_date` (timestamptz, optional)
      - `tags` (text array, default empty)
      - `custom_fields` (jsonb, default empty object)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `tickets` table
    - Add policies for ticket access based on role
*/

CREATE TABLE IF NOT EXISTS tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number text UNIQUE NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text CHECK (status IN ('new', 'open', 'pending', 'on-hold', 'solved', 'closed')) DEFAULT 'new',
    priority text CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    satisfaction text CHECK (satisfaction IN ('offered', 'unoffered', 'good', 'bad')) DEFAULT 'unoffered',
    requester_id uuid REFERENCES public.users(id) NOT NULL,
    assignee_id uuid REFERENCES public.users(id),
    organization_id uuid REFERENCES organizations(id),
    due_date timestamptz,
    tags text[] DEFAULT '{}',
    custom_fields jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Agents and admins can see all tickets" ON tickets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'agent')
        )
    );

CREATE POLICY "Customers can see own tickets" ON tickets
    FOR SELECT USING (
        requester_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'agent')
        )
    );

CREATE POLICY "Customers can create tickets" ON tickets
    FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text AS $$
DECLARE
    next_number integer;
    ticket_num text;
BEGIN
    -- Get the next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS integer)), 0) + 1
    INTO next_number
    FROM tickets
    WHERE ticket_number ~ '^TKT-[0-9]+$';
    
    -- Format as TKT-XXXXXX (6 digits, zero-padded)
    ticket_num := 'TKT-' || LPAD(next_number::text, 6, '0');
    
    RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS trigger AS $$
BEGIN
    IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
        NEW.ticket_number := generate_ticket_number();
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_trigger
    BEFORE INSERT OR UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION set_ticket_number();