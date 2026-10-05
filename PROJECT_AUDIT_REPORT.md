# IJCAST Research Journal Website - Complete Architecture Audit Report

**Date:** October 5, 2026  
**Project:** International Journal of Commerce, Arts, Science and Technology (IJCAST)  
**Analysis Type:** Database Architecture & Feature Compliance Audit

---

## EXECUTIVE SUMMARY

Your current IJCAST project **DOES implement** the Volume → Issue → Paper architecture, but there are **CRITICAL GAPS** in functionality, database schema completeness, and admin management features. This is NOT a blog-based or hardcoded system—it is database-driven through Supabase with a React frontend.

**Critical Finding:** The database schema and admin components exist for the core Volume/Issue/Paper hierarchy, but **submission management, paper workflow, and several required features are incomplete or missing**.

---

## A. CURRENT PROJECT STRUCTURE

### Technology Stack
- **Frontend:** React 18 + Vite + TailwindCSS + React Router
- **Backend/Database:** Supabase (PostgreSQL) with Row Level Security
- **State Management:** React Context API (`JournalContext.jsx`)
- **Authentication:** Supabase Auth + Demo fallback admin credentials
- **Payment Integration:** Cashfree (for APC payments)
- **File Storage:** Supabase Storage buckets (planned: `manuscripts`, `published-papers`, `journal-images`)

### File Structure
```
IJCAST/
├── api/                          # Express.js API for payment gateway
│   ├── config/
│   ├── routes/
│   └── services/
├── src/
│   ├── components/
│   │   ├── admin/               # Admin management components
│   │   │   ├── VolumeManager.jsx         ✅ Exists
│   │   │   ├── IssueManager.jsx          ✅ Exists
│   │   │   ├── ArticleManager.jsx        ✅ Exists
│   │   │   ├── SubmissionsManager.jsx    ⚠️ Exists but incomplete
│   │   │   ├── EditorialManager.jsx      ✅ Exists
│   │   │   ├── ConferenceManager.jsx     ✅ Exists
│   │   │   ├── ThesisManager.jsx         ✅ Exists
│   │   │   ├── AnnouncementManager.jsx   ✅ Exists
│   │   │   ├── ResearchAreaManager.jsx   ✅ Exists
│   │   │   ├── SettingsManager.jsx       ✅ Exists
│   │   │   ├── MediaManager.jsx          ✅ Exists
│   │   │   └── PageContentEditor.jsx     ✅ Exists
│   │   ├── common/              # Reusable UI components
│   │   └── layout/              # Layout components
│   ├── pages/
│   │   ├── admin/
│   │   ├── Archives.jsx          ✅ Volume/Issue browser
│   │   ├── CurrentIssue.jsx      ✅ Latest issue display
│   │   ├── ArticleDetail.jsx     ✅ Individual paper page
│   │   └── SubmitPaper.jsx       ⚠️ Exists but incomplete
│   ├── context/
│   │   └── JournalContext.jsx    # Central state management
│   ├── lib/
│   │   ├── supabase.js           # Supabase client config
│   │   └── mockData.js           # Seed data for demo mode
│   └── services/
│       └── paymentService.js     # APC payment integration
├── supabase/
│   ├── schema.sql                # Database schema definition
│   ├── migrations/
│   └── functions/                # Edge functions
└── DATABASE_SCHEMA.sql           # Submission system schema (separate)
```

---

## B. REQUIRED ARCHITECTURE VERIFICATION

### ✅ **CORRECT**: Volume → Issue → Paper Hierarchy IS IMPLEMENTED

**Evidence from Code:**

1. **Database Tables (supabase/schema.sql):**
   ```sql
   volumes (id, volume_number, year, description, status)
   issues (id, volume_id, issue_number, month_range, year, pub_date, cover_url)
   articles (id, issue_id, title, authors, abstract, keywords, doi, pdf_url, ...)
   ```
   - **Relationship:** `issues.volume_id` → `volumes.id` (Foreign Key)
   - **Relationship:** `articles.issue_id` → `issues.id` (Foreign Key)

2. **Admin Components:**
   - `VolumeManager.jsx` - Create/Edit/Delete volumes
   - `IssueManager.jsx` - Create/Edit/Delete issues within volumes
   - `ArticleManager.jsx` - Create/Edit/Delete/Move papers between issues

3. **Frontend Display:**
   - `Archives.jsx` - Tree view: Year → Volume → Issue → Papers
   - `CurrentIssue.jsx` - Shows papers from active volume/issue
   - `ArticleDetail.jsx` - Individual paper page with full metadata

**Database Relationships Confirmed:**
```
Journal Settings (1)
    ↓
Volumes (many) - volume_number, year, status
    ↓
Issues (many per Volume) - issue_number, month_range, year
    ↓
Articles (many per Issue) - title, authors, abstract, DOI, PDF, etc.
```

---

## C. WHAT IS ALREADY CORRECT

### ✅ Core Architecture (Implemented)

1. **Volume Management**
   - Create/Edit/Delete volumes
   - Volume number, year, description, status (Active/Archived)
   - Auto-generates 6 bimonthly issues when creating a new volume
   - Location: `src/components/admin/VolumeManager.jsx`

2. **Issue Management**
   - Create/Edit/Delete issues within volumes
   - Issue number (1-6 for bimonthly), month range, year, publication date
   - Cover image URL support
   - Editorial notes for each issue
   - Reordering capability (sort_order field)
   - Location: `src/components/admin/IssueManager.jsx`

3. **Paper/Article Management**
   - Full CRUD operations (Create, Read, Update, Delete)
   - **Comprehensive Fields:**
     - Title, Abstract, Keywords
     - Multiple authors with affiliations, emails, ORCID iDs
     - Corresponding author designation
     - Research area categorization
     - Article type (Research Paper, Review, Case Study, etc.)
     - **Timeline dates:** Received, Revised, Accepted, Published
     - DOI assignment
     - Page numbers
     - References section
     - **PDF upload:** Drag & drop / Browse / URL paste
     - Draft/Published status toggle
   - Move papers between issues
   - Reorder papers within an issue
   - Location: `src/components/admin/ArticleManager.jsx`

4. **Public Website Display**
   - Archives page with Volume/Issue/Paper tree navigation
   - Current Issue page showing latest published papers
   - Individual Article Detail pages with:
     - Full metadata display
     - Author information with ORCID links
     - Abstract and keywords
     - Citation generator (APA, MLA, BibTeX)
     - PDF download/preview
     - DOI links
     - Timeline dates
   - Automatic paper appearance under correct Volume/Issue
   - Search functionality (global modal)
   - Papers are searchable by title, author, keywords

5. **Database Structure**
   - PostgreSQL via Supabase
   - Proper foreign key relationships
   - UUID primary keys (production-ready)
   - JSONB fields for complex data (authors array, keywords array)
   - Row Level Security (RLS) policies configured
   - Automatic timestamps (created_at, updated_at)

6. **Additional Features (Bonus)**
   - Editorial Board Management
   - Research Areas/Categories Management
   - Conference Management
   - Thesis Repository
   - Announcements/Newsflash Banner
   - CMS for static pages (About, Ethics, APC, etc.)
   - Media Library Management
   - Journal Settings Management
   - APC Payment Integration (Cashfree)

---

## D. WHAT IS MISSING OR INCOMPLETE

### ❌ Critical Missing Features

#### 1. **Complete Submission System** ⚠️ PARTIALLY IMPLEMENTED

**Current Status:**
- `DATABASE_SCHEMA.sql` defines submission tables:
  - `submissions` table - stores paper submissions
  - `submission_authors` table - stores co-authors
  - `contact_messages` table - stores contact form submissions
- `SubmissionsManager.jsx` exists but may not be fully functional
- `SubmitPaper.jsx` page exists but incomplete

**What's Missing:**
- ❌ File upload to Supabase Storage not fully integrated
- ❌ Submission ID generation not implemented in frontend
- ❌ Co-author form fields incomplete
- ❌ Email notifications for submission confirmation
- ❌ Submission status workflow (SUBMITTED → UNDER REVIEW → ACCEPTED → REJECTED → PUBLISHED)
- ❌ Admin ability to link accepted submission to published article
- ❌ Author dashboard to track submission status

**Required Implementation:**
```javascript
// Missing submission workflow:
1. Author submits paper → generates submission ID (RJ-YYYY-####)
2. Upload manuscript PDF to Supabase Storage bucket 'manuscripts'
3. Upload cover letter, copyright form
4. Send confirmation email
5. Admin reviews in SubmissionsManager
6. Admin can update status, add internal notes
7. When ACCEPTED → Admin creates Article from Submission
8. Link submission_id to article record
```

#### 2. **Paper Workflow States** ❌ NOT IMPLEMENTED

**Current:** Articles only have `is_published` boolean (true/false)

**Required:** Full paper status workflow:
- ❌ Draft/Submitted status
- ❌ Under Review status
- ❌ Revision Required status
- ❌ Accepted status
- ❌ Rejected status
- ❌ Published status with published date

**Impact:** Cannot track paper lifecycle properly

#### 3. **Issue Publishing Workflow** ⚠️ PARTIAL

**Current Status:**
- Issues have `pub_date` field
- Homepage shows "Current Issue" based on active volume + highest issue number

**What's Missing:**
- ❌ No explicit "Publish Issue" button/action
- ❌ No bulk status update for all papers in an issue
- ❌ No "Issue Complete" flag
- ❌ No automatic homepage update when issue is published

**Required:**
```javascript
// Issue publishing should:
1. Mark issue as "Published" (add new field: issue_status)
2. Automatically set all articles in issue to published=true
3. Update homepage to show this issue as "Latest Issue"
4. Generate issue cover page/table of contents
```

#### 4. **Search/Filtering Capabilities** ⚠️ BASIC ONLY

**Current Status:**
- Global search modal exists (`SearchModal.jsx`)
- Basic title/keyword search

**What's Missing:**
- ❌ Advanced search by author name
- ❌ Filter by year, volume, issue number
- ❌ Filter by research area
- ❌ Filter by paper type (Research, Review, Case Study)
- ❌ Search by keywords (proper keyword indexing)
- ❌ Full-text search in abstracts

**Required Enhancement:**
```javascript
// Add advanced filters:
- searchArticles({ author, year, volume, issue, keyword, researchArea })
- Filter dropdown on Archives page
- Filter sidebar on main paper listing
```

#### 5. **Latest Published Papers** ⚠️ NO DEDICATED PAGE

**Current Status:**
- Articles are displayed under Current Issue page
- No dedicated "Latest Published Papers" page

**What's Missing:**
- ❌ Dedicated "Latest Papers" page showing recent publications across all issues
- ❌ Sort by published_date descending
- ❌ Pagination for large paper lists
- ❌ "Recently Published" section on homepage

**Quick Fix:**
```javascript
// Create new page: src/pages/LatestPapers.jsx
const latestPapers = articles
  .filter(a => a.is_published)
  .sort((a, b) => new Date(b.published_date) - new Date(a.published_date))
  .slice(0, 10); // Show 10 most recent
```

#### 6. **Submission Notifications** ❌ NOT IMPLEMENTED

**What's Missing:**
- ❌ Email to author on successful submission
- ❌ Email to admin when new submission received
- ❌ Email to author when status changes (Under Review, Accepted, Rejected)
- ❌ Email to author when paper is published

**Required:**
- Use Supabase Edge Functions or third-party email service (SendGrid, Resend, etc.)
- Email templates for each notification type

---

## E. WHAT IS INCORRECTLY STRUCTURED

### ⚠️ Areas Needing Improvement

#### 1. **Default Issue Count Configuration**

**Current Issue:**
```javascript
// VolumeManager.jsx - Hardcoded to 6 bimonthly issues
// But journal settings say "Bimonthly (6 Issues Per Year)"
```

**Problem:**
- Auto-generation creates 6 issues (correct for bimonthly)
- Issue names: Number 1-6 with month ranges (Jan-Feb, Mar-Apr, etc.)
- **This is actually CORRECT** based on your requirements

**Verification:** ✅ **No change needed** - matches your spec of 6 bimonthly issues

#### 2. **Admin Session Management**

**Current Issue:**
```javascript
// JournalContext.jsx - Uses both Supabase Auth AND demo fallback
// Demo credentials: gyanaksharsanskritifoundation@gmail.com
```

**Problem:**
- Mixing two auth systems causes confusion
- Demo mode should be development-only
- RLS policies allow ALL operations (true) - bypasses Supabase Auth

**Recommendation:**
- For production: Use Supabase Auth exclusively
- Update RLS policies to check `auth.uid()` for admin operations
- Remove demo credentials hardcoded in code
- Add proper admin user to Supabase Auth users table

#### 3. **Data Storage Strategy**

**Current Issue:**
```javascript
// JournalContext.jsx - Stores data in both localStorage AND Supabase
// Comments show localStorage was causing QuotaExceededError
```

**Problem:**
- Large articles/media objects stored in localStorage
- Context attempts to sync everything to localStorage
- This causes browser storage quota errors

**Solution:**
```javascript
// ONLY sync small/critical data to localStorage:
✅ settings
✅ adminSession
✅ researchAreas
✅ announcements
❌ DO NOT sync: articles, media, theses (too large)
```

**Status:** ✅ **Already fixed** in current code (lines 54-59 in JournalContext.jsx)

#### 4. **Missing Database Indexes**

**Current State:** Basic indexes exist in schema.sql

**Missing Indexes:**
```sql
-- Add these to supabase/schema.sql:
CREATE INDEX idx_articles_issue_id ON articles(issue_id);
CREATE INDEX idx_articles_research_area ON articles(research_area);
CREATE INDEX idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_issues_volume_id ON issues(volume_id);
CREATE INDEX idx_issues_year_issue ON issues(year, issue_number);

-- For full-text search on articles:
CREATE INDEX idx_articles_title_search ON articles USING gin(to_tsvector('english', title));
CREATE INDEX idx_articles_abstract_search ON articles USING gin(to_tsvector('english', abstract));
```

#### 5. **Paper PDF Storage**

**Current Issue:**
```javascript
// ArticleManager.jsx - Supports:
// 1. Drag & drop file upload (converts to Data URL)
// 2. Browse file (converts to Data URL)
// 3. Paste URL
// But does NOT upload to Supabase Storage
```

**Problem:**
- PDFs stored as Data URLs in `pdf_url` field (base64 strings)
- This bloats the database (PDFs can be 5-10MB as base64)
- Data URLs don't work well for download links

**Required Fix:**
```javascript
// Upload PDF to Supabase Storage instead:
const { data, error } = await supabase.storage
  .from('published-papers')
  .upload(`papers/${articleId}.pdf`, pdfFile);

if (!error) {
  const { data: { publicUrl } } = supabase.storage
    .from('published-papers')
    .getPublicUrl(`papers/${articleId}.pdf`);
  
  articleData.pdf_url = publicUrl; // Store public URL, not Data URL
}
```

**Status:** ⚠️ **Needs implementation** - currently uses Data URLs/external URLs only

#### 6. **Submission Table Not in Main Schema**

**Problem:**
- `submissions` table defined in `DATABASE_SCHEMA.sql` (separate file)
- Main schema is `supabase/schema.sql`
- These two schemas are NOT merged

**Impact:**
- Supabase deployment only uses `supabase/schema.sql`
- `submissions` table may not exist in deployed database
- SubmissionsManager will fail if table doesn't exist

**Solution:**
```bash
# Merge DATABASE_SCHEMA.sql into supabase/migrations/
# OR append submission tables to supabase/schema.sql
# Run migration:
supabase db push
```

**Status:** ❌ **Critical** - Submission system tables may not be deployed

---

## F. RECOMMENDED CHANGES

### Priority 1: Critical (Must Fix for Production)

1. **Merge Submission Schema**
   - Copy submission tables from `DATABASE_SCHEMA.sql` to `supabase/schema.sql`
   - Deploy to Supabase via migration
   - Verify tables exist in Supabase dashboard

2. **Implement Submission File Upload**
   - Update `SubmitPaper.jsx` to upload files to Supabase Storage
   - Use bucket: `manuscripts` (create if doesn't exist)
   - Update `SubmissionsManager.jsx` to display uploaded files

3. **Fix PDF Storage**
   - Update `ArticleManager.jsx` to upload PDFs to Supabase Storage
   - Use bucket: `published-papers`
   - Store public URL in `articles.pdf_url`, not Data URL

4. **Implement Paper Status Workflow**
   - Add `status` field to `articles` table: 
     ```sql
     ALTER TABLE articles ADD COLUMN status TEXT DEFAULT 'draft' 
     CHECK (status IN ('draft', 'submitted', 'under_review', 'revision_required', 'accepted', 'rejected', 'published'));
     ```
   - Update ArticleManager to show status dropdown
   - Filter published papers: WHERE status='published' AND is_published=true

5. **Add Missing Indexes**
   - Apply all SQL indexes from section E.4 above

### Priority 2: Important (Needed for Full Functionality)

6. **Implement Advanced Search**
   - Add filter dropdowns to Archives page
   - Implement search by: author, year, volume, issue, keyword, research area
   - Add PostgreSQL full-text search using GIN indexes

7. **Create Latest Papers Page**
   - New route: `/latest-papers`
   - Show 20 most recent published papers
   - Add pagination (10 papers per page)

8. **Issue Publishing Workflow**
   - Add `issue_status` field to issues table: ('draft', 'in_progress', 'published')
   - Add "Publish Issue" button in IssueManager
   - When published:
     - Set all articles in issue to published=true
     - Mark issue as published
     - Update homepage "Latest Issue" pointer

9. **Email Notifications**
   - Set up Supabase Edge Function for email
   - Integrate SendGrid or Resend for email delivery
   - Create email templates for:
     - Submission confirmation
     - Status updates
     - Publication notification

10. **Admin Security Hardening**
    - Remove demo credentials from production build
    - Update RLS policies to use Supabase Auth properly:
      ```sql
      CREATE POLICY "Admin Only" ON articles FOR ALL 
      USING (auth.jwt()->>'role' = 'admin');
      ```
    - Create admin user in Supabase Auth
    - Assign custom claim: role='admin'

### Priority 3: Nice to Have (Enhancements)

11. **Author Dashboard**
    - Allow authors to track their submission status
    - Login via submission ID or email
    - View review comments (if provided by admin)

12. **Automated DOI Generation**
    - Integrate with DataCite or Crossref API
    - Auto-generate DOI when paper is published
    - Format: `10.5281/ijcast.{year}.{paper_id}`

13. **Issue Table of Contents PDF**
    - Auto-generate TOC PDF for each published issue
    - List all papers with authors, page numbers
    - Downloadable from issue page

14. **Paper Statistics Dashboard**
    - Track views, downloads per paper
    - Most viewed/downloaded papers widget
    - Research area distribution charts

15. **ORCID Integration**
    - Allow authors to login/verify via ORCID OAuth
    - Auto-populate author data from ORCID profile
    - Verify ORCID iDs are valid

---

## G. CURRENT DATABASE RELATIONSHIP DIAGRAM

```
┌─────────────────────────────┐
│   journal_settings          │
│  (Single row configuration) │
└─────────────────────────────┘

┌─────────────────────────────┐
│         volumes             │
│  • id (UUID, PK)            │
│  • volume_number (int)      │
│  • year (int)               │
│  • description (text)       │
│  • status (Active/Archived) │
│  • created_at               │
└──────────┬──────────────────┘
           │
           │ 1:N
           ↓
┌─────────────────────────────┐
│         issues              │
│  • id (UUID, PK)            │
│  • volume_id (FK) ────────→ │
│  • issue_number (int)       │
│  • month_range (text)       │
│  • year (int)               │
│  • pub_date (date)          │
│  • cover_url (text)         │
│  • editorial_note (text)    │
│  • sort_order (int)         │
│  • created_at               │
└──────────┬──────────────────┘
           │
           │ 1:N
           ↓
┌──────────────────────────────────────────────┐
│              articles                        │
│  • id (UUID, PK)                             │
│  • issue_id (FK) ──────────→                 │
│  • title (text)                              │
│  • authors (JSONB array)                     │
│  • corresponding_author (text)               │
│  • corresponding_author_email (text)         │
│  • orcids (JSONB array)                      │
│  • abstract (text)                           │
│  • keywords (text[])                         │
│  • research_area (text) ────┐                │
│  • article_type (text)       │                │
│  • received_date (date)      │                │
│  • revised_date (date)       │                │
│  • accepted_date (date)      │                │
│  • published_date (date)     │                │
│  • doi (text)                │                │
│  • page_numbers (text)       │                │
│  • references (text)         │                │
│  • pdf_url (text)            │                │
│  • sort_order (int)          │                │
│  • is_published (boolean)    │                │
│  • created_at                │                │
└──────────────────────────────┼────────────────┘
                               │
                               │ N:1
                               ↓
                    ┌─────────────────────────┐
                    │   research_areas        │
                    │  • id (UUID, PK)        │
                    │  • category (text)      │
                    │  • subcategories ([])   │
                    │  • sort_order (int)     │
                    └─────────────────────────┘

┌─────────────────────────────┐
│   editorial_members         │
│  • id (UUID, PK)            │
│  • name (text)              │
│  • role (text)              │
│  • institution (text)       │
│  • research_area (text) ────→ (logical link)
│  • is_active (boolean)      │
│  • sort_order (int)         │
└─────────────────────────────┘

┌─────────────────────────────┐      ┌────────────────────────────┐
│     submissions             │      │  submission_authors        │
│  • id (UUID, PK)            │      │  • id (UUID, PK)           │
│  • submission_id (text)     │  ◄───┤  • submission_id (FK)      │
│  • author_name              │  1:N │  • name                    │
│  • author_email             │      │  • email                   │
│  • paper_title              │      │  • affiliation             │
│  • abstract                 │      │  • author_order (int)      │
│  • keywords                 │      └────────────────────────────┘
│  • manuscript_file_url      │
│  • status (workflow)        │
│  • submitted_date           │
│  • reviewed_date            │
│  • accepted_date            │
│  • published_date           │
└─────────────────────────────┘
         │
         │ (Future: when accepted)
         │
         ↓
   ┌─────────────┐
   │  articles   │  (link submission to published article)
   └─────────────┘

┌─────────────────────────────┐
│         theses              │
│  • id (UUID, PK)            │
│  • degree_type              │
│  • title                    │
│  • scholar_name             │
│  • guide_names (JSONB)      │
│  • university               │
│  • year                     │
│  • pdf_url                  │
└─────────────────────────────┘

┌─────────────────────────────┐
│      conferences            │
│  • id (UUID, PK)            │
│  • conference_name          │
│  • organizer                │
│  • conference_date          │
│  • research_areas (JSONB)   │
│  • paper_titles (JSONB)     │
│  • proceedings_pdf_url      │
└─────────────────────────────┘

┌─────────────────────────────┐
│      announcements          │
│  • id (UUID, PK)            │
│  • title                    │
│  • message                  │
│  • type                     │
│  • expires_at               │
│  • is_active                │
└─────────────────────────────┘

┌─────────────────────────────┐
│      apc_payments           │
│  • id (UUID, PK)            │
│  • order_id                 │
│  • author_name              │
│  • manuscript_id            │
│  • amount                   │
│  • payment_status           │
│  • created_at               │
└─────────────────────────────┘
```

---

## H. RECOMMENDED FINAL ARCHITECTURE

### Database Schema (Complete)

```sql
-- CORE JOURNAL HIERARCHY
journal_settings (1 row)
    ↓
volumes (many) [volume_number, year, status]
    ↓
issues (many per volume) [issue_number, month_range, year, issue_status: draft/published]
    ↓
articles (many per issue) [
    -- Core fields
    title, abstract, keywords,
    
    -- Author info
    authors (JSONB), corresponding_author, orcids,
    
    -- Categorization
    research_area, article_type,
    
    -- Workflow
    status: draft/submitted/under_review/revision_required/accepted/rejected/published,
    
    -- Timeline
    received_date, revised_date, accepted_date, published_date,
    
    -- Publication
    doi, page_numbers, references, pdf_url,
    
    -- Display
    sort_order, is_published
]

-- SUBMISSION SYSTEM
submissions [
    submission_id (RJ-YYYY-####),
    author details,
    paper details,
    manuscript_file_url,
    cover_letter_file_url,
    copyright_file_url,
    status: SUBMITTED/UNDER REVIEW/REVISION REQUIRED/ACCEPTED/REJECTED/PUBLISHED,
    internal_notes,
    reviewer_comments,
    linked_article_id (NULL until published)
]
    ↓ 1:N
submission_authors [co-author details]

-- EDITORIAL & CONTENT
editorial_members [name, role, institution, research_area]
research_areas [category, subcategories[]]
page_content [CMS for static pages]

-- ADDITIONAL FEATURES
theses [scholar theses repository]
conferences [conference proceedings]
announcements [newsflash banner]
apc_payments [payment records]
media [file library]
contact_messages [contact form]
```

### File Storage Buckets (Supabase Storage)

```
supabase.storage/
├── manuscripts/              # Private bucket for submissions
│   ├── RJ-2026-0001/
│   │   ├── manuscript.pdf
│   │   ├── cover-letter.pdf
│   │   └── copyright.pdf
│   └── ...
│
├── published-papers/         # Public bucket for published articles
│   ├── 2026/
│   │   ├── vol-1-issue-1-paper-01.pdf
│   │   ├── vol-1-issue-1-paper-02.pdf
│   │   └── ...
│   └── ...
│
├── journal-images/           # Public bucket for images
│   ├── covers/               # Issue covers
│   ├── editorial/            # Editorial board photos
│   └── logos/                # Journal logos
│
└── issue-toc/                # Public bucket for issue TOC PDFs
    ├── 2026-vol-1-issue-1-toc.pdf
    └── ...
```

### Admin Interface Structure

```
Admin Dashboard
├── Volumes Management         ✅ Implemented
├── Issues Management          ✅ Implemented
├── Articles Management        ✅ Implemented (needs PDF storage fix)
├── Submissions Management     ⚠️ Partially implemented (needs file upload)
├── Editorial Board            ✅ Implemented
├── Research Areas             ✅ Implemented
├── Journal Settings           ✅ Implemented
├── Page Content (CMS)         ✅ Implemented
├── Media Library              ✅ Implemented
├── Theses                     ✅ Implemented
├── Conferences                ✅ Implemented
└── Announcements              ✅ Implemented
```

### Public Website Structure

```
Public Pages
├── Home                       ✅ Implemented
├── Current Issue              ✅ Implemented (shows active volume/issue papers)
├── Archives                   ✅ Implemented (tree: Year→Volume→Issue→Papers)
├── Article Detail             ✅ Implemented (individual paper page with citation)
├── Submit Paper               ⚠️ Partially implemented (needs file upload)
├── Latest Papers              ❌ Missing (needs new page)
├── Search                     ✅ Implemented (basic, needs enhancement)
├── About                      ✅ Implemented
├── Editorial Board            ✅ Implemented
├── For Authors                ✅ Implemented
├── Publication Ethics         ✅ Implemented
├── APC                        ✅ Implemented
├── Conferences                ✅ Implemented
├── Theses                     ✅ Implemented
└── Contact                    ✅ Implemented
```

---

## FINAL RECOMMENDATIONS SUMMARY

### Immediate Actions (This Week)

1. **Merge submission schema** - Deploy submissions tables to Supabase
2. **Fix PDF storage** - Upload PDFs to Supabase Storage, not Data URLs
3. **Implement file upload** - Complete submission file upload feature
4. **Add paper status field** - Implement full workflow (draft→published)
5. **Test submission flow** - Submit test paper and verify admin can see it

### Short-term Actions (Next 2 Weeks)

6. **Add advanced search** - Filter by author, year, volume, issue, keyword
7. **Create Latest Papers page** - Show recent publications
8. **Issue publishing workflow** - Add "Publish Issue" button
9. **Add database indexes** - Improve query performance
10. **Set up email notifications** - Submission confirmation emails

### Long-term Enhancements (Next Month)

11. **Author dashboard** - Track submission status
12. **DOI integration** - Auto-generate DOIs
13. **Statistics dashboard** - Paper views/downloads tracking
14. **ORCID integration** - Verify author ORCID iDs
15. **Issue TOC generation** - Auto-generate issue table of contents PDFs

---

## CONCLUSION

Your IJCAST project **DOES have the correct Volume → Issue → Paper architecture** and is **database-driven through Supabase**, NOT a blog system. The core structure is solid.

**Critical Gaps:**
1. Submission system incomplete (file uploads not working)
2. PDF storage uses Data URLs instead of Supabase Storage
3. Paper workflow states not fully implemented
4. Submission tables may not be deployed to Supabase

**What Works Well:**
- Volume/Issue/Paper hierarchy is properly implemented
- Admin components for managing all entities exist
- Public website correctly displays papers under Volume/Issue
- Search functionality exists (needs enhancement)
- Most required features are present

**Recommendation:** Focus on Priority 1 items first (submission system + PDF storage), then enhance with Priority 2 features (search, notifications, workflow). The foundation is strong—you need to complete the submission pipeline and fix file storage.

---

**Report Generated:** October 5, 2026  
**Next Steps:** Review this audit with your team and prioritize fixes based on launch timeline.
