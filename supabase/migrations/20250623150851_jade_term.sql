/*
  # Create ticket changes table for audit log

  1. New Tables
    - `ticket_changes`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references tickets)
      - `agent_id` (uuid, references users)
      - `field_name` (text, required)
      - `old_value` (text, optional)
      - `new_value` (text, optional)
      - `action` (text, required)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `ticket_changes` table
    - Add policies for change log access
*/

CREATE TABLE IF NOT EXISTS ticket_changes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    agent_id uuid REFERENCES public.users(id) NOT NULL,
    field_name text NOT NULL,
    old_value text,
    new_value text,
    action text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE ticket_changes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Changes follow ticket visibility" ON ticket_changes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tickets t 
            WHERE t.id = ticket_id AND (
                t.requester_id = auth.uid() OR 
                t.assignee_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'agent')
                )
            )
        )
    );

CREATE POLICY "Agents can create change logs" ON ticket_changes
    FOR INSERT WITH CHECK (
        agent_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'agent')
        )
    );