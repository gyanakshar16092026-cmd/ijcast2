# 🚀 Quick Fixes - Do These Now

## Problem 1: ISSN Not Showing
**Cause:** `journal_settings` table is empty

**Fix:** Run this SQL in Supabase SQL Editor:

1. Open: https://supabase.com/dashboard → Your Project → SQL Editor
2. Copy contents of: `supabase/insert-initial-data.sql`
3. Paste and click RUN
4. ✅ ISSN will now show on website

---

## Problem 2: Article Not Showing on Detail Page
**Cause:** Article IDs don't match between database UUID and local string ID

**Status:** This should work now after database deployment
- Database creates UUID for articles
- Frontend looks up by UUID
- Should match correctly

**Test:**
1. Go to Latest Papers: http://localhost:5173/latest-papers
2. Click on your published article
3. Should open detail page correctly

If NOT working:
- Check browser console for errors
- Verify article exists in Supabase → Table Editor → articles
- Check if article has `is_published = true`

---

## Next: Run SQL

```sql
-- Copy this entire block and run in Supabase SQL Editor:

INSERT INTO journal_settings (
  journal_name, short_name, issn, eissn, doi_prefix, publisher,
  publication_frequency, language, contact_email, alternate_email,
  phone, postal_address, copyright_statement, license_name, license_url,
  is_open_access, open_access_statement
) VALUES (
  'International Journal of Commerce, Arts, Science and Technology',
  'IJCAST',
  'ISSN 2394-9007',
  'e-ISSN 2394-9007',
  '10.5281/ijcast',
  'Gyanaakshar Sanskriti Foundation',
  'Bi-Monthly (6 Issues / Year)',
  'English',
  'editor.ijcast.in@gmail.com',
  'gyanaksharsanskritifoundation@gmail.com',
  '+91-XXXXXXXXXX',
  'New Delhi, India',
  'Copyright © IJCAST. All rights reserved.',
  'Creative Commons Attribution 4.0 International (CC BY 4.0)',
  'https://creativecommons.org/licenses/by/4.0/',
  false,
  'All published articles are freely available online.'
) ON CONFLICT DO NOTHING;

-- Insert research areas
INSERT INTO research_areas (category, subcategories, sort_order) VALUES
  ('Commerce & Management', ARRAY['Accounting', 'Finance', 'Marketing'], 1),
  ('Arts & Humanities', ARRAY['Literature', 'History', 'Philosophy'], 2),
  ('Science & Technology', ARRAY['Computer Science', 'Engineering'], 3)
ON CONFLICT (category) DO NOTHING;
```

After running:
1. Refresh website (Ctrl+Shift+R)
2. Check homepage - ISSN should show
3. Check footer - ISSN should show
4. Check article detail pages

---

## Website Audit (What to Keep/Remove)

### ✅ KEEP (Essential Features):
1. **Homepage** - Main entry point
2. **Current Issue** - Shows latest published issue
3. **Archives** - Browse all volumes/issues
4. **Latest Papers** - Search/filter published papers
5. **Submit Paper** - User submission form ⭐
6. **Article Detail** - Full paper information
7. **About** - Journal information
8. **Editorial Board** - Editorial team
9. **For Authors** - Submission guidelines
10. **Research Areas** - Research categories
11. **Indexing** - Where journal is indexed
12. **Contact** - Contact form
13. **Admin Dashboard** - Admin management ⭐
14. **Admin Submissions** - Review submissions ⭐

### ❌ REMOVE (Optional/Unused):
1. **Theses** - Not needed for research journal
2. **Conferences** - Not core feature
3. **APC Payment** - Can be handled manually
4. **Ethics Policy** - Can be static page content
5. **Privacy Policy** - Can be static page content
6. **Copyright Policy** - Can be static page content

### 🔧 NEEDS FIXING:
1. ✅ ISSN display - **FIXED with SQL above**
2. ✅ Article detail page - **Should work now**
3. ⏳ Navigation cleanup - Remove unused links
4. ⏳ Homepage optimization - Focus on current issue & latest papers

---

## Action Items (In Order):

1. ✅ **Database deployed** - DONE
2. ⏳ **Insert initial data** - DO NOW (SQL above)
3. ⏳ **Test submission workflow** - After SQL
4. ⏳ **Clean up navigation** - Remove unused pages
5. ⏳ **Optimize homepage** - Make it cleaner

---

## After SQL is Run:

Test this workflow:
1. Submit test paper (http://localhost:5173/submit-paper)
2. Check admin (http://localhost:5173/admin → Submissions tab)
3. Approve & publish
4. Check Latest Papers (http://localhost:5173/latest-papers)
5. Click paper title → Should open detail page
6. Verify ISSN shows on homepage and footer

✅ Everything should work!
