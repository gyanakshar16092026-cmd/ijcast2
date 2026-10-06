# 📄 Submission File Upload Diagnostic

## Issue Analysis
You reported that PDFs uploaded through the submission form are not showing in the admin side for download. This suggests a file storage/retrieval issue.

## Potential Causes

### 1. **Supabase Storage Bucket Missing**
The `manuscripts` bucket might not exist in your Supabase project.

### 2. **Storage Upload Failing**
Files might be failing to upload to Supabase Storage and falling back to local storage.

### 3. **File URLs Not Being Stored**
The file URLs might not be properly saved to the database.

### 4. **Local vs Cloud Storage Mix**
When Supabase fails, the system saves submissions locally but without file URLs.

## Diagnostic Steps

### Step 1: Check Supabase Storage Bucket
1. Go to your Supabase project dashboard
2. Navigate to **Storage** section
3. Check if bucket named `manuscripts` exists
4. If not, create it with these settings:
   - **Name**: `manuscripts`
   - **Public**: Yes (for download links)
   - **File size limit**: 50MB
   - **Allowed MIME types**: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Step 2: Check Storage Policies
In Supabase Storage, ensure these policies exist for the `manuscripts` bucket:
```sql
-- Allow public uploads (for submissions)
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT TO anon 
WITH CHECK (bucket_id = 'manuscripts');

-- Allow public downloads (for admin viewing)
CREATE POLICY "Allow public downloads" ON storage.objects 
FOR SELECT TO anon 
USING (bucket_id = 'manuscripts');
```

### Step 3: Test File Upload
Submit a test paper and check:
1. Browser console for any upload errors
2. Supabase Storage dashboard to see if files appear
3. Database record to see if `manuscript_file_url` is populated

### Step 4: Check Current Submissions
Look at existing submissions in the database:
- Are `manuscript_file_url`, `cover_letter_file_url`, `copyright_file_url` fields populated?
- Do the URLs point to valid Supabase Storage locations?

## Expected File Storage Flow

### Successful Upload:
```
1. User selects PDF file
2. Form submission triggers uploadSubmissionFile()
3. File uploaded to Supabase Storage bucket 'manuscripts'
4. Public URL generated: https://[project].supabase.co/storage/v1/object/public/manuscripts/[filename]
5. URL saved to database in manuscript_file_url field
6. Admin can download via this URL
```

### Failed Upload (Fallback):
```
1. User selects PDF file  
2. Supabase Storage upload fails
3. Submission still saves to database but without file URL
4. File lost (only exists in user's browser temporarily)
5. Admin sees submission but no download link
```

## Quick Fix Solutions

### Solution 1: Create Missing Bucket
If bucket doesn't exist, create it in Supabase dashboard.

### Solution 2: Fix Storage Policies  
Add the RLS policies shown above.

### Solution 3: Test Upload Manually
Try uploading a file directly in Supabase Storage to test connectivity.

### Solution 4: Check Console Errors
Look for JavaScript errors during submission that indicate storage failures.

## Files to Check

1. **Supabase Dashboard** → Storage → Buckets
2. **Database** → submissions table → file_url columns  
3. **Browser Console** → Network tab during submission
4. **SubmissionsManager.jsx** → Download link rendering

## Next Steps

1. **Verify** Supabase Storage bucket exists and is configured
2. **Test** a new submission and monitor the upload process
3. **Check** existing submissions for missing file URLs
4. **Fix** any storage configuration issues
5. **Re-test** admin download functionality

The issue is most likely that either:
- ❌ Supabase Storage bucket `manuscripts` doesn't exist
- ❌ Storage upload is failing silently
- ❌ File URLs aren't being saved to database properly

Once we identify the specific cause, we can implement the appropriate fix.