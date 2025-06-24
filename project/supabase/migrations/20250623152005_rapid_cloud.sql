/*
  # Sample Data for Zendesk Clone

  This migration adds sample data for development and testing purposes.
  Since we can't directly insert into auth.users, we'll create sample data
  that can be used once real users sign up.
*/

-- Insert sample organization first
INSERT INTO organizations (id, name, domain) VALUES
    ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Acme Corporation', 'acme.com')
ON CONFLICT (id) DO NOTHING;

-- Create a function to safely insert sample data after users exist
CREATE OR REPLACE FUNCTION insert_sample_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function can be called after users sign up to create sample tickets
  
  -- Insert sample tickets (will only work if users exist)
  INSERT INTO tickets (id, ticket_number, subject, description, status, priority, requester_id, assignee_id, organization_id, tags) 
  SELECT 
    'aaaaaaaa-1111-1111-1111-111111111111',
    'TKT-000001',
    'Call for Booking ID: 274721731 SID: CA42c0b349ce945d4f03d0fe...',
    'Customer needs assistance with flight booking modification',
    'on-hold',
    'normal',
    u1.id,
    u2.id,
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    ARRAY['booking', 'modification']
  FROM 
    (SELECT id FROM users WHERE email = 'mary.bisch@customer.com' LIMIT 1) u1,
    (SELECT id FROM users WHERE email = 'mohamed.hasanen@company.com' LIMIT 1) u2
  WHERE EXISTS (SELECT 1 FROM users WHERE email = 'mary.bisch@customer.com')
    AND EXISTS (SELECT 1 FROM users WHERE email = 'mohamed.hasanen@company.com')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO tickets (id, ticket_number, subject, description, status, priority, requester_id, assignee_id, organization_id, tags)
  SELECT 
    'bbbbbbbb-2222-2222-2222-222222222222',
    'TKT-000002',
    'Call for Booking ID: 258298251 SID: CA43ca9310c123254aa22e7f...',
    'Flight cancellation request and refund inquiry',
    'on-hold',
    'high',
    u1.id,
    u2.id,
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    ARRAY['cancellation', 'refund']
  FROM 
    (SELECT id FROM users WHERE email = 'ludlinep30@customer.com' LIMIT 1) u1,
    (SELECT id FROM users WHERE email = 'fares.mohsen@company.com' LIMIT 1) u2
  WHERE EXISTS (SELECT 1 FROM users WHERE email = 'ludlinep30@customer.com')
    AND EXISTS (SELECT 1 FROM users WHERE email = 'fares.mohsen@company.com')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO tickets (id, ticket_number, subject, description, status, priority, requester_id, assignee_id, organization_id, tags)
  SELECT 
    'cccccccc-3333-3333-3333-333333333333',
    'TKT-000003',
    'Special assistance request for disabled passenger',
    'Customer requires wheelchair assistance and special boarding',
    'new',
    'high',
    u1.id,
    u2.id,
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    ARRAY['special-assistance', 'disability']
  FROM 
    (SELECT id FROM users WHERE email = 'mary.bisch@customer.com' LIMIT 1) u1,
    (SELECT id FROM users WHERE email = 'summer.elashry@company.com' LIMIT 1) u2
  WHERE EXISTS (SELECT 1 FROM users WHERE email = 'mary.bisch@customer.com')
    AND EXISTS (SELECT 1 FROM users WHERE email = 'summer.elashry@company.com')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO tickets (id, ticket_number, subject, description, status, priority, requester_id, assignee_id, organization_id, tags)
  SELECT 
    'dddddddd-4444-4444-4444-444444444444',
    'TKT-000004',
    'Medical waiver request - ITA airways',
    'Medical documentation required for travel waiver',
    'open',
    'urgent',
    u1.id,
    u2.id,
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    ARRAY['medical', 'waiver', 'documentation']
  FROM 
    (SELECT id FROM users WHERE email = 'ludlinep30@customer.com' LIMIT 1) u1,
    (SELECT id FROM users WHERE email = 'mohamed.hasanen@company.com' LIMIT 1) u2
  WHERE EXISTS (SELECT 1 FROM users WHERE email = 'ludlinep30@customer.com')
    AND EXISTS (SELECT 1 FROM users WHERE email = 'mohamed.hasanen@company.com')
  ON CONFLICT (id) DO NOTHING;

  -- Insert sample comments
  INSERT INTO comments (id, ticket_id, author_id, content, is_internal)
  SELECT 
    'aaaaaaaa-aaaa-1111-1111-111111111111',
    'aaaaaaaa-1111-1111-1111-111111111111',
    u.id,
    'I have reviewed the booking details and contacted the customer via phone. They are requesting to change their flight date from March 15th to March 20th. Checking availability now.',
    true
  FROM (SELECT id FROM users WHERE email = 'mohamed.hasanen@company.com' LIMIT 1) u
  WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 'aaaaaaaa-1111-1111-1111-111111111111')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO comments (id, ticket_id, author_id, content, is_internal)
  SELECT 
    'bbbbbbbb-bbbb-2222-2222-222222222222',
    'aaaaaaaa-1111-1111-1111-111111111111',
    u.id,
    'Thank you for your assistance. I can be flexible with the dates. Please let me know about any additional fees.',
    false
  FROM (SELECT id FROM users WHERE email = 'mary.bisch@customer.com' LIMIT 1) u
  WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 'aaaaaaaa-1111-1111-1111-111111111111')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO comments (id, ticket_id, author_id, content, is_internal)
  SELECT 
    'cccccccc-cccc-3333-3333-333333333333',
    'bbbbbbbb-2222-2222-2222-222222222222',
    u.id,
    'Customer called regarding cancellation. Processing refund according to policy. Will update ticket once complete.',
    true
  FROM (SELECT id FROM users WHERE email = 'fares.mohsen@company.com' LIMIT 1) u
  WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 'bbbbbbbb-2222-2222-2222-222222222222')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO comments (id, ticket_id, author_id, content, is_internal)
  SELECT 
    'dddddddd-dddd-4444-4444-444444444444',
    'dddddddd-4444-4444-4444-444444444444',
    u.id,
    'Medical documentation received and forwarded to medical review team. Awaiting approval.',
    true
  FROM (SELECT id FROM users WHERE email = 'mohamed.hasanen@company.com' LIMIT 1) u
  WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 'dddddddd-4444-4444-4444-444444444444')
  ON CONFLICT (id) DO NOTHING;

  -- Insert sample ticket changes
  INSERT INTO ticket_changes (ticket_id, agent_id, field_name, old_value, new_value, action)
  SELECT 
    'aaaaaaaa-1111-1111-1111-111111111111',
    u.id,
    'status',
    'new',
    'on-hold',
    'Status changed from New to On-Hold'
  FROM (SELECT id FROM users WHERE email = 'mohamed.hasanen@company.com' LIMIT 1) u
  WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 'aaaaaaaa-1111-1111-1111-111111111111')
  ON CONFLICT DO NOTHING;

  INSERT INTO ticket_changes (ticket_id, agent_id, field_name, old_value, new_value, action)
  SELECT 
    'aaaaaaaa-1111-1111-1111-111111111111',
    u.id,
    'assignee_id',
    null,
    u.id::text,
    'Ticket assigned to Mohamed Hasanen'
  FROM (SELECT id FROM users WHERE email = 'mohamed.hasanen@company.com' LIMIT 1) u
  WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 'aaaaaaaa-1111-1111-1111-111111111111')
  ON CONFLICT DO NOTHING;

  INSERT INTO ticket_changes (ticket_id, agent_id, field_name, old_value, new_value, action)
  SELECT 
    'bbbbbbbb-2222-2222-2222-222222222222',
    u.id,
    'priority',
    'normal',
    'high',
    'Priority changed from Normal to High'
  FROM (SELECT id FROM users WHERE email = 'fares.mohsen@company.com' LIMIT 1) u
  WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 'bbbbbbbb-2222-2222-2222-222222222222')
  ON CONFLICT DO NOTHING;

  INSERT INTO ticket_changes (ticket_id, agent_id, field_name, old_value, new_value, action)
  SELECT 
    'dddddddd-4444-4444-4444-444444444444',
    u.id,
    'status',
    'new',
    'open',
    'Status changed from New to Open'
  FROM (SELECT id FROM users WHERE email = 'mohamed.hasanen@company.com' LIMIT 1) u
  WHERE EXISTS (SELECT 1 FROM tickets WHERE id = 'dddddddd-4444-4444-4444-444444444444')
  ON CONFLICT DO NOTHING;

END;
$$;

-- Create a trigger to automatically populate sample data when users sign up
CREATE OR REPLACE FUNCTION auto_populate_sample_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if this is one of our demo users and if we haven't created sample data yet
  IF NEW.email IN ('mohamed.hasanen@company.com', 'mary.bisch@customer.com', 'fares.mohsen@company.com', 'summer.elashry@company.com', 'ludlinep30@customer.com') THEN
    -- Wait a moment for the transaction to complete, then populate sample data
    PERFORM insert_sample_data();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_populate_sample_data ON users;
CREATE TRIGGER trigger_auto_populate_sample_data
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_sample_data();

-- Add a comment explaining how to use this
COMMENT ON FUNCTION insert_sample_data() IS 'Call this function after demo users sign up to populate sample tickets and data';