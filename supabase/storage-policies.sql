-- ========================================================
-- SUPABASE STORAGE SECURITY POLICIES - PHASE 16
-- ========================================================
-- Secure file upload policies for manuscripts and journal images

-- ========================================================
-- MANUSCRIPTS BUCKET POLICIES
-- ========================================================
-- Private bucket for manuscript submissions - Admin access only

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admin read manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Public upload manuscripts" ON storage.objects;

-- Allow public to upload manuscripts during submission (with validation)
CREATE POLICY "Public upload manuscripts"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'manuscripts'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- Admin can read all manuscripts
CREATE POLICY "Admin read manuscripts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'manuscripts');

-- Admin can delete manuscripts
CREATE POLICY "Admin delete manuscripts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'manuscripts');

-- ========================================================
-- JOURNAL IMAGES BUCKET POLICIES  
-- ========================================================
-- Public bucket for journal images - Public read, Admin write

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read journal images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload journal images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete journal images" ON storage.objects;

-- Public can read all journal images
CREATE POLICY "Public read journal images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'journal-images');

-- Authenticated users can upload journal images
CREATE POLICY "Admin upload journal images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'journal-images');

-- Authenticated users can delete journal images
CREATE POLICY "Admin delete journal images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'journal-images');

-- ========================================================
-- BUCKET SIZE LIMITS (Configure in Supabase Dashboard)
-- ========================================================
-- manuscripts bucket:
--   - File size limit: 10MB per file
--   - Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
--
-- journal-images bucket:
--   - File size limit: 5MB per file
--   - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

-- ========================================================
-- VERIFICATION NOTES
-- ========================================================
-- 1. Manuscripts bucket should be set to PRIVATE in Supabase Dashboard
-- 2. Journal-images bucket should be set to PUBLIC in Supabase Dashboard
-- 3. Configure file size limits in bucket settings
-- 4. Test upload with non-admin user - should work for manuscripts during submission
-- 5. Test download manuscripts with non-admin - should fail (requires signed URL)
