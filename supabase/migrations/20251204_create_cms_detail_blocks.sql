-- Migration: CMS Detail Blocks
-- Created: 2025-12-04
-- Description: Add table for detail content per page/item (state 2)

-- ============================================
-- Table: cms_detail_blocks
-- ============================================
CREATE TABLE public.cms_detail_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL REFERENCES public.cms_pages(slug) ON DELETE CASCADE,
    item_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    alt_text TEXT,
    status public.cms_page_status NOT NULL DEFAULT 'draft',
    position INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(page_slug, item_slug)
);

CREATE INDEX idx_cms_detail_blocks_page_slug ON public.cms_detail_blocks(page_slug);
CREATE INDEX idx_cms_detail_blocks_status ON public.cms_detail_blocks(status);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE public.cms_detail_blocks ENABLE ROW LEVEL SECURITY;

-- Public can read published detail blocks from published pages
CREATE POLICY "Public can read published detail blocks"
    ON public.cms_detail_blocks
    FOR SELECT
    USING (
        status = 'published'
        AND EXISTS (
            SELECT 1 FROM public.cms_pages
            WHERE cms_pages.slug = cms_detail_blocks.page_slug
            AND cms_pages.status = 'published'
        )
    );

-- Admin/superadmin can read all detail blocks
CREATE POLICY "Admin can read all detail blocks"
    ON public.cms_detail_blocks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Admin/superadmin can manage detail blocks
CREATE POLICY "Admin can manage detail blocks"
    ON public.cms_detail_blocks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ============================================
-- Notes:
-- - Detail images should be stored under bucket `cms_marketing_images`
--   with path pattern `detail/{page_slug}/{item_slug}/*`
