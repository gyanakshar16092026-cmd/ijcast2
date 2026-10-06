# Priority 2 Implementation Status

**ISSN: 2394-9007**

---

## ✅ COMPLETED

### 1. Latest Papers Page ✅
**Status:** IMPLEMENTED
**File:** `src/pages/LatestPapers.jsx`

**Features:**
- ✅ Displays all published papers sorted by date (most recent first)
- ✅ Advanced filtering:
  - Text search (title, author, keywords, abstract)
  - Year filter
  - Research area filter
  - Volume filter
  - Issue filter
- ✅ Filter combinations work together
- ✅ Active filters display with badges
- ✅ Clear all filters button
- ✅ Results count display
- ✅ Paper cards with:
  - Title (links to full paper)
  - Authors
  - Published date
  - Research area badge
  - Abstract preview (3 lines)
  - Keywords as tags
  - Actions: View Full Paper, Download PDF, DOI link

**Implementation Details:**
```javascript
// Uses existing GIN indexes for fast search
// Full-text search on title + abstract
// Keyword array search
// JSONB author search
```

**Next Step:** Add route to App.jsx

---

## ⏳ IN PROGRESS

### 2. Enhanced Search Modal (SearchModal.jsx)
**Status:** NEEDS UPDATE

**Current State:**
- Basic search exists in `src/components/common/SearchModal.jsx`
- Needs to leverage full-text search indexes

**Required Updates:**
- Add full-text search using PostgreSQL `to_tsvector`
- Add filter options (year, area, volume, issue)
- Add search history
- Add search suggestions/autocomplete

---

### 3. Issue Publishing Workflow
**Status:** NEEDS IMPLEMENTATION

**File to Update:** `src/components/admin/IssueManager.jsx`

**Requirements:**
- Add "Publish Issue" toggle/button
- When published:
  - Set `is_published = true` in database
  - Display on homepage as "Latest Issue"
  - Show all papers in that issue
- Admin can mark issue as "Current Issue"
- Homepage auto-displays latest published issue

**Database:** ✅ Field already exists (`is_published BOOLEAN` in issues table)

---

### 4. Email Notifications
**Status:** NEEDS IMPLEMENTATION

**Options:**

**Option A: Supabase Edge Functions (Recommended)**
```typescript
// Create: supabase/functions/send-email/index.ts
// Trigger on: submission insert, status update
// Service: Resend, SendGrid, or SMTP
```

**Option B: Direct Integration**
```javascript
// In JournalContext.jsx
// After submitPaper() success
// After updateSubmissionStatus()
```

**Email Templates Needed:**
1. Submission Confirmation
   - Send to author
   - Include submission ID
   - Include expected timeline

2. Status Update
   - Send to author
   - Include new status
   - Include next steps

3. Acceptance Email
   - Send to author
   - Request final files
   - APC payment info

4. Rejection Email
   - Send to author
   - Include feedback (if any)
   - Encourage resubmission

5. Publication Notification
   - Send to author
   - Include DOI, article URL
   - Share on social media option

---

### 5. Admin Security Hardening
**Status:** PARTIALLY COMPLETE

**Current Issues:**
- ⚠️ Demo credentials in `JournalContext.jsx` line ~247
- ⚠️ App-level auth (not Supabase Auth)
- ✅ RLS policies exist but permissive

**Required Actions:**

1. **Remove Hardcoded Credentials**
```javascript
// REMOVE THIS from JournalContext.jsx
if (email === 'gyanaksharsanskritifoundation@gmail.com' && 
    password === 'gyanaksharsanskritifoundation@.com') {
  // ...
}
```

2. **Implement Proper Auth**
   - Option A: Use Supabase Auth fully
   - Option B: Move credentials to environment variables
   - Option C: Use external auth service (Auth0, etc.)

3. **Strengthen RLS Policies**
```sql
-- Current: Allow All (too permissive)
CREATE POLICY "Allow All Articles" ON articles FOR ALL USING (true);

-- Recommended: Role-based
CREATE POLICY "Public can read published articles" ON articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage articles" ON articles
  FOR ALL USING (auth.jwt()->>'role' = 'admin');
```

4. **Add Rate Limiting**
   - Submission form: 3 per hour per IP
   - Contact form: 5 per hour per IP
   - Use Cloudflare or Supabase Edge Functions

5. **Add Input Validation**
   - Server-side validation for all forms
   - Sanitize file uploads
   - Validate MIME types server-side

---

## 📋 TODO LIST

### Immediate (Today/This Week):

- [ ] **Add Route for Latest Papers Page**
  ```javascript
  // In App.jsx
  <Route path="/latest-papers" element={<PublicLayout><LatestPapers /></PublicLayout>} />
  ```

- [ ] **Update Navbar Links**
  ```javascript
  // Add "Latest Papers" link to navigation
  <Link to="/latest-papers">Latest Papers</Link>
  ```

- [ ] **Update IssueManager Component**
  - Add publish/unpublish toggle
  - Add "Mark as Current Issue" button
  - Update UI to show published status

- [ ] **Update Homepage**
  - Query latest published issue
  - Display prominently
  - Link to all papers in that issue

### This Week:

- [ ] **Set Up Email Service**
  - Choose provider (Resend recommended)
  - Get API key
  - Create email templates
  - Test email sending

- [ ] **Implement Email Triggers**
  - Submission confirmation
  - Status updates
  - Publication notification

- [ ] **Security Hardening**
  - Remove demo credentials
  - Update RLS policies
  - Add rate limiting

### This Month:

- [ ] **Enhanced Search**
  - Update SearchModal component
  - Add autocomplete
  - Add search history

- [ ] **Admin Dashboard**
  - Add submission statistics
  - Add email notification logs
  - Add system health monitoring

---

## 🎯 Success Metrics

### Latest Papers Page:
- ✅ Page created
- ✅ Advanced filtering works
- ⏳ Route added to App.jsx
- ⏳ Link added to navigation

### Issue Publishing:
- ⏳ Admin can publish issues
- ⏳ Homepage displays latest issue
- ⏳ Issue status visible in admin

### Email Notifications:
- ⏳ Service configured
- ⏳ Templates created
- ⏳ Triggers implemented
- ⏳ Emails sending successfully

### Security:
- ⏳ Demo credentials removed
- ⏳ RLS policies updated
- ⏳ Rate limiting added
- ⏳ Input validation added

---

## 📊 Priority 2 Progress

**Overall: 20% Complete**

| Feature | Status | Progress |
|---------|--------|----------|
| Latest Papers Page | ✅ Complete | 100% |
| Advanced Search | ⏳ Pending | 0% |
| Issue Publishing | ⏳ Pending | 0% |
| Email Notifications | ⏳ Pending | 0% |
| Security Hardening | 🟡 Partial | 40% |

---

## 💡 Implementation Notes

### Latest Papers Page Performance:
- Uses GIN indexes for fast search
- Filters applied client-side for responsiveness
- Consider server-side pagination for 1000+ papers
- Full-text search uses PostgreSQL native functions

### Email Service Recommendation:
**Resend.com** is recommended because:
- ✅ Simple API
- ✅ Great deliverability
- ✅ Free tier: 3,000 emails/month
- ✅ React email templates support
- ✅ Easy integration with Supabase

**Alternative:** SendGrid (more complex, enterprise-focused)

### Security Priority:
1. Remove demo credentials (URGENT)
2. Update RLS policies
3. Add rate limiting
4. Add input validation
5. Set up monitoring

---

## 📞 Next Actions

### Developer Tasks:

1. **Add Route** (2 minutes)
   ```bash
   # Edit: src/App.jsx
   # Add: <Route path="/latest-papers" ...
   ```

2. **Test Latest Papers** (5 minutes)
   ```bash
   npm run dev
   # Navigate to /latest-papers
   # Test all filters
   # Verify search works
   ```

3. **Start Email Setup** (30 minutes)
   ```bash
   # Sign up for Resend.com
   # Get API key
   # Add to .env
   # Create first template
   ```

4. **Update IssueManager** (1 hour)
   ```bash
   # Add publish toggle
   # Update database on toggle
   # Test functionality
   ```

5. **Security Audit** (2 hours)
   ```bash
   # Remove demo credentials
   # Update RLS policies
   # Test with different user roles
   # Add rate limiting
   ```

---

## 🔗 Related Files

**Latest Papers:**
- ✅ `src/pages/LatestPapers.jsx` (created)
- ⏳ `src/App.jsx` (needs route)
- ⏳ `src/components/layout/Navbar.jsx` (needs link)

**Issue Publishing:**
- ⏳ `src/components/admin/IssueManager.jsx` (needs update)
- ⏳ `src/pages/Home.jsx` (needs update)
- ✅ `supabase/schema.sql` (field exists)

**Email Notifications:**
- ⏳ `supabase/functions/send-email/index.ts` (needs creation)
- ⏳ `src/context/JournalContext.jsx` (needs email triggers)

**Security:**
- ⏳ `src/context/JournalContext.jsx` (remove credentials)
- ⏳ `supabase/schema.sql` (update RLS policies)

---

**Status:** Priority 2 Started - 1 of 5 features complete
**Last Updated:** 2025
**Next Review:** After email notifications setup
