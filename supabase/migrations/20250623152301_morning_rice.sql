/*
  # Demo Data Setup Migration

  1. Sample Organization
    - Creates a demo company organization
  
  2. Sample Data Structure
    - Sets up the foundation for demo tickets and comments
    - Uses placeholder data that will be populated when auth users are created

  Note: User profiles will be automatically created by the trigger when users sign up via Supabase Auth
*/

-- Create a sample organization
INSERT INTO organizations (id, name, domain, settings, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Demo Company',
  'company.com',
  '{"support_hours": "9AM-5PM", "timezone": "UTC"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Create a function to populate sample tickets when demo users exist
CREATE OR REPLACE FUNCTION create_demo_tickets()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  agent_user_id uuid;
  customer_user_id uuid;
  org_id uuid;
  ticket1_id uuid;
  ticket2_id uuid;
BEGIN
  -- Check if demo users exist
  SELECT id INTO agent_user_id FROM users WHERE email = 'mohamed.hasanen@company.com' LIMIT 1;
  SELECT id INTO customer_user_id FROM users WHERE email = 'mary.bisch@customer.com' LIMIT 1;
  SELECT id INTO org_id FROM organizations WHERE domain = 'company.com' LIMIT 1;
  
  -- Only proceed if both users exist
  IF agent_user_id IS NOT NULL AND customer_user_id IS NOT NULL AND org_id IS NOT NULL THEN
    
    -- Create sample tickets
    INSERT INTO tickets (id, subject, description, status, priority, requester_id, assignee_id, organization_id, created_at, updated_at)
    VALUES 
      (
        gen_random_uuid(),
        'Login Issues',
        'I am having trouble logging into my account. The password reset email is not arriving.',
        'open',
        'high',
        customer_user_id,
        agent_user_id,
        org_id,
        now() - interval '2 hours',
        now() - interval '1 hour'
      ),
      (
        gen_random_uuid(),
        'Feature Request: Dark Mode',
        'It would be great to have a dark mode option in the application for better user experience during night time usage.',
        'new',
        'normal',
        customer_user_id,
        null,
        org_id,
        now() - interval '1 day',
        now() - interval '1 day'
      )
    ON CONFLICT DO NOTHING
    RETURNING id INTO ticket1_id;
    
    -- Get the first ticket ID for comments
    SELECT id INTO ticket1_id FROM tickets WHERE subject = 'Login Issues' AND requester_id = customer_user_id LIMIT 1;
    
    -- Add sample comments if ticket exists
    IF ticket1_id IS NOT NULL THEN
      INSERT INTO comments (id, ticket_id, author_id, content, is_internal, created_at, updated_at)
      VALUES 
        (
          gen_random_uuid(),
          ticket1_id,
          agent_user_id,
          'I have checked your account and can see the issue. Let me reset your password manually and send you a new temporary password.',
          false,
          now() - interval '30 minutes',
          now() - interval '30 minutes'
        ),
        (
          gen_random_uuid(),
          ticket1_id,
          customer_user_id,
          'Thank you for the quick response! I received the temporary password and was able to log in successfully.',
          false,
          now() - interval '15 minutes',
          now() - interval '15 minutes'
        )
      ON CONFLICT (id) DO NOTHING;
    END IF;
    
  END IF;
END;
$$;

-- Update the existing trigger to also create demo data
CREATE OR REPLACE FUNCTION auto_populate_sample_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the user profile
  INSERT INTO public.users (id, name, email, role, avatar_url, is_online, last_seen, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::text,
    NEW.raw_user_meta_data->>'avatar_url',
    false,
    now(),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();
  
  -- If this is one of our demo users, create sample tickets
  IF NEW.email IN ('mohamed.hasanen@company.com', 'mary.bisch@customer.com') THEN
    PERFORM create_demo_tickets();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS trigger_auto_populate_sample_data ON auth.users;
CREATE TRIGGER trigger_auto_populate_sample_data
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_sample_data();