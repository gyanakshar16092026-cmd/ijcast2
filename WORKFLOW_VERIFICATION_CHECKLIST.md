# ✅ IJCAST Workflow Verification Checklist

Use this checklist to verify everything is working correctly after database deployment.

## 🗄️ Database Verification

### Step 1: Check Tables Exist
```sql
-- Run in Supabase SQL Editor
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected tables:**
- [ ] articles
- [ ] contact_messages  
- [ ] editorial_members
- [ ] issues
- [ ] journal_settings
- [ ] media
- [ ] page_content
- [ ] research_areas
- [ ] submission_authors
- [ ] submissions
- [ ] volumes

### Step 2: Check Initial Data
```sql
-- Verify journal settings
SELECT journal_name, issn, eissn FROM journal_settings;

-- Expected: IJCAST, ISSN 2394-9007, e-ISSN 2394-9007
```

## 📝 Frontend Testing

### Step 1: Homepage Check
- [ ] **Navigate to:** `http://localhost:3000`
- [ ] **Verify ISSN displays:** `ISSN 2394-9007`
- [ ] **No console errors** (F12 → Console tab)
- [ ] **All navigation links work**

### Step 2: Submission Form Test
- [ ] **Navigate to:** `/submit-paper`
- [ ] **Fill required fields:**
  - [ ] Author name: `Test Author`
  - [ ] Email: `test@example.com`
  - [ ] Phone: `+91 9999999999`
  - [ ] Affiliation: `Test Department`
  - [ ] Institution: `Test University`
  - [ ] Country: `India`
  - [ ] Paper title: `Test Paper Title`
  - [ ] Abstract: `This is a test abstract with sufficient content.`
  - [ ] Keywords: `test, paper, submission`
  - [ ] Upload manuscript: Any PDF file
  - [ ] Check consent checkbox
- [ ] **Click Submit**
- [ ] **Verify success page** shows submission ID like `RJ-2024-####`

### Step 3: Admin Panel Test
- [ ] **Navigate to:** `/admin`
- [ ] **Click Submissions tab**
- [ ] **Verify test submission appears**
- [ ] **Click eye icon** to view details
- [ ] **Verify all fields populated:**
  - [ ] Author information complete
  - [ ] Paper title correct
  - [ ] Abstract displays
  - [ ] Keywords show as badges
  - [ ] Files show download links
  - [ ] Status shows "SUBMITTED"

## 🔧 Troubleshooting

### If ISSN not showing:
```sql
-- Check if initial data was inserted
SELECT COUNT(*) FROM journal_settings;
-- Should return 1

-- If 0, re-run insert-initial-data.sql
```

### If 404 errors persist:
1. **Check Supabase URL** in `.env` file
2. **Verify API key** is correct
3. **Re-run deploy-clean.sql** if tables missing

### If submission fails:
1. **Check browser console** for errors
2. **Verify file upload** - check Storage buckets exist
3. **Test with smaller file** (< 2MB)

## ✅ Success Criteria

**All systems working when:**
- [ ] No 404 errors in browser console
- [ ] ISSN 2394-9007 displays on homepage
- [ ] Submission form accepts and saves data
- [ ] Admin can view complete submission details
- [ ] Files upload and download successfully
- [ ] Status workflow reflects offline editorial process

---

**If all checkboxes are ✅ - Your IJCAST platform is fully functional!** 🎉