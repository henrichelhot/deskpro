/*
  # Fix RLS infinite recursion on users table

  1. Security Function
    - Create `is_admin_or_agent()` function with SECURITY DEFINER to safely check roles
    - This prevents infinite recursion when policies query the users table

  2. Policy Updates
    - Replace all problematic policies that cause recursion
    - Maintain same access control logic but eliminate circular dependencies
    - Handle existing policies properly with DROP IF EXISTS

  3. Access Control
    - Users can read their own data
    - Agents and admins can read all users
    - Maintain ticket, comment, and other table access patterns
*/

-- Create security definer function to check user roles safely
CREATE OR REPLACE FUNCTION public.is_admin_or_agent()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'agent')
  );
END;
$$;

-- Users table policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Agents and admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Agents and admins can read all users" ON public.users
  FOR SELECT
  USING (is_admin_or_agent());

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Tickets table policies
DROP POLICY IF EXISTS "Agents can see all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Agents and admins can see all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Customers can see own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Customers can create tickets" ON public.tickets;

CREATE POLICY "Agents and admins can see all tickets" ON public.tickets
  FOR ALL
  USING (is_admin_or_agent());

CREATE POLICY "Customers can see own tickets" ON public.tickets
  FOR SELECT
  USING (requester_id = auth.uid() OR assignee_id = auth.uid() OR is_admin_or_agent());

CREATE POLICY "Customers can create tickets" ON public.tickets
  FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Comments table policies
DROP POLICY IF EXISTS "Comments follow ticket visibility" ON public.comments;
DROP POLICY IF EXISTS "Internal comments only visible to agents" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments on accessible tickets" ON public.comments;

CREATE POLICY "Comments follow ticket visibility" ON public.comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = comments.ticket_id 
      AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid() OR is_admin_or_agent())
    )
  );

CREATE POLICY "Internal comments only visible to agents" ON public.comments
  FOR SELECT
  USING (NOT is_internal OR is_admin_or_agent());

CREATE POLICY "Users can create comments on accessible tickets" ON public.comments
  FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = comments.ticket_id 
      AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid() OR is_admin_or_agent())
    )
  );

-- Ticket changes table policies
DROP POLICY IF EXISTS "Changes follow ticket visibility" ON public.ticket_changes;
DROP POLICY IF EXISTS "Agents can create change logs" ON public.ticket_changes;

CREATE POLICY "Changes follow ticket visibility" ON public.ticket_changes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = ticket_changes.ticket_id 
      AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid() OR is_admin_or_agent())
    )
  );

CREATE POLICY "Agents can create change logs" ON public.ticket_changes
  FOR INSERT
  WITH CHECK (agent_id = auth.uid() AND is_admin_or_agent());

-- Organizations table policies
DROP POLICY IF EXISTS "Agents and admins can read all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;

CREATE POLICY "Agents and admins can read all organizations" ON public.organizations
  FOR SELECT
  USING (is_admin_or_agent());

CREATE POLICY "Admins can manage organizations" ON public.organizations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ticket viewers table policies
DROP POLICY IF EXISTS "Agents can see all viewers" ON public.ticket_viewers;
DROP POLICY IF EXISTS "Users can track their own viewing" ON public.ticket_viewers;

CREATE POLICY "Agents can see all viewers" ON public.ticket_viewers
  FOR SELECT
  USING (is_admin_or_agent());

CREATE POLICY "Users can track their own viewing" ON public.ticket_viewers
  FOR ALL
  USING (user_id = auth.uid());

-- Attachments table policies
DROP POLICY IF EXISTS "Attachments follow ticket/comment visibility" ON public.attachments;
DROP POLICY IF EXISTS "Users can upload attachments to accessible tickets" ON public.attachments;

CREATE POLICY "Attachments follow ticket/comment visibility" ON public.attachments
  FOR SELECT
  USING (
    (ticket_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = attachments.ticket_id 
      AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid() OR is_admin_or_agent())
    )) OR
    (comment_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM comments c 
      JOIN tickets t ON c.ticket_id = t.id 
      WHERE c.id = attachments.comment_id 
      AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid() OR is_admin_or_agent())
    ))
  );

CREATE POLICY "Users can upload attachments to accessible tickets" ON public.attachments
  FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND (
      (ticket_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM tickets t 
        WHERE t.id = attachments.ticket_id 
        AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid() OR is_admin_or_agent())
      )) OR
      (comment_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM comments c 
        JOIN tickets t ON c.ticket_id = t.id 
        WHERE c.id = attachments.comment_id 
        AND (t.requester_id = auth.uid() OR t.assignee_id = auth.uid() OR is_admin_or_agent())
      ))
    )
  );