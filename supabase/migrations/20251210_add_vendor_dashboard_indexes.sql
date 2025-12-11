-- Phase 1 – Data Foundation Hardening
-- Indexing for Vendor Dashboard / Collaboration Console
-- Fokus: tambah index yang belum ada untuk pola query utama
-- tanpa menduplikasi index yang sudah tersedia.

-- 1) Messages: inbox vendor (filter vendor_id, sort created_at DESC)
DO $$
BEGIN
    IF to_regclass('public.messages') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_messages_vendor_created_at
            ON public.messages (vendor_id, created_at DESC);
    END IF;
END;
$$;

-- 2) Vendor Change Logs: history per vendor (filter vendor_id, sort created_at DESC)
DO $$
BEGIN
    IF to_regclass('public.vendor_change_logs') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_vendor_change_logs_vendor_created_at
            ON public.vendor_change_logs (vendor_id, created_at DESC);
    END IF;
END;
$$;
