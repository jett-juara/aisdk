-- Migration: Add SEO Metadata Columns to CMS Tables
-- Created: 2025-12-03
-- Description: Add SEO metadata columns to cms_pages and alt_text to cms_image_grid_items

-- ============================================
-- Add SEO Metadata Columns to cms_pages
-- ============================================

ALTER TABLE public.cms_pages
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

COMMENT ON COLUMN public.cms_pages.meta_title IS 'Custom meta title for SEO and Open Graph';
COMMENT ON COLUMN public.cms_pages.meta_description IS 'Custom meta description for SEO and Open Graph';
COMMENT ON COLUMN public.cms_pages.og_image_url IS 'Open Graph image URL for social media sharing';
COMMENT ON COLUMN public.cms_pages.canonical_url IS 'Canonical URL for SEO';

-- ============================================
-- Add Alt Text Column to cms_image_grid_items
-- ============================================

ALTER TABLE public.cms_image_grid_items
ADD COLUMN IF NOT EXISTS alt_text TEXT;

COMMENT ON COLUMN public.cms_image_grid_items.alt_text IS 'Alt text for image accessibility, fallback to label if empty';

-- ============================================
-- Update updated_at Trigger (if needed)
-- ============================================

-- Ensure updated_at is automatically updated on row changes
-- This trigger should already exist from initial migration, but we verify it exists

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_cms_pages_updated_at'
    ) THEN
        CREATE TRIGGER update_cms_pages_updated_at
            BEFORE UPDATE ON public.cms_pages
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_cms_image_grid_items_updated_at'
    ) THEN
        CREATE TRIGGER update_cms_image_grid_items_updated_at
            BEFORE UPDATE ON public.cms_image_grid_items
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
