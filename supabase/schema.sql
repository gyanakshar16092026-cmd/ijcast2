-- ========================================================
-- IJCAST - International Journal of Commerce, Arts, Science and Technology
-- Complete Supabase Database Schema & Storage Setup
-- ISSN: 2394-9007
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. JOURNAL SETTINGS TABLE
CREATE TABLE IF NOT EXISTS journal_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_name TEXT NOT NULL DEFAULT 'International Journal of Commerce, Arts, Science and Technology',
  short_name TEXT NOT NULL DEFAULT 'IJCAST',
  issn TEXT DEFAULT 'ISSN 2394-9007',
  eissn TEXT DEFAULT 'e-ISSN 2394-9007',
  doi_prefix TEXT DEFAULT '10.5281/ijcast',
  publisher TEXT DEFAULT 'IJCAST Publishing House',
  publication_frequency TEXT DEFAULT 'Bi-Monthly (6 Issues / Year)',
  language TEXT DEFAULT 'English',
  contact_email TEXT DEFAULT 'editor@ijcast.in',
  alternate_email TEXT DEFAULT 'editor.ijcast.in@gmail.com',
  phone TEXT DEFAULT '+91 98765 43210',
  postal_address TEXT DEFAULT 'IJCAST Editorial Office, Academic Research Complex, Suite 402, New Delhi, India',
  copyright_statement TEXT DEFAULT 'Copyright © IJCAST. All rights reserved. Authors retain full publication rights.',
  license_name TEXT DEFAULT 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
  license_url TEXT DEFAULT 'https://creativecommons.org/licenses/by/4.0/',
  is_open_access BOOLEAN DEFAULT false,
  open_access_statement TEXT DEFAULT 'All published articles are freely available online immediately upon publication without subscription charges.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VOLUMES TABLE
CREATE TABLE IF NOT EXISTS volumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volume_number INT NOT NULL,
  year INT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ISSUES TABLE
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volume_id UUID REFERENCES volumes(id) ON DELETE CASCADE,
  issue_number INT NOT NULL,
  month_range TEXT NOT NULL, -- e.g. 'January - February'
  year INT NOT NULL,
  pub_date DATE DEFAULT CURRENT_DATE,
  cover_url TEXT,
  editorial_note TEXT,
  is_published BOOLEAN DEFAULT false, -- Issue publishing workflow
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBMISSIONS TABLE (Must be before articles for FK reference)
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
  status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'REVISION REQUIRED', 'ACCEPTED', 'REJECTED', 'PUBLISHED')),
  
  -- Dates
  submitted_date TIMESTAMPTZ DEFAULT NOW(),
  reviewed_date TIMESTAMPTZ,
  accepted_date TIMESTAMPTZ,
  published_date TIMESTAMPTZ,
  
  -- Admin Management
  internal_notes TEXT,
  assigned_to UUID, -- Can reference users table if you add it
  reviewer_comments TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBMISSION AUTHORS (CO-AUTHORS)
CREATE TABLE IF NOT EXISTS submission_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  affiliation TEXT,
  institution TEXT,
  country TEXT,
  author_order INT DEFAULT 1, -- 1 = primary (usually stored in submissions table), 2+ = co-authors
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL, -- Link to submission
  title TEXT NOT NULL,
  authors JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { name, affiliation, email, orcid, is_corresponding }
  corresponding_author TEXT,
  corresponding_author_email TEXT,
  orcids JSONB DEFAULT '[]'::jsonb,
  abstract TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  research_area TEXT NOT NULL,
  article_type TEXT DEFAULT 'Research Paper', -- 'Research Paper', 'Review Article', 'Case Study', 'Short Communication'
  
  -- Paper Status Workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'published')),
  
  received_date DATE,
  revised_date DATE,
  accepted_date DATE,
  published_date DATE DEFAULT CURRENT_DATE,
  doi TEXT, -- e.g. '10.5281/ijcast.2026.101'
  page_numbers TEXT, -- e.g. '1-14'
  references TEXT,
  pdf_url TEXT, -- Supabase Storage URL
  html_content TEXT,
  sort_order INT DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  views_count INT DEFAULT 0, -- For statistics
  downloads_count INT DEFAULT 0, -- For statistics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'READ', 'RESPONDED', 'ARCHIVED')),
  admin_notes TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID, -- Can reference users table
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EDITORIAL MEMBERS TABLE
CREATE TABLE IF NOT EXISTS editorial_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Editor-in-Chief', 'Associate Editor', 'Editorial Board Member')),
  designation TEXT,
  institution TEXT NOT NULL,
  department TEXT,
  country TEXT NOT NULL,
  email TEXT,
  orcid TEXT,
  photo_url TEXT,
  bio TEXT,
  research_area TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RESEARCH AREAS TABLE
CREATE TABLE IF NOT EXISTS research_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL UNIQUE,
  subcategories TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 1
);

-- 10. PAGE CONTENT TABLE (CMS FOR STATIC SECTIONS)
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT NOT NULL, -- 'about', 'ethics', 'apc', 'contact', 'privacy', 'copyright', 'home', 'other'
  section_key TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_key, section_key)
);

-- 11. MEDIA TABLE
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('pdf', 'image')),
  file_size BIGINT,
  url TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE journal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Allow ALL operations for everyone (anon + authenticated)
-- This app uses a single admin with app-level auth, not Supabase Auth
CREATE POLICY "Allow All Journal Settings" ON journal_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Volumes" ON volumes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Issues" ON issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Articles" ON articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Editorial Members" ON editorial_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Research Areas" ON research_areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Page Content" ON page_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Media" ON media FOR ALL USING (true) WITH CHECK (true);

-- 12. THESES TABLE
CREATE TABLE IF NOT EXISTS theses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  degree_type TEXT NOT NULL CHECK (degree_type IN ('PhD', 'M.Tech', 'M.Phil', 'M.Sc', 'MBA')),
  title TEXT NOT NULL,
  scholar_name TEXT NOT NULL,
  guide_names JSONB DEFAULT '[]'::jsonb,   -- Array of guide/supervisor name strings
  university TEXT NOT NULL,
  stream TEXT NOT NULL,
  year INT NOT NULL,
  abstract TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,      -- Array of keyword strings
  pdf_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE theses ENABLE ROW LEVEL SECURITY;

-- Public can read published theses
CREATE POLICY "Public Read Theses" ON theses FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

-- Authenticated users (admins) can do all operations
CREATE POLICY "Admin All Theses" ON theses FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 13. ANNOUNCEMENTS TABLE (Newsflash banner on home page)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('call_for_papers', 'new_issue', 'indexing', 'general')),
  expires_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read active announcements
CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);

-- Anon key can do all operations (app-level auth)
CREATE POLICY "Allow All Announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- 14. CONFERENCES TABLE
CREATE TABLE IF NOT EXISTS conferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  conference_date DATE,
  end_date DATE,
  venue TEXT,
  research_areas JSONB DEFAULT '[]'::jsonb,   -- Array of theme strings
  num_papers INT DEFAULT 0,
  paper_titles JSONB DEFAULT '[]'::jsonb,     -- Array of paper title strings
  proceedings_pdf_url TEXT,
  report_pdf_url TEXT,
  website_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Conferences" ON conferences FOR SELECT USING (true);
CREATE POLICY "Allow All Conferences" ON conferences FOR ALL USING (true) WITH CHECK (true);

-- 15. APC PAYMENTS TABLE (Article Processing Charges)
CREATE TABLE IF NOT EXISTS apc_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  cashfree_order_id VARCHAR(255),
  cashfree_payment_id VARCHAR(255),
  
  -- Author Information
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_phone VARCHAR(20) NOT NULL,
  manuscript_id VARCHAR(100) NOT NULL,
  
  -- Payment Details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  payment_method VARCHAR(100),
  
  -- GASF Membership
  gasf_membership VARCHAR(50),
  is_member BOOLEAN DEFAULT FALSE,
  discount_applied INTEGER DEFAULT 0, -- Percentage
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apc_payments_order_id ON apc_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_apc_payments_cashfree_order_id ON apc_payments(cashfree_order_id);
CREATE INDEX IF NOT EXISTS idx_apc_payments_author_email ON apc_payments(author_email);
CREATE INDEX IF NOT EXISTS idx_apc_payments_manuscript_id ON apc_payments(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_apc_payments_status ON apc_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_apc_payments_created_at ON apc_payments(created_at);

-- Create updated_at trigger for APC payments
CREATE OR REPLACE TRIGGER update_apc_payments_updated_at
    BEFORE UPDATE ON apc_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies (Row Level Security)
ALTER TABLE apc_payments ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access for backend)
CREATE POLICY "Service role can manage all payments" ON apc_payments
  FOR ALL USING (auth.role() = 'service_role');

-- Policy for anon key (app-level auth)
CREATE POLICY "Allow All APC Payments" ON apc_payments FOR ALL USING (true) WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE apc_payments IS 'Store APC (Article Processing Charge) payment records for IJCAST journal';
COMMENT ON COLUMN apc_payments.order_id IS 'Unique order identifier generated by the application';
COMMENT ON COLUMN apc_payments.cashfree_order_id IS 'Order ID returned by Cashfree payment gateway';
COMMENT ON COLUMN apc_payments.cashfree_payment_id IS 'Payment ID returned by Cashfree after successful payment';
COMMENT ON COLUMN apc_payments.payment_status IS 'Payment status: INITIATED, PENDING, SUCCESS, FAILED, CANCELLED';
COMMENT ON COLUMN apc_payments.gasf_membership IS 'GASF membership number for discount eligibility';
COMMENT ON COLUMN apc_payments.discount_applied IS 'Discount percentage applied (40% for GASF members)';
COMMENT ON COLUMN apc_payments.metadata IS 'Additional data including payment details, calculations, etc.';

-- ========================================================
-- HELPER FUNCTIONS
-- ========================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at columns
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================================
-- SUBMISSION ID GENERATOR FUNCTION
-- ========================================================

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

-- ========================================================
-- PERFORMANCE INDEXES
-- ========================================================

-- Volumes indexes
CREATE INDEX IF NOT EXISTS idx_volumes_year ON volumes(year);
CREATE INDEX IF NOT EXISTS idx_volumes_status ON volumes(status);

-- Issues indexes
CREATE INDEX IF NOT EXISTS idx_issues_volume_id ON issues(volume_id);
CREATE INDEX IF NOT EXISTS idx_issues_year ON issues(year);
CREATE INDEX IF NOT EXISTS idx_issues_is_published ON issues(is_published);

-- Articles indexes
CREATE INDEX IF NOT EXISTS idx_articles_issue_id ON articles(issue_id);
CREATE INDEX IF NOT EXISTS idx_articles_submission_id ON articles(submission_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_research_area ON articles(research_area);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_keywords ON articles USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_articles_authors ON articles USING GIN (authors);
CREATE INDEX IF NOT EXISTS idx_articles_fulltext ON articles USING GIN (to_tsvector('english', title || ' ' || abstract));

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_submission_id ON submissions(submission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_date ON submissions(submitted_date DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_author_email ON submissions(author_email);

-- Submission authors indexes
CREATE INDEX IF NOT EXISTS idx_submission_authors_submission_id ON submission_authors(submission_id);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Editorial members indexes
CREATE INDEX IF NOT EXISTS idx_editorial_members_role ON editorial_members(role);
CREATE INDEX IF NOT EXISTS idx_editorial_members_is_active ON editorial_members(is_active);

-- ========================================================
-- ADDITIONAL RLS POLICIES FOR NEW TABLES
-- ========================================================

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

-- Allow admin full access
CREATE POLICY "Allow All Submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on submission_authors
ALTER TABLE submission_authors ENABLE ROW LEVEL SECURITY;

-- Allow insert when inserting submission
CREATE POLICY "Allow insert submission_authors" ON submission_authors
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow admin full access
CREATE POLICY "Allow All Submission Authors" ON submission_authors FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert contact_messages" ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow admin full access
CREATE POLICY "Allow All Contact Messages" ON contact_messages FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- STORAGE BUCKETS SETUP INSTRUCTIONS
-- ========================================================

-- Create these buckets in Supabase Dashboard -> Storage:

-- 1. manuscripts (for submitted manuscripts)
--    - Public: false (private - only accessible by admin)
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
--    - Path: manuscripts/{submission_id}/{filename}

-- 2. published-papers (for published paper PDFs)
--    - Public: true
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf
--    - Path: published-papers/{year}/{volume}/{issue}/{article_id}.pdf

-- 3. journal-images (for logos, editorial photos, issue covers)
--    - Public: true
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--    - Path: journal-images/{type}/{filename}

-- ========================================================
-- END OF SCHEMA
-- ========================================================