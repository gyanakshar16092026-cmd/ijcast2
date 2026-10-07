# Supabase Storage Buckets Setup for IJCAST

## Required Buckets for Editorial Board Photos

Your IJCAST journal needs these 3 storage buckets in Supabase:

### 1. 📁 `journal-images` (MOST IMPORTANT for Editorial Board)
**Purpose**: Editorial board photos, logos, covers  
**Configuration**:
- Public: ✅ **YES** (must be public to display photos)
- Max file size: **5MB**
- Allowed file types: `image/jpeg, image/png, image/webp`
- Folder structure: `editorial/{timestamp}.jpg`

### 2. 📁 `manuscripts` 
**Purpose**: Submitted manuscript files  
**Configuration**:
- Public: ❌ **NO** (private for admin only)
- Max file size: **10MB**
- Allowed file types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 3. 📁 `published-papers`
**Purpose**: Published paper PDFs  
**Configuration**:
- Public: ✅ **YES** (public access for downloads)
- Max file size: **10MB** 
- Allowed file types: `application/pdf`

## Setup Instructions

### Step 1: Go to Supabase Dashboard
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your **IJCAST** project
3. Click **Storage** in left sidebar

### Step 2: Create `journal-images` Bucket (Critical for Editorial Photos)
1. Click **"New bucket"**
2. **Bucket name**: `journal-images`
3. **Public bucket**: ✅ **Check this box** (essential for photo display)
4. Click **"Create bucket"**

### Step 3: Create `manuscripts` Bucket
1. Click **"New bucket"**
2. **Bucket name**: `manuscripts`
3. **Public bucket**: ❌ **Leave unchecked** (keep private)
4. Click **"Create bucket"**

### Step 4: Create `published-papers` Bucket  
1. Click **"New bucket"**
2. **Bucket name**: `published-papers`
3. **Public bucket**: ✅ **Check this box**
4. Click **"Create bucket"**

### Step 5: Verify Setup
1. Go back to your IJCAST admin panel
2. Go to **Editorial Board Management**
3. Click **"Test Storage"** button
4. Should show: ✅ All 3 buckets accessible

## Troubleshooting Editorial Board Photos

### Problem: Photos not displaying even after upload

**Solution 1: Check bucket exists**
```bash
✅ journal-images: OK (0 files listed)  ← Good
❌ journal-images: Bucket not found     ← Create the bucket
```

**Solution 2: Check bucket is PUBLIC**
- Go to Supabase Dashboard → Storage → journal-images
- Look for "Public" badge next to bucket name
- If not public, click bucket → Settings → Make public

**Solution 3: Re-upload photos after bucket setup**
- Edit editorial member in admin
- Upload photo again (will now upload to proper storage)
- Should convert from base64 to proper URL

## Expected Photo URL Formats

❌ **Base64** (stored in database, won't display properly):
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
```

✅ **Supabase Storage URL** (proper format):
```
https://your-project.supabase.co/storage/v1/object/public/journal-images/editorial/1736289472034.jpg
```

## File Size Limits

- **Editorial photos**: 5MB max (JPG, PNG, WEBP)
- **Manuscripts**: 10MB max (PDF, DOC, DOCX)  
- **Published papers**: 10MB max (PDF only)

## Folder Structure

```
journal-images/
  editorial/
    1736289472034.jpg  ← Editorial member photos
    1736289583921.png
  covers/
    volume-1-issue-1.jpg ← Issue covers
  logos/
    partner-logo-1.png  ← Partner/indexing logos

manuscripts/
  RJ-2025-0001/         ← Submission folders
    manuscript.pdf
    cover-letter.pdf

published-papers/
  2025/                 ← Organized by year
    volume-1/
      issue-1/
        article-001.pdf
```

## After Setup Checklist

- [ ] Created `journal-images` bucket (Public: YES)
- [ ] Created `manuscripts` bucket (Public: NO) 
- [ ] Created `published-papers` bucket (Public: YES)
- [ ] Tested with "Test Storage" button - all buckets OK
- [ ] Re-uploaded editorial member photos
- [ ] Photos now display with proper URLs (not base64)
- [ ] Editorial board page shows all photos correctly

## Common Issues

**Issue**: "Bucket not found" error
**Fix**: Create the missing bucket in Supabase Dashboard → Storage

**Issue**: Photos upload but don't display  
**Fix**: Make sure `journal-images` bucket is **PUBLIC**

**Issue**: Still seeing base64 photos in database
**Fix**: Edit member, upload photo again - will replace base64 with proper URL

---

🎯 **Priority**: Create the `journal-images` bucket first - this will immediately fix editorial board photo display issues.