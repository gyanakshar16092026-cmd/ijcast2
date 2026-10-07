-- ========================================================
-- EDITORIAL MEMBERS DATABASE CLEANUP
-- Run this in Supabase Dashboard → SQL Editor
-- ========================================================

-- This fixes the issue where deleted editorial members still show on public page
-- even though they were removed from admin panel

-- 1. FIRST: Check current editorial members in database
SELECT 
    id, 
    name, 
    role, 
    institution, 
    country,
    is_active,
    sort_order,
    created_at
FROM editorial_members 
ORDER BY sort_order, name;

-- 2. REMOVE ANY DUPLICATE OR UNWANTED MEMBERS
-- Delete Sailendra Kondapalli if he still exists (since you deleted him)
DELETE FROM editorial_members 
WHERE name = 'Sailendra Kondapalli';

-- 3. ALSO REMOVE ANY OTHER UNWANTED TEST MEMBERS
-- Uncomment and modify these if you have other members to remove:
-- DELETE FROM editorial_members WHERE name = 'Test Member';
-- DELETE FROM editorial_members WHERE id = 'specific-uuid-here';

-- 4. VERIFY ONLY WANTED MEMBERS REMAIN
SELECT 
    'After cleanup:' as status,
    id, 
    name, 
    role, 
    is_active,
    sort_order
FROM editorial_members 
ORDER BY sort_order, name;

-- 5. FIX SORT ORDER (make sure it's sequential: 1, 2, 3...)
-- Use a subquery approach instead of window functions in UPDATE
WITH ordered_members AS (
  SELECT id, row_number() OVER (ORDER BY created_at) as new_order
  FROM editorial_members
)
UPDATE editorial_members 
SET sort_order = ordered_members.new_order
FROM ordered_members 
WHERE editorial_members.id = ordered_members.id;

-- 6. ENSURE DR. RAJNEESH KARN EXISTS (if not, add him)
INSERT INTO editorial_members (name, role, designation, institution, country, is_active, sort_order) 
SELECT 'Dr. Rajneesh Karn', 'Editor-in-Chief', 'Professor of Commerce', 'University of Delhi', 'India', true, 1
WHERE NOT EXISTS (SELECT 1 FROM editorial_members WHERE name = 'Dr. Rajneesh Karn');

-- 7. FINAL VERIFICATION - Show clean member list
SELECT 
    'FINAL CLEAN LIST:' as status,
    sort_order,
    name, 
    role, 
    institution,
    country,
    is_active,
    CASE 
        WHEN photo_url IS NULL OR photo_url = '' THEN '(no photo)'
        WHEN photo_url LIKE 'data:%' THEN '(base64 photo - needs upload)'
        ELSE '(proper URL photo)'
    END as photo_status
FROM editorial_members 
ORDER BY sort_order;

-- ========================================================
-- OPTIONAL: RESET ALL EDITORIAL MEMBERS (NUCLEAR OPTION)
-- ========================================================
-- Only uncomment and run this if you want to start completely fresh:

/*
-- WARNING: This will delete ALL editorial members and start over
DELETE FROM editorial_members;

-- Add only Dr. Rajneesh Karn as Editor-in-Chief
INSERT INTO editorial_members (name, role, designation, institution, country, is_active, sort_order) 
VALUES ('Dr. Rajneesh Karn', 'Editor-in-Chief', 'Professor of Commerce', 'University of Delhi', 'India', true, 1);

SELECT 'All editorial members reset - only Dr. Rajneesh Karn remains' as message;
*/