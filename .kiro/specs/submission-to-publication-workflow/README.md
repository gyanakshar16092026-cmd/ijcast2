# Submission to Publication Workflow - Complete Implementation

**Feature Status:** ✅ **ALREADY FULLY IMPLEMENTED**

This spec documents the existing submission-to-publication workflow that is already fully functional in the IJCAST platform.

---

## Overview

The complete workflow from user paper submission to published paper display on the website is **already implemented and functional**. This document explains how it works and provides testing instructions.

---

## Workflow Steps

### Step 1: User Submits Paper ✅

**Page:** `/submit-paper` (`src/pages/SubmitPaper.jsx`)

**What Happens:**
1. User fills out submission form with:
   - Primary author information (name, email, phone, affiliation, institution, country)
   - Paper information (title, abstract, keywords)
   - Co-authors (optional)
   - File uploads (manuscript*, cover letter, copyright form)
2. User agrees to declaration/consent checkbox
3. User clicks "Submit Manuscript"
4. System generates unique submission ID: `RJ-YYYY-####`
5. Files uploaded to Supabase Storage bucket: `manuscripts`
6. Submission saved to `submissions` table with status: `SUBMITTED`
7. Co-authors (if any) saved to `submission_authors` table
8. User sees confirmation page with submission ID

**Database Tables Used:**
- `submissions` - stores main submission data
- `submission_authors` - stores co-author information

**Backend Function:** `submitPaper()` in `src/context/JournalContext.jsx`

---

### Step 2: Admin Views Submissions ✅

**Page:** Admin Dashboard → Submissions Tab (`src/components/admin/SubmissionsManager.jsx`)

**What Admin Sees:**
1. Table of all submissions with:
   - Submission ID (RJ-YYYY-####)
   - Paper title
   - Author name and institution
   - Submitted date
   - Current status
2. Search functionality (by title, author, submission ID)
3. Filter by status dropdown
4. Status counts for each category

**Status Options:**
- `SUBMITTED` - Initial state when user submits
- `UNDER REVIEW` - Admin marks as under review
- `REVISION REQUIRED` - Admin requests revisions
- `ACCEPTED` - Admin accepts the paper
- `REJECTED` - Admin rejects the paper
- `PUBLISHED` - Paper has been converted to published article

**Backend Function:** `fetchSubmissions()` in `src/context/JournalContext.jsx`

---

### Step 3: Admin Reviews Submission ✅

**Action:** Click "View Details" button (eye icon)

**What Admin Sees in Modal:**
1. **Submission ID & Status Badge**
2. **Paper Title**
3. **Primary Author Information:**
   - Name, email (clickable mailto link), phone
   - Affiliation, institution, country
4. **Co-Authors (if any):**
   - Name, email, affiliation for each co-author
5. **Paper Information:**
   - Complete abstract
   - Keywords (as colored tags)
6. **Submitted Files:**
   - Manuscript (required) - with download button
   - Cover Letter (optional) - with download button
   - Copyright Form (optional) - with download button

**Admin Actions:**
1. **Change Status:** Use dropdown to update status
   - Triggers `updateSubmissionStatus()` function
   - Updates `submissions` table
   - Sets timestamp fields (reviewed_date, accepted_date, published_date)

2. **Download Files:** Click download button for any file
   - Opens file from Supabase Storage

3. **Convert to Published Paper:** Click button (only visible for ACCEPTED submissions)
   - Triggers `convertSubmissionToPublishedArticle()` function

**Backend Functions:** 
- `updateSubmissionStatus()` - updates status
- `convertSubmissionToPublishedArticle()` - creates published article

---

### Step 4: Admin Publishes Paper ✅

**Action:** Click "Convert to Published Paper" button

**What Happens:**
1. System checks for duplicate (by title or DOI)
2. Creates new article record in `articles` table with:
   - Title from submission
   - Authors array (primary + co-authors)
   - Corresponding author email
   - Abstract, keywords, research area
   - Received date (submission date)
   - Accepted date (today)
   - Published date (today)
   - DOI generated: `10.5281/ijcast.{submission_id}`
   - PDF URL from manuscript file
   - `is_published = true`
3. Links article to current issue
4. Updates submission status to `PUBLISHED`
5. Shows success message

**Backend Function:** `convertSubmissionToPublishedArticle()` in `src/context/JournalContext.jsx`

**Database Tables Updated:**
- `articles` - new published article created
- `submissions` - status updated to PUBLISHED

---

### Step 5: Paper Appears on Website ✅

**Where Paper Shows:**

1. **Latest Papers Page** (`/latest-papers`)
   - Shows all published papers sorted by date (newest first)
   - Full search and filtering capabilities
   - Paper card with title, authors, abstract, keywords, actions

2. **Current Issue Page** (`/current-issue`)
   - Shows papers from the latest published issue
   - If article was linked to current issue

3. **Archives Page** (`/archives`)
   - Shows in corresponding volume/issue
   - Accessible via archive browsing

4. **Article Detail Page** (`/article/:id`)
   - Full paper information
   - PDF viewer
   - Download options
   - Citation export

**What Users See:**
- Paper title (clickable to detail page)
- All authors with affiliations
- Published date
- Research area badge
- Abstract preview (full abstract on detail page)
- Keywords as tags
- Actions: View Full Paper, Download PDF, DOI link

---

## File Upload System

### Supabase Storage Buckets

**Bucket:** `manuscripts`

**Upload Structure:**
```
manuscripts/
├── {submission_id}/
│   ├── manuscript-{submission_id}-{timestamp}.{ext}
│   ├── cover-letter-{submission_id}-{timestamp}.{ext}
│   └── copyright-{submission_id}-{timestamp}.{ext}
```

**Supported File Types:**
- Manuscript: PDF, DOC, DOCX (max 10MB)
- Cover Letter: PDF, DOC, DOCX (max 5MB)
- Copyright Form: PDF (max 5MB)

**Upload Function:** `uploadSubmissionFile()` in `src/context/JournalContext.jsx`

**Storage Configuration:**
- Public bucket (read access)
- Upload requires authentication (admin only for direct uploads)
- Files accessible via public URLs after upload

---

## Database Schema

### submissions table
```sql
CREATE TABLE submissions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    submission_id TEXT NOT NULL UNIQUE,
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
    status TEXT DEFAULT 'SUBMITTED',
    submitted_date TIMESTAMPTZ DEFAULT NOW(),
    reviewed_date TIMESTAMPTZ,
    accepted_date TIMESTAMPTZ,
    published_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### submission_authors table
```sql
CREATE TABLE submission_authors (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    submission_id BIGINT REFERENCES submissions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    affiliation TEXT,
    institution TEXT,
    country TEXT,
    author_order INTEGER DEFAULT 2,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### articles table (destination)
```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
    authors JSONB NOT NULL DEFAULT '[]',
    corresponding_author TEXT,
    corresponding_author_email TEXT,
    abstract TEXT,
    keywords TEXT[],
    research_area TEXT,
    article_type TEXT DEFAULT 'Research Paper',
    received_date DATE,
    revised_date DATE,
    accepted_date DATE,
    published_date DATE,
    doi TEXT UNIQUE,
    page_numbers TEXT,
    pdf_url TEXT,
    html_content TEXT,
    references TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    submission_id BIGINT REFERENCES submissions(id),
    status TEXT DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sort_order INTEGER DEFAULT 0
);
```

---

## Testing Instructions

### Test Case 1: User Submits Paper

1. Navigate to: `http://localhost:5173/submit-paper`
2. Fill out all required fields:
   - Primary Author: Name, Email, Phone, Affiliation, Institution, Country
   - Paper: Title, Abstract, Keywords
   - Upload manuscript file (PDF/DOC/DOCX)
3. (Optional) Add co-authors
4. (Optional) Upload cover letter and copyright form
5. Check declaration checkbox
6. Click "Submit Manuscript"
7. ✅ **Expected:** Success page with submission ID (RJ-YYYY-####)

### Test Case 2: Admin Views Submission

1. Login to admin panel: `http://localhost:5173/admin/login`
2. Click "Submissions" tab in sidebar
3. ✅ **Expected:** See submitted paper in table
4. Search for submission by title, author, or ID
5. ✅ **Expected:** Search filters results correctly
6. Filter by status = "SUBMITTED"
7. ✅ **Expected:** See only submitted papers

### Test Case 3: Admin Reviews Submission

1. In Submissions tab, click "View Details" (eye icon) on a submission
2. ✅ **Expected:** Modal opens with all submission details
3. Review paper information, author details, abstract, keywords
4. Click download button for manuscript
5. ✅ **Expected:** Manuscript file downloads
6. Change status dropdown from "SUBMITTED" to "UNDER REVIEW"
7. ✅ **Expected:** Status updates immediately

### Test Case 4: Admin Accepts and Publishes

1. In submission detail modal, change status to "ACCEPTED"
2. ✅ **Expected:** Status badge updates
3. Click "Convert to Published Paper" button
4. ✅ **Expected:** Success message appears
5. ✅ **Expected:** Status changes to "PUBLISHED"
6. Close modal

### Test Case 5: Verify Paper Appears on Website

1. Navigate to: `http://localhost:5173/latest-papers`
2. ✅ **Expected:** See published paper at top of list (newest first)
3. Verify paper card shows:
   - Title, authors, published date
   - Research area badge
   - Abstract preview (3 lines)
   - Keywords as tags
4. Search for paper by title
5. ✅ **Expected:** Paper appears in search results
6. Click paper title
7. ✅ **Expected:** Opens article detail page
8. ✅ **Expected:** Can view full paper information
9. Click "Download PDF"
10. ✅ **Expected:** PDF downloads from Supabase Storage

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER SUBMITS PAPER                          │
│                   (SubmitPaper.jsx)                             │
│                                                                 │
│  • Fill form (author, title, abstract, keywords)               │
│  • Upload files (manuscript, cover letter, copyright)          │
│  • Generate submission ID: RJ-YYYY-####                        │
│  • Save to submissions table (status: SUBMITTED)               │
│  • Upload files to Supabase Storage: manuscripts bucket        │
│  • Save co-authors to submission_authors table                 │
│  • Show confirmation page                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ADMIN VIEWS SUBMISSIONS                         │
│              (SubmissionsManager.jsx)                           │
│                                                                 │
│  • Fetch all submissions from database                         │
│  • Display in table with search/filter                         │
│  • Show: ID, title, author, date, status                       │
│  • Status counts for each category                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 ADMIN REVIEWS SUBMISSION                        │
│              (Submission Detail Modal)                          │
│                                                                 │
│  • Click "View Details" button                                 │
│  • See full submission info in modal                           │
│  • Review: author, title, abstract, keywords                   │
│  • Download files: manuscript, cover letter, copyright         │
│  • Change status: SUBMITTED → UNDER REVIEW → ACCEPTED         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              ADMIN PUBLISHES PAPER                              │
│       (convertSubmissionToPublishedArticle)                     │
│                                                                 │
│  • Click "Convert to Published Paper" button                   │
│  • Check for duplicates                                        │
│  • Create article record in articles table                     │
│  • Set authors array (primary + co-authors)                    │
│  • Generate DOI: 10.5281/ijcast.{submission_id}               │
│  • Link PDF from manuscript file                               │
│  • Set is_published = true                                     │
│  • Update submission status to PUBLISHED                       │
│  • Link to current issue                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│               PAPER APPEARS ON WEBSITE                          │
│                                                                 │
│  ✅ Latest Papers (/latest-papers)                             │
│     • All published papers sorted by date                      │
│     • Search & filter capabilities                             │
│                                                                 │
│  ✅ Current Issue (/current-issue)                             │
│     • Papers from latest published issue                       │
│                                                                 │
│  ✅ Archives (/archives)                                        │
│     • Papers organized by volume/issue                         │
│                                                                 │
│  ✅ Article Detail (/article/:id)                              │
│     • Full paper information                                   │
│     • PDF viewer & download                                    │
│     • Citation export                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Functions Reference

All functions are in `src/context/JournalContext.jsx`

### submitPaper(submissionData, files)
**Purpose:** Save user submission to database and upload files

**Parameters:**
- `submissionData` - object with author info, paper info, co-authors array
- `files` - object with manuscript_file, cover_letter_file, copyright_file

**Returns:**
```javascript
{
  success: true,
  submissionId: 'RJ-2025-1234',
  submission: { ...submissionRecord },
  storageWarnings: [],
  savedLocally: false
}
```

**What It Does:**
1. Generates unique submission ID via `generate_submission_id()` RPC
2. Uploads files to Supabase Storage (manuscripts bucket)
3. Inserts record into submissions table (status: SUBMITTED)
4. Inserts co-authors into submission_authors table
5. Returns submission ID for confirmation page

---

### fetchSubmissions()
**Purpose:** Get all submissions for admin dashboard

**Parameters:** None

**Returns:** Array of submission objects with co-authors included

**What It Does:**
1. Queries submissions table with join to submission_authors
2. Orders by submitted_date (newest first)
3. Merges with local submissions (if any)
4. Returns normalized array

---

### updateSubmissionStatus(submissionId, newStatus)
**Purpose:** Update submission status

**Parameters:**
- `submissionId` - ID of submission to update
- `newStatus` - new status value (SUBMITTED, UNDER REVIEW, etc.)

**Returns:**
```javascript
{ success: true }
```

**What It Does:**
1. Updates status field in submissions table
2. Sets timestamp fields based on status:
   - UNDER REVIEW → reviewed_date
   - ACCEPTED → accepted_date
   - PUBLISHED → published_date
3. Returns success confirmation

---

### convertSubmissionToPublishedArticle(submission)
**Purpose:** Convert accepted submission to published article

**Parameters:**
- `submission` - submission object to convert

**Returns:**
```javascript
{
  success: true,
  article: { ...articleRecord }
}
```

**What It Does:**
1. Checks for duplicate articles (by title or DOI)
2. Builds authors array (primary + co-authors)
3. Creates article record in articles table with:
   - Title, abstract, keywords from submission
   - Authors array
   - Corresponding author email
   - Dates (received, accepted, published)
   - Generated DOI
   - PDF URL from manuscript file
   - is_published = true
4. Links article to current issue
5. Updates submission status to PUBLISHED
6. Returns success with article data

---

## Status Values

### Submission Statuses
- `SUBMITTED` - Initial state, user just submitted
- `UNDER REVIEW` - Admin is reviewing the paper
- `REVISION REQUIRED` - Admin requests revisions from author
- `ACCEPTED` - Admin accepts paper for publication
- `REJECTED` - Admin rejects the paper
- `PUBLISHED` - Paper has been converted to published article

### Article Statuses
- `published` - Article is published and visible on website
- `draft` - Article is not yet published
- `under_review` - Article is under review
- `accepted` - Article is accepted but not yet published

---

## Supabase Storage Setup

### Create Bucket (if not exists)

1. Login to Supabase Dashboard
2. Go to Storage
3. Create new bucket: `manuscripts`
4. Settings:
   - Public: Yes (for public read access)
   - File size limit: 10MB for manuscripts, 5MB for other files
   - Allowed MIME types: 
     - application/pdf
     - application/msword
     - application/vnd.openxmlformats-officedocument.wordprocessingml.document

### Storage Policies

```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'manuscripts');

-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'manuscripts' AND auth.role() = 'authenticated');
```

---

## Troubleshooting

### Submission Not Appearing in Admin Panel

**Possible Causes:**
1. Supabase not configured correctly
2. Network error during submission
3. Browser console shows errors

**Solutions:**
1. Check `.env` file has correct Supabase URL and anon key
2. Check browser console for errors
3. Check Network tab for failed API calls
4. Try refreshing admin panel

---

### Files Not Uploading

**Possible Causes:**
1. File size exceeds limit
2. File type not supported
3. Storage bucket not configured
4. Storage policies not set

**Solutions:**
1. Check file size (max 10MB for manuscript, 5MB for others)
2. Check file type (PDF, DOC, DOCX only)
3. Create `manuscripts` bucket in Supabase Dashboard
4. Set storage policies (see Supabase Storage Setup section)

---

### Paper Not Appearing on Website After Publishing

**Possible Causes:**
1. Article not marked as `is_published = true`
2. Article not linked to any issue
3. Cache issue in browser

**Solutions:**
1. Check articles table: `is_published` should be `true`
2. Link article to an issue in Article Manager
3. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
4. Check Latest Papers page directly: `/latest-papers`

---

## Next Steps (Optional Enhancements)

While the workflow is fully functional, these are optional enhancements:

### 1. Email Notifications
- Send confirmation email to author on submission
- Send status update emails when admin changes status
- Send acceptance email with next steps
- Send publication notification with DOI and article link

### 2. Author Dashboard
- Allow authors to track submission status
- View submission history
- Upload revised manuscripts
- View reviewer comments

### 3. Reviewer System
- Assign reviewers to submissions
- Reviewer login and dashboard
- Review forms and ratings
- Review deadline tracking

### 4. Advanced Submission Features
- Save draft submissions
- Resume incomplete submissions
- Multi-step submission wizard
- File format validation

### 5. Analytics
- Submission statistics
- Acceptance rate tracking
- Average review time
- Author demographics

---

## Conclusion

The submission-to-publication workflow is **fully implemented and functional**. The system supports:

✅ User paper submission with file uploads
✅ Admin review dashboard with search/filter
✅ Status management (SUBMITTED → UNDER REVIEW → ACCEPTED → PUBLISHED)
✅ One-click conversion to published article
✅ Automatic display on website (Latest Papers, Archives, Article Detail)
✅ File storage in Supabase Storage
✅ Co-author support
✅ DOI generation
✅ Full metadata preservation

**No additional implementation is required.** The workflow is production-ready and can be tested immediately.

---

**Document Version:** 1.0  
**Last Updated:** 2025  
**Status:** ✅ COMPLETE - FULLY IMPLEMENTED
