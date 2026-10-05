-- ============================================
-- IJCAST Journal Database Schema
-- Supabase PostgreSQL Implementation
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SUBMISSIONS SYSTEM
-- ============================================

-- Main submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id TEXT UNIQUE NOT NULL, -- Format: RJ-YYYY-####
  
  -- Primary Author Information
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_phone TEXT,
  author_affiliation TEXT,
  author_institution TEXT,
  author_country TEXT,
  
  -- Paper Information
  paper_title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT NOT NULL,
  
  -- File URLs (Supabase Storage)
  manuscript_file_url TEXT,
  manuscript_filename TEXT,
  cover_letter_file_url TEXT,
  cover_letter_filename TEXT,
  copyright_file_url TEXT,
  copyright_filename TEXT,
  
  -- Status and Workflow
  status TEXT DEFAULT 'SUBMITTED', 
  -- Options: SUBMITTED, UNDER REVIEW, REVISION REQUIRED, ACCEPTED, REJECTED, PUBLISHED
  
  -- Dates
  submitted_date TIMESTAMP DEFAULT NOW(),
  reviewed_date TIMESTAMP,
  accepted_date TIMESTAMP,
  published_date TIMESTAMP,
  
  -- Admin Management
  internal_notes TEXT,
  assigned_to UUID, -- Can reference users table if you add it
  reviewer_comments TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on submission_id for fast lookups
CREATE INDEX idx_submissions_submission_id ON submissions(submission_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_date ON submissions(submitted_date DESC);

-- ============================================
-- Co-Authors table (relational)
CREATE TABLE IF NOT EXISTS submission_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  affiliation TEXT,
  institution TEXT,
  country TEXT,
  author_order INT DEFAULT 1, -- 1 = primary (usually stored in submissions table), 2+ = co-authors
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_submission_authors_submission_id ON submission_authors(submission_id);

-- ============================================
-- CONTACT MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  
  status TEXT DEFAULT 'NEW', -- NEW, READ, RESPONDED, ARCHIVED
  admin_notes TEXT,
  responded_at TIMESTAMP,
  responded_by UUID, -- Can reference users table
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for admin dashboard
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on submissions table
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for submission form)
CREATE POLICY "Allow public insert submissions" ON submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow public select for their own submissions (if you add user auth)
CREATE POLICY "Allow users to view own submissions" ON submissions
  FOR SELECT
  TO authenticated
  USING (author_email = auth.jwt()->>'email');

-- Allow admin full access (requires admin role in your auth system)
CREATE POLICY "Allow admin full access to submissions" ON submissions
  FOR ALL
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'admin' OR 
    auth.jwt()->>'email' = 'gyanaksharsanskritifoundation@gmail.com'
  );

-- Enable RLS on submission_authors
ALTER TABLE submission_authors ENABLE ROW LEVEL SECURITY;

-- Allow insert when inserting submission
CREATE POLICY "Allow insert submission_authors" ON submission_authors
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow admin full access
CREATE POLICY "Allow admin full access to submission_authors" ON submission_authors
  FOR ALL
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'admin' OR 
    auth.jwt()->>'email' = 'gyanaksharsanskritifoundation@gmail.com'
  );

-- Enable RLS on contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert contact_messages" ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow admin full access
CREATE POLICY "Allow admin full access to contact_messages" ON contact_messages
  FOR ALL
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'admin' OR 
    auth.jwt()->>'email' = 'gyanaksharsanskritifoundation@gmail.com'
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for submissions table
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUBMISSION ID GENERATOR FUNCTION
-- ============================================

-- Function to generate unique submission ID
CREATE OR REPLACE FUNCTION generate_submission_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  year_part TEXT;
  sequence_part TEXT;
  counter INT;
BEGIN
  -- Get current year
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get count of submissions this year
  SELECT COUNT(*) + 1 INTO counter
  FROM submissions
  WHERE submission_id LIKE 'RJ-' || year_part || '-%';
  
  -- Format sequence with leading zeros
  sequence_part := LPAD(counter::TEXT, 4, '0');
  
  -- Combine to create ID
  new_id := 'RJ-' || year_part || '-' || sequence_part;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKETS (Manual Setup in Supabase Dashboard)
-- ============================================

-- Create these buckets in Supabase Dashboard -> Storage:
-- 1. manuscripts (for submitted manuscripts)
--    - Public: false
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- 2. published-papers (for published paper PDFs)
--    - Public: true
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf

-- 3. journal-images (for logos, editorial photos, etc.)
--    - Public: true
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Sample submission (for testing)
-- INSERT INTO submissions (
--   submission_id,
--   author_name,
--   author_email,
--   author_phone,
--   author_affiliation,
--   author_institution,
--   author_country,
--   paper_title,
--   abstract,
--   keywords,
--   status
-- ) VALUES (
--   'RJ-2026-0001',
--   'Dr. John Smith',
--   'john.smith@university.edu',
--   '+1 234 567 8900',
--   'Department of Computer Science',
--   'Stanford University',
--   'United States',
--   'Machine Learning Applications in Healthcare',
--   'This paper explores the applications of machine learning in modern healthcare systems...',
--   'Machine Learning, Healthcare, AI, Medical Diagnosis',
--   'SUBMITTED'
-- );

-- Sample co-author
-- INSERT INTO submission_authors (
--   submission_id,
--   name,
--   email,
--   affiliation,
--   institution,
--   country,
--   author_order
-- ) VALUES (
--   (SELECT id FROM submissions WHERE submission_id = 'RJ-2026-0001'),
--   'Dr. Jane Doe',
--   'jane.doe@university.edu',
--   'Department of Medicine',
--   'Stanford University',
--   'United States',
--   2
-- );

-- ============================================
-- QUERIES FOR ADMIN DASHBOARD
-- ============================================

-- Get all submissions with co-author count
-- SELECT 
--   s.*,
--   COUNT(sa.id) as coauthor_count
-- FROM submissions s
-- LEFT JOIN submission_authors sa ON s.id = sa.submission_id
-- GROUP BY s.id
-- ORDER BY s.submitted_date DESC;

-- Get submission with all co-authors
-- SELECT 
--   s.*,
--   json_agg(
--     json_build_object(
--       'name', sa.name,
--       'email', sa.email,
--       'affiliation', sa.affiliation,
--       'institution', sa.institution,
--       'country', sa.country
--     )
--   ) as coauthors
-- FROM submissions s
-- LEFT JOIN submission_authors sa ON s.id = sa.submission_id
-- WHERE s.submission_id = 'RJ-2026-0001'
-- GROUP BY s.id;

-- Get submission statistics
-- SELECT 
--   status,
--   COUNT(*) as count
-- FROM submissions
-- GROUP BY status
-- ORDER BY 
--   CASE status
--     WHEN 'SUBMITTED' THEN 1
--     WHEN 'UNDER REVIEW' THEN 2
--     WHEN 'REVISION REQUIRED' THEN 3
--     WHEN 'ACCEPTED' THEN 4
--     WHEN 'REJECTED' THEN 5
--     WHEN 'PUBLISHED' THEN 6
--   END;

-- ============================================
-- NOTES
-- ============================================

-- 1. After creating these tables, update your frontend to use them
-- 2. Implement file upload to Supabase Storage in SubmitPaper.jsx
-- 3. Update SubmissionsManager.jsx to fetch real data from Supabase
-- 4. Set up email notifications using Supabase Edge Functions or external service
-- 5. Add proper error handling and validation
-- 6. Test thoroughly before production deployment

-- ============================================
-- END OF SCHEMA
-- ============================================
