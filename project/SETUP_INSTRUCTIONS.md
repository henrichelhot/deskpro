# Demo User Setup Instructions

To resolve the "Invalid login credentials" error, you need to create the demo users in your Supabase Authentication dashboard.

## Steps to Create Demo Users:

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Access Authentication section**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Create the first demo user (Agent)**
   - Click "Add user" button
   - Email: `mohamed.hasanen@company.com`
   - Password: `password123`
   - Click "Create user"

4. **Create the second demo user (Customer)**
   - Click "Add user" button again
   - Email: `mary.bisch@customer.com`
   - Password: `password123`
   - Click "Create user"

5. **Update User IDs in Migration (Optional)**
   - After creating users, note their UUIDs from the Auth dashboard
   - Update the UUIDs in the migration file `create_demo_users.sql` to match
   - This ensures the user profiles sync correctly with auth users

## Verification:

After creating the users, you should be able to:
- Click the "Demo Agent Account" button to auto-fill login credentials
- Click the "Demo Customer Account" button to auto-fill login credentials
- Successfully log in with either account

## Troubleshooting:

If you still get authentication errors:
1. Verify the users exist in Authentication > Users
2. Check that passwords are set to "password123"
3. Ensure your `.env` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Try resetting the user passwords in the Supabase dashboard

The migration will create user profiles and sample data once the authentication users exist.