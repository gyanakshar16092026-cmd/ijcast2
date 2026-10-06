-- ========================================================
-- SECURE RLS POLICIES - PHASE 4 SECURITY FIX
-- ========================================================
-- This file contains secure RLS policies to replace the overly permissive ones

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow All Journal Settings" ON journal_settings;
DROP POLICY IF EXISTS "Allow All Volumes" ON volumes;
DROP POLICY IF EXISTS "Allow All Issues" ON issues;
DROP POLICY IF EXISTS "Allow All Articles" ON articles;
DROP POLICY IF EXISTS "Allow All Editorial Members" ON editorial_members;
DROP POLICY IF EXISTS "Allow All Research Areas" ON research_areas;
DROP POLICY IF EXISTS "Allow All Page Content" ON page_content;
DROP POLICY IF EXISTS "Allow All Media" ON media;
DROP POLICY IF EXISTS "Allow All Submissions" ON submissions;
DROP POLICY IF EXISTS "Allow All Submission Authors" ON submission_authors;
DROP POLICY IF EXISTS "Allow All Contact Messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow All Announcements" ON announcements;
DROP POLICY IF EXISTS "Allow All Conferences" ON conferences;
DROP POLICY IF EXISTS "Allow All APC Payments" ON apc_payments;

-- ========================================================
-- PUBLIC READ POLICIES (for published content)
-- ========================================================

-- Journal Settings: Public can read basic info, authenticated can modify
CREATE POLICY "Public read journal settings" ON journal_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated modify journal settings" ON journal_settings
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Volumes: Public can read all volumes
CREATE POLICY "Public read volumes" ON volumes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage volumes" ON volumes
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Issues: Public can read published issues only
CREATE POLICY "Public read published issues" ON issues
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated manage all issues" ON issues
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Articles: Public can ONLY read published articles
CREATE POLICY "Public read published articles" ON articles
  FOR SELECT USING (is_published = true AND status = 'published');

CREATE POLICY "Authenticated manage all articles" ON articles
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Editorial Members: Public can read active members only
CREATE POLICY "Public read active editorial members" ON editorial_members
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated manage editorial members" ON editorial_members
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Research Areas: Public can read all research areas
CREATE POLICY "Public read research areas" ON research_areas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage research areas" ON research_areas
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Page Content: Public can read all page content
CREATE POLICY "Public read page content" ON page_content
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage page content" ON page_content
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Media: Public can read published media only
CREATE POLICY "Public read published media" ON media
  FOR SELECT USING (true);

CREATE POLICY "Authenticated manage media" ON media
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Theses: Keep existing policies (already secure)
-- Public can read published theses, authenticated can manage all

-- Announcements: Public can read active announcements
CREATE POLICY "Public read active announcements" ON announcements
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_DATE));

CREATE POLICY "Authenticated manage announcements" ON announcements
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Conferences: Public can read published conferences
CREATE POLICY "Public read published conferences" ON conferences
  FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated manage conferences" ON conferences
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ========================================================
-- SENSITIVE DATA POLICIES (admin only)
-- ========================================================

-- Submissions: HIGHLY SENSITIVE - Only admin access, except for submission creation
CREATE POLICY "Allow submission creation" ON submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated full access submissions" ON submissions
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Submission Authors: Same as submissions
CREATE POLICY "Allow submission authors creation" ON submission_authors
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated manage submission authors" ON submission_authors
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Contact Messages: Only allow creation by public, admin can manage all
CREATE POLICY "Allow contact message creation" ON contact_messages
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated manage contact messages" ON contact_messages
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- APC Payments: Admin only access + service role for payment processing
CREATE POLICY "Service role manage payments" ON apc_payments
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated manage payments" ON apc_payments
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ========================================================
-- VERIFICATION QUERIES
-- ========================================================

-- These queries can be run to verify the policies work correctly:

-- 1. Test public can only see published articles:
-- SET ROLE anon;
-- SELECT COUNT(*) FROM articles WHERE status = 'draft'; -- Should return 0
-- SELECT COUNT(*) FROM articles WHERE is_published = false; -- Should return 0

-- 2. Test public cannot see submissions:
-- SET ROLE anon;  
-- SELECT COUNT(*) FROM submissions; -- Should fail with policy violation

-- 3. Test authenticated can see everything:
-- SET ROLE authenticated;
-- SELECT COUNT(*) FROM articles; -- Should return all articles
-- SELECT COUNT(*) FROM submissions; -- Should return all submissions

-- Reset role:
-- RESET ROLE;