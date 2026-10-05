# Supabase Storage Buckets Setup Guide

## Quick Setup (5 Minutes)

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your IJCAST project
3. Click **Storage** in the left sidebar

---

### Step 2: Create `manuscripts` Bucket (Private)

**Purpose:** Store submitted manuscripts (not publicly accessible)

1. Click **"New bucket"** button
2. Fill in details:
   ```
   Name: manuscripts
   Public: ❌ UNCHECK (keep private)
   File size limit: 10485760 (10MB in bytes)
   Allowed MIME types: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
   ```
3. Click **"Create bucket"**

**Folder Structure:**
```
manuscripts/
  ├── RJ-2025-0001-manuscript.pdf
  ├── RJ-2025-0001-cover-letter.pdf
  ├── RJ-2025-0001-copyright.pdf
  ├── RJ-2025-0002-manuscript.pdf
  └── ...
```

---

### Step 3: Create `published-papers` Bucket (Public)

**Purpose:** Store published article PDFs (publicly accessible)

1. Click **"New bucket"** button
2. Fill in details:
   ```
   Name: published-papers
   Public: ✅ CHECK (make public)
   File size limit: 10485760 (10MB in bytes)
   Allowed MIME types: application/pdf
   ```
3. Click **"Create bucket"**

**Folder Structure:**
```
published-papers/
  ├── 1234567890-Paper_Title.pdf
  ├── 1234567891-Another_Paper.pdf
  └── ...
```

---

### Step 4: Create `journal-images` Bucket (Public)

**Purpose:** Store logos, editorial photos, issue covers

1. Click **"New bucket"** button
2. Fill in details:
   ```
   Name: journal-images
   Public: ✅ CHECK (make public)
   File size limit: 5242880 (5MB in bytes)
   Allowed MIME types: image/jpeg, image/png, image/webp
   ```
3. Click **"Create bucket"**

**Folder Structure:**
```
journal-images/
  ├── editorial/
  │   ├── 1640995200000.jpg (Dr. Smith photo)
  │   └── 1640995300000.png (Dr. Jones photo)
  ├── covers/
  │   ├── vol-1-issue-1.jpg
  │   └── vol-1-issue-2.jpg
  └── logos/
      └── ijcast-logo.png
```

---

### Step 5: Set Storage Policies

#### For `manuscripts` Bucket:

Go to **Storage** > **manuscripts** > **Policies** tab

**Policy 1: Allow anon users to upload (for submission form)**
```sql
CREATE POLICY "Anyone can upload manuscripts"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'manuscripts');
```

**Policy 2: Allow admins to read**
```sql
CREATE POLICY "Admins can read manuscripts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'manuscripts');
```

**Policy 3: Allow admins to delete**
```sql
CREATE POLICY "Admins can delete manuscripts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'manuscripts');
```

---

#### For `published-papers` Bucket:

Go to **Storage** > **published-papers** > **Policies** tab

**Policy 1: Public read access**
```sql
CREATE POLICY "Public can read published papers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'published-papers');
```

**Policy 2: Admins can upload**
```sql
CREATE POLICY "Admins can upload published papers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'published-papers');
```

**Policy 3: Admins can update**
```sql
CREATE POLICY "Admins can update published papers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'published-papers');
```

**Policy 4: Admins can delete**
```sql
CREATE POLICY "Admins can delete published papers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'published-papers');
```

---

#### For `journal-images` Bucket:

Go to **Storage** > **journal-images** > **Policies** tab

**Policy 1: Public read access**
```sql
CREATE POLICY "Public can read journal images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'journal-images');
```

**Policy 2: Admins can upload**
```sql
CREATE POLICY "Admins can upload journal images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'journal-images');
```

**Policy 3: Admins can delete**
```sql
CREATE POLICY "Admins can delete journal images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'journal-images');
```

---

### Step 6: Test Uploads

#### Test 1: Article PDF Upload (Admin)

1. Log in to admin dashboard
2. Go to **Article Management**
3. Click **"Add New Article"**
4. Scroll to **"Manuscript PDF Upload"** section
5. Drag & drop a PDF file or click to browse
6. Should see: ✅ "PDF uploaded successfully to Supabase Storage!"
7. Verify file appears in **Storage** > **published-papers** bucket

#### Test 2: Paper Submission (Public)

1. Log out from admin (or use incognito window)
2. Go to **Submit Paper** page
3. Fill in author information
4. Fill in paper details
5. Upload manuscript PDF (required)
6. Upload cover letter (optional)
7. Upload copyright form (optional)
8. Click **"Submit Manuscript"**
9. Should see submission ID (e.g., RJ-2025-0001)
10. Verify files appear in **Storage** > **manuscripts** bucket

#### Test 3: Editorial Photo Upload (Admin)

1. Go to **Editorial Board Management**
2. Add or edit a member
3. Upload photo
4. Verify file appears in **Storage** > **journal-images/editorial/** folder

---

## Troubleshooting

### Issue: "Failed to upload file"

**Possible Causes:**
1. Bucket doesn't exist
2. Policies not set correctly
3. File size exceeds limit
4. MIME type not allowed

**Solution:**
1. Verify bucket exists in Supabase Dashboard > Storage
2. Check policies are created (see Step 5)
3. Check file size (max 10MB for PDFs, 5MB for images)
4. Check file extension (.pdf for papers, .jpg/.png for images)

---

### Issue: "Permission denied" when uploading

**Solution:**
1. For `manuscripts` bucket: Policy allows `anon` role to INSERT
2. For `published-papers` bucket: Policy allows `authenticated` role to INSERT
3. Check you're logged in as admin when uploading articles

---

### Issue: "Public URL not working"

**Solution:**
1. Ensure bucket is marked as **Public** (checked during creation)
2. For private buckets (`manuscripts`), use signed URLs instead:
   ```javascript
   const { data, error } = await supabase.storage
     .from('manuscripts')
     .createSignedUrl('RJ-2025-0001-manuscript.pdf', 3600); // 1 hour expiry
   ```

---

### Issue: "MIME type not allowed"

**Solution:**
Update bucket's allowed MIME types:

1. Go to **Storage** > Click bucket name
2. Click **Settings** icon (gear)
3. Update **Allowed MIME types**:
   - For PDFs: `application/pdf`
   - For Word docs: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - For images: `image/jpeg`, `image/png`, `image/webp`
4. Click **Save**

---

## File Size Limits

| Bucket | Limit | Purpose |
|--------|-------|---------|
| manuscripts | 10 MB | Submitted papers (PDF/DOC/DOCX) |
| published-papers | 10 MB | Published article PDFs |
| journal-images | 5 MB | Photos, logos, covers |

**To change limits:**
1. Go to Storage > Click bucket name > Settings
2. Update **File size limit** (in bytes)
3. Click Save

---

## Storage Usage Monitoring

### View Storage Usage:

1. Go to **Settings** > **Billing** > **Usage**
2. Check **Storage** section
3. Monitor:
   - Total storage used
   - Number of files
   - Bandwidth used

### Supabase Free Tier Limits:
- ✅ 1 GB storage
- ✅ 2 GB bandwidth/month
- ✅ 50 MB max file size

**Current Project Estimate:**
- 100 articles @ 2MB each = 200 MB
- 100 submissions @ 3MB each = 300 MB
- 50 images @ 200KB each = 10 MB
- **Total: ~510 MB** (well within 1 GB limit)

---

## Security Best Practices

### 1. Private Buckets (manuscripts)
- ❌ Never make manuscripts public
- ✅ Use signed URLs for temporary access
- ✅ Set expiry time (e.g., 1 hour)

### 2. Public Buckets (published-papers, journal-images)
- ✅ Only published content should be public
- ✅ Sanitize filenames (remove special characters)
- ✅ Use UUIDs or timestamps in filenames

### 3. File Validation
- ✅ Check file extension server-side
- ✅ Verify MIME type matches extension
- ✅ Scan for malware (consider ClamAV integration)
- ✅ Limit file sizes

### 4. Access Control
- ✅ Use RLS policies
- ✅ Require authentication for admin uploads
- ✅ Log all uploads for audit trail

---

## Backup Strategy

### Automated Backups:

Supabase automatically backs up your storage daily. To manually backup:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Download all files from a bucket
supabase storage cp published-papers/* ./backup/published-papers/ --recursive
```

---

## Cost Optimization Tips

### 1. Compress PDFs before upload
```javascript
// Client-side compression using pdf-lib
import { PDFDocument } from 'pdf-lib';

async function compressPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  return new Blob([pdfBytes], { type: 'application/pdf' });
}
```

### 2. Optimize images before upload
```javascript
// Client-side image compression
import imageCompression from 'browser-image-compression';

async function compressImage(file) {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 800,
    useWebWorker: true
  };
  return await imageCompression(file, options);
}
```

### 3. Clean up old files
```javascript
// Delete old submission files after paper is published
async function cleanupSubmissionFiles(submissionId) {
  const { data: files } = await supabase.storage
    .from('manuscripts')
    .list('', { search: submissionId });
    
  for (const file of files) {
    await supabase.storage
      .from('manuscripts')
      .remove([file.name]);
  }
}
```

---

## Quick Reference

### Upload File (JavaScript)
```javascript
// Upload to published-papers
const { data, error } = await supabase.storage
  .from('published-papers')
  .upload('filename.pdf', file, {
    contentType: 'application/pdf',
    upsert: true
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('published-papers')
  .getPublicUrl('filename.pdf');
```

### Download File
```javascript
const { data, error } = await supabase.storage
  .from('published-papers')
  .download('filename.pdf');
```

### Delete File
```javascript
const { data, error } = await supabase.storage
  .from('published-papers')
  .remove(['filename.pdf']);
```

### Create Signed URL (for private files)
```javascript
const { data, error } = await supabase.storage
  .from('manuscripts')
  .createSignedUrl('RJ-2025-0001-manuscript.pdf', 3600); // 1 hour
```

---

## ✅ Setup Complete!

Once all 3 buckets are created and policies are set, your storage is ready for:
- ✅ Article PDF uploads (admin)
- ✅ Paper submissions (public)
- ✅ Editorial photo uploads (admin)
- ✅ Issue cover uploads (admin)

**Next Steps:**
1. Test article PDF upload
2. Test paper submission
3. Monitor storage usage
4. Set up automated backups

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs/guides/storage
- Community: https://supabase.com/community
- Discord: https://discord.supabase.com
