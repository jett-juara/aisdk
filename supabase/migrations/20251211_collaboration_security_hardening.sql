/**
 * Collaboration Security Hardening
 * 
 * Improvements:
 * 1. Admin RLS policies for 'vendors' table to allow full access.
 * 2. Tightened 'projects' RLS policy to restrict viewing unless 'open' or invited.
 * 3. Schema update for 'vendor_change_logs' to track user ID of modifier.
 * 4. Indexes for performance on commonly queried foreign keys.
 */

-- 1. Admin policies for vendors table
-- Ensure we don't duplicate if they effectively exist, but RLS policies accumulate (OR logic).
-- Explicit admin access is good practice.

CREATE POLICY "Admins can view all vendors" ON vendors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update all vendors" ON vendors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- 2. Tighten projects RLS policy
-- Remove broad read access if it exists (assuming 'Projects are viewable (non-draft)' is the target)
DROP POLICY IF EXISTS "Projects are viewable (non-draft)" ON projects;
DROP POLICY IF EXISTS "Projects are viewable by authenticated users" ON projects; -- Safety drop if named this way

CREATE POLICY "Users can view open projects or their invited projects" ON projects
  FOR SELECT
  TO authenticated
  USING (
    status = 'open'
    OR
    auth.uid() IN (
        SELECT vendor_id FROM bids 
        WHERE project_id = projects.id
    )
  );

-- 3. Fix vendor_change_logs schema
ALTER TABLE vendor_change_logs
ADD COLUMN IF NOT EXISTS changed_by_user_id UUID REFERENCES users(id);

-- 4. Add database indexes
CREATE INDEX IF NOT EXISTS idx_bids_project_id ON bids(project_id);
CREATE INDEX IF NOT EXISTS idx_bids_vendor_id ON bids(vendor_id);
CREATE INDEX IF NOT EXISTS idx_messages_vendor_id ON messages(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_change_logs_vendor_id ON vendor_change_logs(vendor_id);
