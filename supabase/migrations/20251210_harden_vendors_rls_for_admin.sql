-- Phase 1 – Vendors RLS Hardening
-- Tujuan:
--   - Memungkinkan admin/superadmin membaca daftar semua vendor.
--   - Memungkinkan admin/superadmin mengubah status vendor (approve/reject)
--     lewat server actions, tanpa menghapus aturan bahwa vendor hanya bisa
--     mengakses profilnya sendiri.

-- Safety: pastikan tidak menghapus policy existing vendor-only.
-- Kita hanya menambah policy baru, dan jika policy dengan nama yang sama
-- sudah pernah dibuat, kita drop dulu lalu recreate.

-- 1) Policy SELECT tambahan untuk admin/superadmin
DROP POLICY IF EXISTS "Admin can view all vendors" ON public.vendors;

CREATE POLICY "Admin can view all vendors"
  ON public.vendors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'superadmin')
    )
  );

-- 2) Policy UPDATE tambahan untuk admin/superadmin (fokus status)
DROP POLICY IF EXISTS "Admin can update vendor status" ON public.vendors;

CREATE POLICY "Admin can update vendor status"
  ON public.vendors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    status IN ('pending', 'approved', 'rejected')
  );

