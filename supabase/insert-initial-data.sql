-- ========================================================
-- Insert Initial Data for IJCAST Journal
-- Run this AFTER deploying the schema
-- ========================================================

-- 1. Insert Journal Settings (if not exists)
INSERT INTO journal_settings (
  journal_name,
  short_name,
  issn,
  eissn,
  doi_prefix,
  publisher,
  publication_frequency,
  language,
  contact_email,
  alternate_email,
  phone,
  postal_address,
  copyright_statement,
  license_name,
  license_url,
  is_open_access,
  open_access_statement
) VALUES (
  'International Journal of Commerce, Arts, Science and Technology',
  'IJCAST',
  'ISSN 2394-9007',
  'e-ISSN 2394-9007',
  '10.5281/ijcast',
  'Gyanaakshar Sanskriti Foundation',
  'Bi-Monthly (6 Issues / Year)',
  'English',
  'editor.ijcast.in@gmail.com',
  'editor.ijcast.in@gmail.com',
  '+91-XXXXXXXXXX',
  'New Delhi, India',
  'Copyright © IJCAST. All rights reserved. Authors retain full publication rights.',
  'Creative Commons Attribution 4.0 International (CC BY 4.0)',
  'https://creativecommons.org/licenses/by/4.0/',
  false,
  'All published articles are freely available online immediately upon publication without subscription charges.'
)
ON CONFLICT DO NOTHING;

-- 2. Insert Default Research Areas
INSERT INTO research_areas (category, subcategories, sort_order) VALUES
  ('Commerce & Management', ARRAY['Accounting', 'Finance', 'Marketing', 'Human Resources', 'Business Administration'], 1),
  ('Arts & Humanities', ARRAY['Literature', 'History', 'Philosophy', 'Cultural Studies', 'Fine Arts'], 2),
  ('Science & Technology', ARRAY['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry', 'Biology'], 3),
  ('Social Sciences', ARRAY['Economics', 'Political Science', 'Sociology', 'Psychology', 'Education'], 4),
  ('Law & Legal Studies', ARRAY['Constitutional Law', 'Criminal Law', 'Corporate Law', 'International Law'], 5),
  ('Medical & Health Sciences', ARRAY['Medicine', 'Nursing', 'Public Health', 'Pharmacy', 'Dentistry'], 6)
ON CONFLICT (category) DO NOTHING;

-- 3. Insert Sample Volume (Current Year)
INSERT INTO volumes (volume_number, year, description, status) VALUES
  (1, EXTRACT(YEAR FROM CURRENT_DATE)::INT, 'Volume 1 - ' || EXTRACT(YEAR FROM CURRENT_DATE), 'Active')
ON CONFLICT DO NOTHING
RETURNING id AS volume_id;

-- 4. Insert Sample Issue (if volume exists)
DO $$
DECLARE
  v_id UUID;
  current_year INT;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
  
  -- Get the volume ID for current year
  SELECT id INTO v_id FROM volumes WHERE year = current_year LIMIT 1;
  
  -- Insert issue if volume exists
  IF v_id IS NOT NULL THEN
    INSERT INTO issues (volume_id, issue_number, month_range, year, pub_date, is_published, sort_order)
    VALUES (v_id, 1, 'January - February', current_year, CURRENT_DATE, true, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 5. Insert Sample Editorial Members
INSERT INTO editorial_members (name, role, designation, institution, country, email, is_active, sort_order) VALUES
  ('Dr. Editor Name', 'Editor-in-Chief', 'Professor', 'University Name', 'India', 'editor.ijcast.in@gmail.com', true, 1)
ON CONFLICT DO NOTHING;

-- ========================================================
-- Verify Data Inserted
-- ========================================================

-- Check journal settings
SELECT 'Journal Settings:' as info, journal_name, issn, eissn FROM journal_settings LIMIT 1;

-- Check research areas
SELECT 'Research Areas Count:' as info, COUNT(*) as count FROM research_areas;

-- Check volumes
SELECT 'Volumes Count:' as info, COUNT(*) as count FROM volumes;

-- Check issues
SELECT 'Issues Count:' as info, COUNT(*) as count FROM issues;

-- ========================================================
-- END
-- ========================================================
