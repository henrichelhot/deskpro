/*
  # Create comments table

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references tickets)
      - `author_id` (uuid, references users)
      - `content` (text, required)
      - `is_internal` (boolean, default false)
      - `attachments` (text array, default empty)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `comments` table
    - Add policies for comment access based on ticket visibility
*/

CREATE TABLE IF NOT EXISTS comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    author_id uuid REFERENCES public.users(id) NOT NULL,
    content text NOT NULL,
    is_internal boolean DEFAULT false,
    attachments text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Comments follow ticket visibility" ON comments
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

CREATE POLICY "Users can create comments on accessible tickets" ON comments
    FOR INSERT WITH CHECK (
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
        ) AND author_id = auth.uid()
    );

-- Hide internal comments from customers
CREATE POLICY "Internal comments only visible to agents" ON comments
    FOR SELECT USING (
        NOT is_internal OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'agent')
        )
    );

-- Create trigger to update ticket's updated_at when comment is added
CREATE OR REPLACE FUNCTION update_ticket_timestamp()
RETURNS trigger AS $$
BEGIN
    UPDATE tickets 
    SET updated_at = now() 
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ticket_on_comment
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION update_ticket_timestamp();