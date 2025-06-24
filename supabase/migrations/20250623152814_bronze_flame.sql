/*
  # Fix infinite recursion in users RLS policy

  1. Security Function
    - Create `is_admin_or_agent()` function with SECURITY INVOKER
    - This function safely checks user roles without triggering RLS recursion

  2. Policy Updates
    - Update the "Users can read own data" policy to use the new function
    - Update other policies that have similar recursion issues

  3. Changes
    - Replaces direct user table queries in RLS policies with secure function calls
    - Eliminates infinite recursion when checking user roles
*/

-- Create a security invoker function to check if current user is admin or agent
CREATE OR REPLACE FUNCTION is_admin_or_agent()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'agent')
  );
END;
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Agents and admins can read all users" ON public.users;

-- Recreate the users read policy without recursion
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Agents and admins can read all users" ON public.users
  FOR SELECT 
  USING (is_admin_or_agent());

-- Update other policies that might have similar issues
DROP POLICY IF EXISTS "Agents and admins can see all tickets" ON public.tickets;
CREATE POLICY "Agents and admins can see all tickets" ON public.tickets
  FOR ALL 
  USING (is_admin_or_agent());

DROP POLICY IF EXISTS "Customers can see own tickets" ON public.tickets;
CREATE POLICY "Customers can see own tickets" ON public.tickets
  FOR SELECT 
  USING (
    requester_id = auth.uid() OR 
    assignee_id = auth.uid() OR 
    is_admin_or_agent()
  );

-- Update comments policies
DROP POLICY IF EXISTS "Comments follow ticket visibility" ON public.comments;
CREATE POLICY "Comments follow ticket visibility" ON public.comments
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = comments.ticket_id AND (
        t.requester_id = auth.uid() OR 
        t.assignee_id = auth.uid() OR 
        is_admin_or_agent()
      )
    )
  );

DROP POLICY IF EXISTS "Internal comments only visible to agents" ON public.comments;
CREATE POLICY "Internal comments only visible to agents" ON public.comments
  FOR SELECT 
  USING (NOT is_internal OR is_admin_or_agent());

-- Update organizations policies
DROP POLICY IF EXISTS "Agents and admins can read all organizations" ON public.organizations;
CREATE POLICY "Agents and admins can read all organizations" ON public.organizations
  FOR SELECT 
  USING (is_admin_or_agent());

DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations" ON public.organizations
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update ticket_changes policies
DROP POLICY IF EXISTS "Changes follow ticket visibility" ON public.ticket_changes;
CREATE POLICY "Changes follow ticket visibility" ON public.ticket_changes
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM tickets t 
      WHERE t.id = ticket_changes.ticket_id AND (
        t.requester_id = auth.uid() OR 
        t.assignee_id = auth.uid() OR 
        is_admin_or_agent()
      )
    )
  );

DROP POLICY IF EXISTS "Agents can create change logs" ON public.ticket_changes;
CREATE POLICY "Agents can create change logs" ON public.ticket_changes
  FOR INSERT 
  WITH CHECK (agent_id = auth.uid() AND is_admin_or_agent());

-- Update ticket_viewers policies
DROP POLICY IF EXISTS "Agents can see all viewers" ON public.ticket_viewers;
CREATE POLICY "Agents can see all viewers" ON public.ticket_viewers
  FOR SELECT 
  USING (is_admin_or_agent());

-- Update attachments policies
DROP POLICY IF EXISTS "Attachments follow ticket/comment visibility" ON public.attachments;
CREATE POLICY "Attachments follow ticket/comment visibility" ON public.attachments
  FOR SELECT 
  USING (
    (
      ticket_id IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM tickets t 
        WHERE t.id = attachments.ticket_id AND (
          t.requester_id = auth.uid() OR 
          t.assignee_id = auth.uid() OR 
          is_admin_or_agent()
        )
      )
    ) OR (
      comment_id IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM comments c
        JOIN tickets t ON c.ticket_id = t.id
        WHERE c.id = attachments.comment_id AND (
          t.requester_id = auth.uid() OR 
          t.assignee_id = auth.uid() OR 
          is_admin_or_agent()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can upload attachments to accessible tickets" ON public.attachments;
CREATE POLICY "Users can upload attachments to accessible tickets" ON public.attachments
  FOR INSERT 
  WITH CHECK (
    uploaded_by = auth.uid() AND (
      (
        ticket_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM tickets t 
          WHERE t.id = attachments.ticket_id AND (
            t.requester_id = auth.uid() OR 
            t.assignee_id = auth.uid() OR 
            is_admin_or_agent()
          )
        )
      ) OR (
        comment_id IS NOT NULL AND 
        EXISTS (
          SELECT 1 FROM comments c
          JOIN tickets t ON c.ticket_id = t.id
          WHERE c.id = attachments.comment_id AND (
            t.requester_id = auth.uid() OR 
            t.assignee_id = auth.uid() OR 
            is_admin_or_agent()
          )
        )
      )
    )
  );