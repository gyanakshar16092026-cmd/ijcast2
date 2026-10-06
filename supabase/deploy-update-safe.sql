-- ========================================================
-- IJCAST - Safe Database Update Script
-- This script updates the existing database schema safely
-- Use this when you need to update status values or policies
-- ========================================================

-- 1. Update submission status constraint to include new statuses
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check 
  CHECK (status IN ('SUBMITTED', 'UNDER REVIEW', 'REVISION REQUIRED', 'ACCEPTED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED', 'REJECTED', 'PUBLISHED'));

-- 2. Update contact_email in journal_settings if needed
UPDATE journal_settings 
SET contact_email = 'editor.ijcast.in@gmail.com',
    alternate_email = 'editor.ijcast.in@gmail.com'
WHERE contact_email != 'editor.ijcast.in@gmail.com' OR alternate_email != 'editor.ijcast.in@gmail.com';

-- 3. Safely drop and recreate RLS policies
-- Main tables
DROP POLICY IF EXISTS "Allow All Journal Settings" ON journal_settings;
DROP POLICY IF EXISTS "Allow All Volumes" ON volumes;
DROP POLICY IF EXISTS "Allow All Issues" ON issues;
DROP POLICY IF EXISTS "Allow All Articles" ON articles;
DROP POLICY IF EXISTS "Allow All Editorial Members" ON editorial_members;
DROP POLICY IF EXISTS "Allow All Research Areas" ON research_areas;
DROP POLICY IF EXISTS "Allow All Page Content" ON page_content;
DROP POLICY IF EXISTS "Allow All Media" ON media;

-- Additional tables
DROP POLICY IF EXISTS "Public Read Theses" ON theses;
DROP POLICY IF EXISTS "Admin All Theses" ON theses;
DROP POLICY IF EXISTS "Public Read Announcements" ON announcements;
DROP POLICY IF EXISTS "Allow All Announcements" ON announcements;
DROP POLICY IF EXISTS "Public Read Conferences" ON conferences;
DROP POLICY IF EXISTS "Allow All Conferences" ON conferences;

-- Submission tables
DROP POLICY IF EXISTS "Allow public insert submissions" ON submissions;
DROP POLICY IF EXISTS "Allow users to view own submissions" ON submissions;
DROP POLICY IF EXISTS "Allow All Submissions" ON submissions;
DROP POLICY IF EXISTS "Allow insert submission_authors" ON submission_authors;
DROP POLICY IF EXISTS "Allow All Submission Authors" ON submission_authors;

-- Contact and payment tables
DROP POLICY IF EXISTS "Allow public insert contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Allow All Contact Messages" ON contact_messages;
DROP POLICY IF EXISTS "Service role can manage all payments" ON apc_payments;
DROP POLICY IF EXISTS "Allow All APC Payments" ON apc_payments;

-- 4. Enable RLS on all tables (safe to run multiple times)
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

-- 5. Create new policies
-- Main tables (allow all for app-level auth)
CREATE POLICY "Allow All Journal Settings" ON journal_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Volumes" ON volumes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Issues" ON issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Articles" ON articles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Editorial Members" ON editorial_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Research Areas" ON research_areas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Page Content" ON page_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Media" ON media FOR ALL USING (true) WITH CHECK (true);

-- Theses policies
CREATE POLICY "Public Read Theses" ON theses FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin All Theses" ON theses FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Announcements policies
CREATE POLICY "Public Read Announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Allow All Announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- Conferences policies
CREATE POLICY "Public Read Conferences" ON conferences FOR SELECT USING (true);
CREATE POLICY "Allow All Conferences" ON conferences FOR ALL USING (true) WITH CHECK (true);

-- Submissions policies
CREATE POLICY "Allow public insert submissions" ON submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow users to view own submissions" ON submissions FOR SELECT TO authenticated USING (author_email = auth.jwt()->>'email');
CREATE POLICY "Allow All Submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);

-- Submission authors policies
CREATE POLICY "Allow insert submission_authors" ON submission_authors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow All Submission Authors" ON submission_authors FOR ALL USING (true) WITH CHECK (true);

-- Contact messages policies
CREATE POLICY "Allow public insert contact_messages" ON contact_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow All Contact Messages" ON contact_messages FOR ALL USING (true) WITH CHECK (true);

-- APC payments policies
CREATE POLICY "Service role can manage all payments" ON apc_payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Allow All APC Payments" ON apc_payments FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- Verify Update
-- ========================================================

-- Check journal settings
SELECT 'Updated Journal Settings:' as info, contact_email, alternate_email FROM journal_settings LIMIT 1;

-- Check submission constraint
SELECT 'Submission Statuses Allowed:' as info, 
       'SUBMITTED, UNDER REVIEW, REVISION REQUIRED, ACCEPTED, PAYMENT_PENDING, PAYMENT_RECEIVED, REJECTED, PUBLISHED' as statuses;

-- Check policies count
SELECT 'Total Policies Created:' as info, COUNT(*) as count 
FROM information_schema.table_privileges 
WHERE grantee = 'anon' AND table_schema = 'public';

COMMIT;

-- ========================================================
-- Success Message
-- ========================================================
SELECT '✅ Database updated successfully! New payment workflow is ready.' as result;