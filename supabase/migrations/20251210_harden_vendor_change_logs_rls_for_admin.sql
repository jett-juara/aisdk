-- Phase 1 – Vendors RLS Hardening (vendor_change_logs)
-- Tujuan:
--   - Memungkinkan admin/superadmin menulis log untuk vendor mana pun
--     (approve/reject, tindakan administratif lain).
--   - Memungkinkan admin/superadmin membaca seluruh log untuk audit internal.
--   - Tetap menjaga bahwa vendor hanya bisa melihat dan menulis log miliknya sendiri.

-- Safety: policy vendor existing ("Vendors can view/insert logs") tetap dibiarkan.
-- Di sini kita hanya menambah jalur khusus admin, dan jika policy dengan nama yang
-- sama sudah ada, kita drop dulu lalu recreate.

-- 1) Policy INSERT tambahan untuk admin/superadmin
DO $$
BEGIN
  IF to_regclass('public.vendor_change_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admin can insert logs for vendors" ON public.vendor_change_logs;

    CREATE POLICY "Admin can insert logs for vendors"
      ON public.vendor_change_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'superadmin')
        )
      );
  END IF;
END;
$$;

-- 2) Policy SELECT tambahan untuk admin/superadmin (audit history)
DO $$
BEGIN
  IF to_regclass('public.vendor_change_logs') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admin can view all vendor change logs" ON public.vendor_change_logs;

    CREATE POLICY "Admin can view all vendor change logs"
      ON public.vendor_change_logs
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'superadmin')
        )
      );
  END IF;
END;
$$;
