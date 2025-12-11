-- Phase 1 – Data Foundation Hardening
-- Hardening RLS untuk tabel public.projects
-- Konteks:
--   - Awalnya, Phase 1 pakai policy placeholder:
--       "Projects are viewable by authenticated users" USING (true)
--   - Setelah implementasi Vendor Dashboard & Collaboration Console,
--     diputuskan bahwa project dengan status 'draft' tidak perlu
--     terlihat oleh user authenticated biasa.
--   - Admin tetap bisa mengakses data lengkap projects via service_role
--     atau server actions di sisi backend.

-- Drop policy placeholder lama
DROP POLICY IF EXISTS "Projects are viewable by authenticated users" ON public.projects;

-- Policy baru: semua user authenticated hanya bisa SELECT project non-draft
CREATE POLICY "Projects are viewable (non-draft)" 
    ON public.projects FOR SELECT
    TO authenticated
    USING (status <> 'draft');

