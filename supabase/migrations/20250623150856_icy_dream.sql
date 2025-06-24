/*
  # Create ticket viewers table for real-time collaboration

  1. New Tables
    - `ticket_viewers`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references tickets)
      - `user_id` (uuid, references users)
      - `last_viewed` (timestamptz, default now)
      - Unique constraint on (ticket_id, user_id)

  2. Security
    - Enable RLS on `ticket_viewers` table
    - Add policies for viewer tracking
*/

CREATE TABLE IF NOT EXISTS ticket_viewers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    last_viewed timestamptz DEFAULT now(),
    UNIQUE(ticket_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE ticket_viewers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can track their own viewing" ON ticket_viewers
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Agents can see all viewers" ON ticket_viewers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'agent')
        )
    );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ticket_viewers_ticket_id ON ticket_viewers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_viewers_last_viewed ON ticket_viewers(last_viewed);