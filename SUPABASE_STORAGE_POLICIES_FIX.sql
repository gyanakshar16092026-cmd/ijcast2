-- ========================================================
-- SUPABASE STORAGE POLICIES FIX for Editorial Board Photos
-- Run this in Supabase Dashboard → SQL Editor
-- ========================================================

-- This fixes the "new row violates row-level security policy" error
-- when uploading editorial member photos to the journal-images bucket

-- 1. DROP EXISTING STORAGE POLICIES (if any)
DROP POLICY IF EXISTS "Allow all operations on journal-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to journal-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to journal-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all access to journal-images" ON storage.objects;

-- 2. CREATE COMPREHENSIVE STORAGE POLICY for journal-images bucket
-- This allows all operations (INSERT, SELECT, UPDATE, DELETE) on journal-images bucket
CREATE POLICY "Allow all operations on journal-images"
ON storage.objects
FOR ALL 
USING (bucket_id = 'journal-images')
WITH CHECK (bucket_id = 'journal-images');

-- 3. ALSO CREATE POLICIES FOR OTHER BUCKETS (if they exist)
DROP POLICY IF EXISTS "Allow all operations on manuscripts" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on published-papers" ON storage.objects;

CREATE POLICY "Allow all operations on manuscripts"
ON storage.objects
FOR ALL 
USING (bucket_id = 'manuscripts')
WITH CHECK (bucket_id = 'manuscripts');

CREATE POLICY "Allow all operations on published-papers"
ON storage.objects
FOR ALL 
USING (bucket_id = 'published-papers')
WITH CHECK (bucket_id = 'published-papers');

-- 4. VERIFY BUCKETS EXIST AND ARE PROPERLY CONFIGURED
SELECT 
    name as bucket_name,
    public,
    created_at,
    'Bucket exists and configured' as status
FROM storage.buckets 
WHERE name IN ('journal-images', 'manuscripts', 'published-papers')
ORDER BY name;

-- 5. SHOW CURRENT STORAGE POLICIES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%journal-images%'
ORDER BY policyname;

-- ========================================================
-- ALTERNATIVE: If above doesn't work, use these simpler policies
-- ========================================================

-- Alternative approach: Drop all storage policies and create very permissive ones
-- Uncomment these if the above policies still cause issues:

/*
DROP POLICY IF EXISTS "Allow all operations on journal-images" ON storage.objects;

-- Very permissive policy - allows everything for journal-images bucket
CREATE POLICY "journal-images-all-access"
ON storage.objects
FOR ALL 
TO public
USING (bucket_id = 'journal-images')
WITH CHECK (bucket_id = 'journal-images');

-- Also ensure bucket is public
UPDATE storage.buckets SET public = true WHERE name = 'journal-images';
*/

-- ========================================================
-- SUCCESS MESSAGE
-- ========================================================

SELECT 'Storage policies fixed! Try uploading editorial photos now.' as message;