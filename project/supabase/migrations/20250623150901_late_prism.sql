/*
  # Create attachments table

  1. New Tables
    - `attachments`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references tickets, optional)
      - `comment_id` (uuid, references comments, optional)
      - `filename` (text, required)
      - `file_path` (text, required)
      - `file_size` (integer, optional)
      - `mime_type` (text, optional)
      - `uploaded_by` (uuid, references users)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `attachments` table
    - Add policies for attachment access
*/

CREATE TABLE IF NOT EXISTS attachments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
    comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now(),
    CONSTRAINT attachment_belongs_to_ticket_or_comment 
        CHECK ((ticket_id IS NOT NULL) OR (comment_id IS NOT NULL))
);

-- Enable Row Level Security
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Attachments follow ticket/comment visibility" ON attachments
    FOR SELECT USING (
        (ticket_id IS NOT NULL AND EXISTS (
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
        )) OR
        (comment_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM comments c
            JOIN tickets t ON c.ticket_id = t.id
            WHERE c.id = comment_id AND (
                t.requester_id = auth.uid() OR 
                t.assignee_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'agent')
                )
            )
        ))
    );

CREATE POLICY "Users can upload attachments to accessible tickets" ON attachments
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        ((ticket_id IS NOT NULL AND EXISTS (
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
        )) OR
        (comment_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM comments c
            JOIN tickets t ON c.ticket_id = t.id
            WHERE c.id = comment_id AND (
                t.requester_id = auth.uid() OR 
                t.assignee_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE id = auth.uid() 
                    AND role IN ('admin', 'agent')
                )
            )
        )))
    );