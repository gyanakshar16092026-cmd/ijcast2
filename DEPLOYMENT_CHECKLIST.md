# IJCAST Platform - Deployment Checklist

**ISSN: 2394-9007**

---

## ✅ Pre-Deployment Checklist

### Phase 1: Database Schema (PRIORITY 1)

- [ ] **1.1 Backup Current Database**
  - Go to Supabase Dashboard > Database > Backups
  - Click "Create Backup"
  - Download backup to local machine
  - File: `ijcast-backup-YYYY-MM-DD.sql`

- [ ] **1.2 Apply New Schema**
  - Open Supabase Dashboard > SQL Editor
  - Open `supabase/schema.sql` from project
  - Copy entire contents
  - Paste into SQL Editor
  - Click "Run"
  - Verify: "Success. No rows returned"

- [ ] **1.3 Verify Tables Created**
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name;
  ```
  - Expected: 15 tables
  - ✅ articles (updated with new fields)
  - ✅ submissions (new)
  - ✅ submission_authors (new)
  - ✅ contact_messages (new)
  - ✅ + 11 existing tables

- [ ] **1.4 Verify Indexes Created**
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE schemaname = 'public' 
  ORDER BY indexname;
  ```
  - Expected: 25+ indexes
  - Check for: `idx_articles_fulltext`, `idx_articles_keywords`, etc.

- [ ] **1.5 Verify Functions Created**
  ```sql
  SELECT routine_name FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION';
  ```
  - Expected: 2 functions
  - ✅ `update_updated_at_column()`
  - ✅ `generate_submission_id()`

- [ ] **1.6 Test Submission ID Generator**
  ```sql
  SELECT generate_submission_id();
  ```
  - Expected output: `RJ-2025-0001` (or current year)

---

### Phase 2: Storage Buckets (PRIORITY 1)

- [ ] **2.1 Create `manuscripts` Bucket**
  - Name: `manuscripts`
  - Public: ❌ UNCHECK
  - File size limit: 10MB (10485760 bytes)
  - Allowed MIME types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

- [ ] **2.2 Create `published-papers` Bucket**
  - Name: `published-papers`
  - Public: ✅ CHECK
  - File size limit: 10MB (10485760 bytes)
  - Allowed MIME types: `application/pdf`

- [ ] **2.3 Create `journal-images` Bucket**
  - Name: `journal-images`
  - Public: ✅ CHECK
  - File size limit: 5MB (5242880 bytes)
  - Allowed MIME types: `image/jpeg, image/png, image/webp`

- [ ] **2.4 Set Storage Policies**
  - Apply policies from `STORAGE_BUCKET_SETUP.md`
  - Verify: 3 policies for `manuscripts`
  - Verify: 4 policies for `published-papers`
  - Verify: 3 policies for `journal-images`

---

### Phase 3: Frontend Testing (PRIORITY 1)

- [ ] **3.1 Test Article PDF Upload (Admin)**
  - Login to admin dashboard
  - Go to Article Management
  - Click "Add New Article"
  - Fill required fields
  - Upload test PDF
  - Expected: "PDF uploaded successfully to Supabase Storage!"
  - Verify file in Supabase Storage > published-papers

- [ ] **3.2 Test Paper Submission (Public)**
  - Logout from admin
  - Go to Submit Paper page
  - Fill all required fields
  - Upload manuscript PDF
  - Upload cover letter (optional)
  - Upload copyright form (optional)
  - Click "Submit Manuscript"
  - Expected: Success page with submission ID (RJ-YYYY-####)
  - Verify files in Supabase Storage > manuscripts
  - Verify record in submissions table

- [ ] **3.3 Test Editorial Photo Upload**
  - Login to admin
  - Go to Editorial Board Management
  - Add/edit member
  - Upload photo
  - Verify file in Supabase Storage > journal-images/editorial/

- [ ] **3.4 Test Article Status Workflow**
  - Open existing article
  - Check "Status" field exists
  - Options: draft, submitted, under_review, accepted, published
  - Save and verify

---

### Phase 4: Data Migration (If Existing Data)

- [ ] **4.1 Export Existing Articles**
  ```sql
  COPY (SELECT * FROM articles) TO '/tmp/articles_export.csv' WITH CSV HEADER;
  ```

- [ ] **4.2 Update Articles with New Fields**
  ```sql
  UPDATE articles SET status = 'published' WHERE is_published = true;
  UPDATE articles SET status = 'draft' WHERE is_published = false;
  UPDATE articles SET views_count = 0, downloads_count = 0;
  ```

- [ ] **4.3 Migrate PDF URLs (If Using Data URLs)**
  - Identify articles with Data URL PDFs (start with `data:`)
  - Extract files and upload to Supabase Storage
  - Update pdf_url field with public URL
  - Script available in project (to be created if needed)

---

### Phase 5: Configuration & Environment

- [ ] **5.1 Verify Environment Variables**
  - Check `.env` file exists
  - Contains: `VITE_SUPABASE_URL`
  - Contains: `VITE_SUPABASE_ANON_KEY`
  - Values match Supabase project settings

- [ ] **5.2 Update Journal Settings**
  - Login to admin
  - Go to Settings
  - Verify ISSN: 2394-9007
  - Update contact email if needed
  - Save settings

- [ ] **5.3 Initialize Research Areas (If Empty)**
  ```sql
  -- Check if research areas exist
  SELECT * FROM research_areas;
  
  -- If empty, insert defaults
  -- (Already done by app on first load)
  ```

---

### Phase 6: Security Hardening (PRIORITY 2)

- [ ] **6.1 Remove Demo Credentials**
  - Search `JournalContext.jsx` for hardcoded passwords
  - Remove or move to environment variables
  - Update login flow

- [ ] **6.2 Enable Supabase Auth (Optional)**
  - Consider migrating from app-level auth to Supabase Auth
  - Create admin users in Supabase Dashboard > Authentication
  - Update login logic

- [ ] **6.3 Review RLS Policies**
  - Verify all tables have RLS enabled
  - Test policies with different user roles
  - Ensure submissions can be inserted by anon users

- [ ] **6.4 Add Rate Limiting**
  - Consider adding rate limiting for submission form
  - Use Supabase Edge Functions or Cloudflare

---

### Phase 7: Performance Optimization

- [ ] **7.1 Test Full-Text Search**
  ```sql
  SELECT title FROM articles
  WHERE to_tsvector('english', title || ' ' || abstract) 
    @@ plainto_tsquery('machine learning');
  ```
  - Should return results instantly (< 100ms)

- [ ] **7.2 Test Keyword Search**
  ```sql
  SELECT title FROM articles
  WHERE 'AI' = ANY(keywords);
  ```
  - Should use GIN index

- [ ] **7.3 Test Author Search**
  ```sql
  SELECT title FROM articles
  WHERE authors @> '[{"name": "Dr. Smith"}]'::jsonb;
  ```
  - Should use GIN index

- [ ] **7.4 Monitor Query Performance**
  - Go to Supabase Dashboard > Database > Query Performance
  - Check slow queries (> 1 second)
  - Add indexes if needed

---

### Phase 8: Monitoring & Analytics

- [ ] **8.1 Set Up Error Logging**
  - Monitor browser console for errors
  - Set up Sentry or similar service (optional)

- [ ] **8.2 Monitor Storage Usage**
  - Go to Settings > Billing > Usage
  - Check storage used
  - Set up alerts for > 80% usage

- [ ] **8.3 Monitor Database Usage**
  - Check database size
  - Monitor connection count
  - Set up alerts

- [ ] **8.4 Set Up Backup Schedule**
  - Supabase auto-backups enabled?
  - Consider daily manual backups
  - Store backups off-site

---

### Phase 9: Documentation

- [ ] **9.1 Update README.md**
  - Add deployment instructions
  - Add storage bucket setup
  - Add troubleshooting guide

- [ ] **9.2 Create Admin User Guide**
  - How to upload articles
  - How to manage submissions
  - How to publish issues

- [ ] **9.3 Create Author Submission Guide**
  - How to submit papers
  - Formatting guidelines
  - File requirements

- [ ] **9.4 Update API Documentation**
  - Document new tables
  - Document new fields
  - Document storage buckets

---

### Phase 10: Final Testing

- [ ] **10.1 Cross-Browser Testing**
  - Chrome: ✅
  - Firefox: ✅
  - Safari: ✅
  - Edge: ✅

- [ ] **10.2 Mobile Testing**
  - iOS Safari: ✅
  - Android Chrome: ✅
  - Responsive design: ✅

- [ ] **10.3 Performance Testing**
  - Page load time < 3 seconds
  - PDF upload < 5 seconds for 5MB file
  - Search results < 1 second

- [ ] **10.4 Accessibility Testing**
  - Keyboard navigation works
  - Screen reader compatible
  - WCAG 2.1 AA compliant

---

## 🚀 Deployment Steps

### Step 1: Deploy Database Changes

```bash
# 1. Backup current database
# (Done via Supabase Dashboard)

# 2. Apply new schema
# (Done via SQL Editor - see Phase 1)

# 3. Verify deployment
psql $DATABASE_URL -c "\dt"  # List tables
psql $DATABASE_URL -c "\di"  # List indexes
```

### Step 2: Deploy Storage Buckets

```bash
# Via Supabase Dashboard
# (See Phase 2)
```

### Step 3: Deploy Frontend

```bash
# 1. Build production bundle
npm run build

# 2. Test production build locally
npm run preview

# 3. Deploy to hosting service
# (Vercel, Netlify, or your preferred host)

# Example: Vercel
vercel --prod

# Example: Netlify
netlify deploy --prod
```

### Step 4: Post-Deployment Verification

```bash
# 1. Visit production URL
# 2. Complete Phase 3 testing
# 3. Monitor errors for 24 hours
# 4. Collect user feedback
```

---

## 🐛 Rollback Plan

### If Deployment Fails:

**Option 1: Restore Database Backup**
```bash
# Via Supabase Dashboard > Database > Backups
# Click "Restore" on previous backup
```

**Option 2: Revert Schema Changes**
```sql
-- Drop new tables
DROP TABLE IF EXISTS submission_authors CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;

-- Revert articles table changes
ALTER TABLE articles DROP COLUMN IF EXISTS status;
ALTER TABLE articles DROP COLUMN IF EXISTS submission_id;
ALTER TABLE articles DROP COLUMN IF EXISTS views_count;
ALTER TABLE articles DROP COLUMN IF EXISTS downloads_count;
ALTER TABLE articles DROP COLUMN IF EXISTS updated_at;

-- Revert issues table changes
ALTER TABLE issues DROP COLUMN IF EXISTS is_published;
```

**Option 3: Revert Frontend**
```bash
# Revert to previous git commit
git revert HEAD
git push origin main

# Redeploy previous version
vercel --prod
```

---

## 📊 Success Criteria

### Priority 1 Must-Pass:
- ✅ All 15 tables exist
- ✅ All 25+ indexes exist
- ✅ All 2 functions work
- ✅ All 3 storage buckets exist
- ✅ Article PDF upload works
- ✅ Paper submission works

### Priority 2 Should-Pass:
- ✅ Full-text search works
- ✅ Keyword search works
- ✅ Submission ID generation works
- ✅ Co-authors stored correctly

### Priority 3 Nice-to-Have:
- ✅ No console errors
- ✅ Page load < 3 seconds
- ✅ Mobile responsive
- ✅ Cross-browser compatible

---

## 📞 Support Contacts

**Technical Issues:**
- Supabase Support: https://supabase.com/support
- Supabase Discord: https://discord.supabase.com
- Documentation: https://supabase.com/docs

**Project Team:**
- Developer: [Your Name]
- Email: [Your Email]
- Emergency Contact: [Phone]

---

## 📝 Post-Deployment Tasks

### Week 1:
- [ ] Monitor error logs daily
- [ ] Check storage usage
- [ ] Collect user feedback
- [ ] Fix critical bugs

### Week 2:
- [ ] Implement Priority 2 features
- [ ] Optimize performance
- [ ] Update documentation
- [ ] Train admin users

### Month 1:
- [ ] Implement Priority 3 features
- [ ] Set up automated backups
- [ ] Set up monitoring alerts
- [ ] Review security audit

---

## ✅ Final Sign-Off

**Deployed By:** _______________  
**Date:** _______________  
**Environment:** Production  
**Version:** 2.0.0 (ISSN 2394-9007)  

**Checklist Complete:** ☐ Yes ☐ No  
**All Tests Passed:** ☐ Yes ☐ No  
**Rollback Plan Ready:** ☐ Yes ☐ No  

**Signature:** _______________

---

**Status:** Ready for Production Deployment 🚀
