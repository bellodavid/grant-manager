-- Initial Grant Flow Database Setup
-- Run this after your Drizzle migrations

-- Create default user roles
INSERT INTO user_roles (user_id, role) VALUES 
-- You'll need to replace 'your-user-id' with actual user IDs after users sign up
-- ('your-user-id', 'super_admin'),
-- ('your-user-id', 'grant_manager');

-- Example grant call (optional)
INSERT INTO call_for_proposals (
  id,
  title,
  description,
  short_description,
  open_date,
  close_date,
  budget_cap,
  eligibility_criteria,
  status,
  created_by,
  rubrics
) VALUES (
  gen_random_uuid(),
  'Research Innovation Grant 2024',
  'A comprehensive funding opportunity for innovative research projects that address critical challenges in science and technology.',
  'Funding for innovative research projects up to $50,000',
  '2024-01-01',
  '2024-12-31',
  50000.00,
  'Open to faculty members with PhD and at least 2 years of research experience',
  'published',
  'system', -- Replace with actual user ID
  '{"innovation": {"weight": 30, "description": "Innovation and novelty of the research"}, "feasibility": {"weight": 25, "description": "Technical feasibility and methodology"}, "impact": {"weight": 30, "description": "Potential impact and significance"}, "budget": {"weight": 15, "description": "Budget justification and efficiency"}}'::jsonb
);

-- Grant this if you want to set up some test data
-- Make sure to replace 'your-user-id' with actual user IDs from your Supabase auth.users table
