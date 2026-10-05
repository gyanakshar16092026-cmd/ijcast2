# Priority 1 Implementation - COMPLETE ✅

## ISSN: 2394-9007

## Changes Implemented

### 1. ✅ Schema Merge Complete
**File:** `supabase/schema.sql`

**Changes:**
- ✅ Merged `DATABASE_SCHEMA.sql` (submissions system) into main `supabase/schema.sql`
- ✅ Updated ISSN to 2394-9007 throughout schema
- ✅ Reordered tables correctly (submissions before articles for FK references)
- ✅ Added all submission-related tables:
  - `submissions` table with complete workflow
  - `submission_authors` table for co-authors
  - `contact_messages` table for contact form

### 2. ✅ Paper Status Workflow Added
**Table:** `articles`

**New Fields:**
```sql
status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'published'))
submission_id UUID REFERENCES submissions(id) -- Link articles to submissions
views_count INT DEFAULT 0 -- For statistics
downloads_count INT DEFAULT 0 -- For statistics
updated_at TIMESTAMPTZ DEFAULT NOW() -- Track updates
```

### 3. ✅ Issue Publishing Workflow Added
**Table:** `issues`

**New Field:**
```sql
is_published BOOLEAN DEFAULT false -- Issue publishing workflow
```

### 4. ✅ Performance Indexes Added

**New Indexes:**
```sql
-- Volumes
idx_volumes_year, idx_volumes_status

-- Issues  
idx_issues_volume_id, idx_issues_year, idx_issues_is_published

-- Articles (Critical for search/filtering)
idx_articles_issue_id, idx_articles_submission_id
idx_articles_status, idx_articles_research_area
idx_articles_published_date, idx_articles_is_published
idx_articles_keywords (GIN index for array search)
idx_articles_authors (GIN index for JSONB search)
idx_articles_fulltext (Full-text search on title + abstract)

-- Submissions
idx_submissions_submission_id, idx_submissions_status
idx_submissions_submitted_date, idx_submissions_author_email

-- Submission Authors
idx_submission_authors_submission_id

-- Contact Messages
idx_contact_messages_status, idx_contact_messages_created_at

-- Editorial Members
idx_editorial_members_role, idx_editorial_members_is_active
```

### 5. ✅ Helper Functions Added

**Functions Created:**
1. `update_updated_at_column()` - Auto-updates updated_at timestamps
2. `generate_submission_id()` - Generates unique RJ-YYYY-#### format IDs

**Triggers Created:**
- `update_articles_updated_at` - For articles table
- `update_submissions_updated_at` - For submissions table
- `update_apc_payments_updated_at` - For payments table

### 6. ✅ RLS Policies Updated

**New Policies:**
- Public can insert submissions (anonymous form submission)
- Public can insert contact messages
- Admins have full access to all tables
- App-level auth maintained (anon key with app-side validation)

### 7. ✅ Storage Buckets Documented

**Required Buckets:**

1. **manuscripts** (Private)
   - For submitted manuscripts
   - Path: `manuscripts/{submission_id}/{filename}`
   - Max size: 10MB
   - Types: PDF, DOC, DOCX

2. **published-papers** (Public)
   - For published article PDFs
   - Path: `published-papers/{year}/{volume}/{issue}/{article_id}.pdf`
   - Max size: 10MB
   - Type: PDF only

3. **journal-images** (Public)
   - For logos, editorial photos, issue covers
   - Path: `journal-images/{type}/{filename}`
   - Max size: 5MB
   - Types: JPEG, PNG, WEBP

---

## Next Steps (Frontend Implementation)

### Immediate:
1. Create Supabase Storage buckets in dashboard
2. Update `ArticleManager.jsx` - Replace Data URLs with Supabase Storage uploads
3. Update `SubmitPaper.jsx` - Implement file uploads to manuscripts bucket
4. Update `JournalContext.jsx` - Add storage upload helpers

### Priority 2 (After P1):
5. Advanced search/filtering implementation
6. Latest Papers page creation
7. Email notifications setup
8. Admin security hardening

### Priority 3:
9. Author dashboard
10. DOI integration
11. Statistics dashboard
12. ORCID integration
13. Issue TOC PDF generation

---

## Migration Instructions

### Step 1: Backup Current Database
```bash
# In Supabase Dashboard: Database > Backups > Create Backup
```

### Step 2: Apply Schema
```bash
# Option A: Via Supabase Dashboard
# - Go to SQL Editor
# - Paste contents of supabase/schema.sql
# - Run query

# Option B: Via Supabase CLI
supabase db push
```

### Step 3: Create Storage Buckets
1. Go to Supabase Dashboard > Storage
2. Create `manuscripts` bucket (Private)
3. Create `published-papers` bucket (Public)
4. Create `journal-images` bucket (Public)

### Step 4: Test Schema
```sql
-- Test submission ID generation
SELECT generate_submission_id();

-- Test tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;
```

---

## Files Modified

1. ✅ `supabase/schema.sql` - Complete merge with all P1 features
2. ⏳ `src/components/admin/ArticleManager.jsx` - Next: Add Supabase Storage
3. ⏳ `src/pages/SubmitPaper.jsx` - Next: Add file upload logic
4. ⏳ `src/context/JournalContext.jsx` - Next: Add storage helpers

---

## Database Schema Summary

**Core Hierarchy:**
```
journal_settings (1 row - journal info)
├── volumes (Volume 1, 2, 3...)
│   └── issues (Issue 1-6 per volume)
│       └── articles (Papers published in issues)
│           └── [linked to] submissions
│
├── submissions (Author submissions)
│   └── submission_authors (Co-authors)
│
├── editorial_members (Editorial board)
├── research_areas (Research categories)
├── conferences (Conference publications)
├── theses (Published theses)
├── announcements (Homepage news)
├── contact_messages (Contact form submissions)
├── apc_payments (Payment records)
├── page_content (CMS content)
└── media (File metadata)
```

**Total Tables:** 15
**Total Indexes:** 25+
**Total Functions:** 2
**Total Triggers:** 3

---

## Status: PRIORITY 1 SCHEMA COMPLETE ✅

**Date:** 2025
**Next Action:** Frontend Implementation (Storage Integration)
