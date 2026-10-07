-- ========================================================
-- EDITORIAL MEMBERS TABLE FIX - Update Role Constraint
-- Run this in Supabase Dashboard → SQL Editor
-- ========================================================

-- 1. FIRST: Drop existing trigger if it exists (prevents duplicate trigger error)
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;

-- 2. RECREATE the trigger function (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RECREATE the trigger (now safe since we dropped it first)
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. NOW FIX THE EDITORIAL MEMBERS ROLE CONSTRAINT
ALTER TABLE editorial_members DROP CONSTRAINT IF EXISTS editorial_members_role_check;

-- 5. ADD NEW CONSTRAINT with the roles your app actually uses (including "Associate Editors" plural)
ALTER TABLE editorial_members ADD CONSTRAINT editorial_members_role_check 
CHECK (role IN ('Editor-in-Chief', 'Managing Editor', 'Technical Advisory Board', 'Associate Editors', 'Associate Editor', 'Editorial Board Member'));

-- 6. DROP EXISTING POLICIES (if any) and CREATE NEW ONES  
DROP POLICY IF EXISTS "Allow All Editorial Members" ON editorial_members;
CREATE POLICY "Allow All Editorial Members" ON editorial_members FOR ALL USING (true) WITH CHECK (true);

-- 7. NOW INSERT THE SAMPLE DATA (should work now)
INSERT INTO editorial_members (name, role, designation, institution, country, is_active, sort_order) 
SELECT 'Dr. Rajneesh Karn', 'Editor-in-Chief', 'Professor of Commerce', 'University of Delhi', 'India', true, 1
WHERE NOT EXISTS (SELECT 1 FROM editorial_members WHERE name = 'Dr. Rajneesh Karn');

INSERT INTO editorial_members (name, role, designation, institution, country, is_active, sort_order) 
SELECT 'Sailendra Kondapalli', 'Associate Editors', 'Research Scholar', 'Indian Institute of Technology', 'India', true, 2
WHERE NOT EXISTS (SELECT 1 FROM editorial_members WHERE name = 'Sailendra Kondapalli');

-- 8. VERIFY SUCCESS
SELECT 'Editorial Members Fixed and Ready!' as status, 
       name, role, is_active 
FROM editorial_members 
ORDER BY sort_order;