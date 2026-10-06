-- ========================================================
-- IJCAST - Clean Database Deployment
-- ISSN: 2394-9007
-- This script safely drops and recreates all database objects
-- ========================================================

-- Drop existing triggers first (to avoid "already exists" errors)
-- Note: These may fail if tables don't exist yet, which is fine
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
  DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
  DROP TRIGGER IF EXISTS update_apc_payments_updated_at ON apc_payments;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_submission_id() CASCADE;

-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS apc_payments CASCADE;
DROP TABLE IF EXISTS submission_authors CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS volumes CASCADE;
DROP TABLE IF EXISTS theses CASCADE;
DROP TABLE IF EXISTS conferences CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS editorial_members CASCADE;
DROP TABLE IF EXISTS research_areas CASCADE;
DROP TABLE IF EXISTS page_content CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS journal_settings CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- CREATE TABLES
-- ========================================================

-- 1. JOURNAL SETTINGS TABLE
CREATE TABLE journal_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_name TEXT NOT NULL DEFAULT 'International Journal of Commerce, Arts, Science and Technology',
  short_name TEXT NOT NULL DEFAULT 'IJCAST',
  issn TEXT DEFAULT 'ISSN 2394-9007',
  eissn TEXT DEFAULT 'e-ISSN 2394-9007',
  doi_prefix TEXT DEFAULT '10.5281/ijcast',
  publisher TEXT DEFAULT 'IJCAST Publishing House',
  publication_frequency TEXT DEFAULT 'Bi-Monthly (6 Issues / Year)',
  language TEXT DEFAULT 'English',
  contact_email TEXT DEFAULT 'editor.ijcast.in@gmail.com',
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
CREATE TABLE volumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volume_number INT NOT NULL,
  year INT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ISSUES TABLE
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volume_id UUID REFERENCES volumes(id) ON DELETE CASCADE,
  issue_number INT NOT NULL,
  month_range TEXT NOT NULL,
  year INT NOT NULL,
  pub_date DATE DEFAULT CURRENT_DATE,
  cover_url TEXT,
  editorial_note TEXT,
  is_published BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBMISSIONS TABLE (before articles for FK reference)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id TEXT UNIQUE NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_phone TEXT,
  author_affiliation TEXT,
  author_institution TEXT,
  author_country TEXT,
  paper_title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT NOT NULL,
  manuscript_file_url TEXT,
  manuscript_filename TEXT,
  cover_letter_file_url TEXT,
  cover_letter_filename TEXT,
  copyright_file_url TEXT,
  copyright_filename TEXT,
  status TEXT DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'REVISION REQUIRED', 'ACCEPTED', 'REJECTED', 'PUBLISHED')),
  submitted_date TIMESTAMPTZ DEFAULT NOW(),
  reviewed_date TIMESTAMPTZ,
  accepted_date TIMESTAMPTZ,
  published_date TIMESTAMPTZ,
  internal_notes TEXT,
  assigned_to UUID,
  reviewer_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBMISSION AUTHORS (CO-AUTHORS)
CREATE TABLE submission_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  affiliation TEXT,
  institution TEXT,
  country TEXT,
  author_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ARTICLES TABLE
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  submission_id UUID REFERENCES submissions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  authors JSONB NOT NULL DEFAULT '[]'::jsonb,
  corresponding_author TEXT,
  corresponding_author_email TEXT,
  orcids JSONB DEFAULT '[]'::jsonb,
  abstract TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  research_area TEXT NOT NULL,
  article_type TEXT DEFAULT 'Research Paper',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'published')),
  received_date DATE,
  revised_date DATE,
  accepted_date DATE,
  published_date DATE DEFAULT CURRENT_DATE,
  doi TEXT,
  page_numbers TEXT,
  article_references TEXT,
  pdf_url TEXT,
  html_content TEXT,
  sort_order INT DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  views_count INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CONTACT MESSAGES
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'READ', 'RESPONDED', 'ARCHIVED')),
  admin_notes TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. EDITORIAL MEMBERS TABLE
CREATE TABLE editorial_members (
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
CREATE TABLE research_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL UNIQUE,
  subcategories TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 1
);

-- 10. PAGE CONTENT TABLE
CREATE TABLE page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_key, section_key)
);

-- 11. MEDIA TABLE
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('pdf', 'image')),
  file_size BIGINT,
  url TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. THESES TABLE
CREATE TABLE theses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  degree_type TEXT NOT NULL CHECK (degree_type IN ('PhD', 'M.Tech', 'M.Phil', 'M.Sc', 'MBA')),
  title TEXT NOT NULL,
  scholar_name TEXT NOT NULL,
  guide_names JSONB DEFAULT '[]'::jsonb,
  university TEXT NOT NULL,
  stream TEXT NOT NULL,
  year INT NOT NULL,
  abstract TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  pdf_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ANNOUNCEMENTS TABLE
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('call_for_papers', 'new_issue', 'indexing', 'general')),
  expires_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CONFERENCES TABLE
CREATE TABLE conferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  conference_date DATE,
  end_date DATE,
  venue TEXT,
  research_areas JSONB DEFAULT '[]'::jsonb,
  num_papers INT DEFAULT 0,
  paper_titles JSONB DEFAULT '[]'::jsonb,
  proceedings_pdf_url TEXT,
  report_pdf_url TEXT,
  website_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. APC PAYMENTS TABLE
CREATE TABLE apc_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  cashfree_order_id VARCHAR(255),
  cashfree_payment_id VARCHAR(255),
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  author_phone VARCHAR(20) NOT NULL,
  manuscript_id VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  payment_method VARCHAR(100),
  gasf_membership VARCHAR(50),
  is_member BOOLEAN DEFAULT FALSE,
  discount_applied INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- CREATE FUNCTIONS
-- ========================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique submission ID
CREATE OR REPLACE FUNCTION generate_submission_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  year_part TEXT;
  sequence_part TEXT;
  counter INT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO counter
  FROM submissions
  WHERE submission_id LIKE 'RJ-' || year_part || '-%';
  sequence_part := LPAD(counter::TEXT, 4, '0');
  new_id := 'RJ-' || year_part || '-' || sequence_part;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================================
-- CREATE TRIGGERS
-- ========================================================

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apc_payments_updated_at
  BEFORE UPDATE ON apc_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================================
-- CREATE INDEXES
-- ========================================================

-- Volumes indexes
CREATE INDEX idx_volumes_year ON volumes(year);
CREATE INDEX idx_volumes_status ON volumes(status);

-- Issues indexes
CREATE INDEX idx_issues_volume_id ON issues(volume_id);
CREATE INDEX idx_issues_year ON issues(year);
CREATE INDEX idx_issues_is_published ON issues(is_published);

-- Articles indexes
CREATE INDEX idx_articles_issue_id ON articles(issue_id);
CREATE INDEX idx_articles_submission_id ON articles(submission_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_research_area ON articles(research_area);
CREATE INDEX idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_articles_keywords ON articles USING GIN (keywords);
CREATE INDEX idx_articles_authors ON articles USING GIN (authors);
CREATE INDEX idx_articles_fulltext ON articles USING GIN (to_tsvector('english', title || ' ' || abstract));

-- Submissions indexes
CREATE INDEX idx_submissions_submission_id ON submissions(submission_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_date ON submissions(submitted_date DESC);
CREATE INDEX idx_submissions_author_email ON submissions(author_email);

-- Submission authors indexes
CREATE INDEX idx_submission_authors_submission_id ON submission_authors(submission_id);

-- Contact messages indexes
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Editorial members indexes
CREATE INDEX idx_editorial_members_role ON editorial_members(role);
CREATE INDEX idx_editorial_members_is_active ON editorial_members(is_active);

-- APC Payments indexes
CREATE INDEX idx_apc_payments_order_id ON apc_payments(order_id);
CREATE INDEX idx_apc_payments_cashfree_order_id ON apc_payments(cashfree_order_id);
CREATE INDEX idx_apc_payments_author_email ON apc_payments(author_email);
CREATE INDEX idx_apc_payments_manuscript_id ON apc_payments(manuscript_id);
CREATE INDEX idx_apc_payments_status ON apc_payments(payment_status);
CREATE INDEX idx_apc_payments_created_at ON apc_payments(created_at);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================================

ALTER TABLE journal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE theses ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE apc_payments ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- CREATE RLS POLICIES (Allow all for app-level auth)
-- ========================================================

-- Journal Settings
CREATE POLICY "Allow All Journal Settings" ON journal_settings FOR ALL USING (true) WITH CHECK (true);

-- Volumes
CREATE POLICY "Allow All Volumes" ON volumes FOR ALL USING (true) WITH CHECK (true);

-- Issues
CREATE POLICY "Allow All Issues" ON issues FOR ALL USING (true) WITH CHECK (true);

-- Articles
CREATE POLICY "Allow All Articles" ON articles FOR ALL USING (true) WITH CHECK (true);

-- Editorial Members
CREATE POLICY "Allow All Editorial Members" ON editorial_members FOR ALL USING (true) WITH CHECK (true);

-- Research Areas
CREATE POLICY "Allow All Research Areas" ON research_areas FOR ALL USING (true) WITH CHECK (true);

-- Page Content
CREATE POLICY "Allow All Page Content" ON page_content FOR ALL USING (true) WITH CHECK (true);

-- Media
CREATE POLICY "Allow All Media" ON media FOR ALL USING (true) WITH CHECK (true);

-- Theses
CREATE POLICY "Allow All Theses" ON theses FOR ALL USING (true) WITH CHECK (true);

-- Announcements
CREATE POLICY "Allow All Announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- Conferences
CREATE POLICY "Allow All Conferences" ON conferences FOR ALL USING (true) WITH CHECK (true);

-- Submissions
CREATE POLICY "Allow All Submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);

-- Submission Authors
CREATE POLICY "Allow All Submission Authors" ON submission_authors FOR ALL USING (true) WITH CHECK (true);

-- Contact Messages
CREATE POLICY "Allow All Contact Messages" ON contact_messages FOR ALL USING (true) WITH CHECK (true);

-- APC Payments
CREATE POLICY "Allow All APC Payments" ON apc_payments FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- DEPLOYMENT COMPLETE
-- ========================================================

-- Now create storage buckets in Supabase Dashboard:
-- 1. manuscripts (public: false, 10MB limit)
-- 2. published-papers (public: true, 10MB limit)
-- 3. journal-images (public: true, 5MB limit)
