-- Migration: CMS and Collaboration Schema
-- Created: 2025-12-03
-- Description: Create CMS tables for marketing content and collaboration tables for projects/bidding

-- ============================================
-- PART 1: CMS Tables for Marketing Content
-- ============================================

-- Create enum for page status
CREATE TYPE public.cms_page_status AS ENUM ('draft', 'review', 'published', 'archived');

-- Table: cms_pages
CREATE TABLE public.cms_pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status public.cms_page_status DEFAULT 'draft' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: cms_content_blocks
CREATE TABLE public.cms_content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL REFERENCES public.cms_pages(slug) ON DELETE CASCADE,
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    type TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(page_slug, section, key)
);

-- Table: cms_image_grid_items
CREATE TABLE public.cms_image_grid_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT NOT NULL REFERENCES public.cms_pages(slug) ON DELETE CASCADE,
    section TEXT NOT NULL,
    slug TEXT NOT NULL,
    label TEXT NOT NULL,
    label_line_1 TEXT,
    label_line_2 TEXT,
    icon_name TEXT,
    image_url TEXT,
    image_position TEXT CHECK (image_position IN ('left', 'right')),
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(page_slug, section, position)
);

-- Create indexes for CMS tables
CREATE INDEX idx_cms_content_blocks_page_slug ON public.cms_content_blocks(page_slug);
CREATE INDEX idx_cms_content_blocks_section ON public.cms_content_blocks(section);
CREATE INDEX idx_cms_image_grid_items_page_slug ON public.cms_image_grid_items(page_slug);
CREATE INDEX idx_cms_image_grid_items_position ON public.cms_image_grid_items(page_slug, section, position);

-- ============================================
-- PART 2: Collaboration Tables (Projects & Bidding)
-- ============================================

-- Create enums for project and bid statuses
CREATE TYPE public.project_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.bid_status AS ENUM ('submitted', 'under_review', 'accepted', 'rejected');
CREATE TYPE public.announcement_target_scope AS ENUM ('all_vendors', 'approved_vendors', 'specific');

-- Table: projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    budget_range_min NUMERIC,
    budget_range_max NUMERIC,
    timeline_start DATE,
    timeline_end DATE,
    status public.project_status DEFAULT 'draft' NOT NULL,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: bids
CREATE TABLE public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bid_amount NUMERIC NOT NULL,
    notes TEXT,
    documents JSONB DEFAULT '{}'::jsonb,
    status public.bid_status DEFAULT 'submitted' NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    UNIQUE(project_id, vendor_id)
);

-- Table: announcements
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target_scope public.announcement_target_scope DEFAULT 'all_vendors' NOT NULL,
    target_vendor_ids UUID[],
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for collaboration tables
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_bids_project_id ON public.bids(project_id);
CREATE INDEX idx_bids_vendor_id ON public.bids(vendor_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_announcements_created_by ON public.announcements(created_by);

-- ============================================
-- PART 3: Storage Bucket for CMS Marketing Images
-- ============================================

-- Create storage bucket for CMS marketing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('cms_marketing_images', 'cms_marketing_images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 4: RLS Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_image_grid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ===== CMS Pages RLS Policies =====

-- Public can read published pages
CREATE POLICY "Public can read published pages"
    ON public.cms_pages
    FOR SELECT
    USING (status = 'published');

-- Admin and superadmin can read all pages
CREATE POLICY "Admin can read all pages"
    ON public.cms_pages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Admin and superadmin can insert, update, delete pages
CREATE POLICY "Admin can manage pages"
    ON public.cms_pages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===== CMS Content Blocks RLS Policies =====

-- Public can read blocks from published pages
CREATE POLICY "Public can read published content blocks"
    ON public.cms_content_blocks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cms_pages
            WHERE cms_pages.slug = cms_content_blocks.page_slug
            AND cms_pages.status = 'published'
        )
    );

-- Admin can read all content blocks
CREATE POLICY "Admin can read all content blocks"
    ON public.cms_content_blocks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Admin can manage content blocks
CREATE POLICY "Admin can manage content blocks"
    ON public.cms_content_blocks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===== CMS Image Grid Items RLS Policies =====

-- Public can read grid items from published pages
CREATE POLICY "Public can read published grid items"
    ON public.cms_image_grid_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cms_pages
            WHERE cms_pages.slug = cms_image_grid_items.page_slug
            AND cms_pages.status = 'published'
        )
    );

-- Admin can read all grid items
CREATE POLICY "Admin can read all grid items"
    ON public.cms_image_grid_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Admin can manage grid items
CREATE POLICY "Admin can manage grid items"
    ON public.cms_image_grid_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===== Projects RLS Policies =====

-- Admin can read all projects
CREATE POLICY "Admin can read all projects"
    ON public.projects
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Approved vendors can read open projects
CREATE POLICY "Approved vendors can read open projects"
    ON public.projects
    FOR SELECT
    USING (
        status = 'open'
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.vendor_status = 'approved'
        )
    );

-- Admin can manage projects
CREATE POLICY "Admin can manage projects"
    ON public.projects
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===== Bids RLS Policies =====

-- Admin can read all bids
CREATE POLICY "Admin can read all bids"
    ON public.bids
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Vendors can read their own bids
CREATE POLICY "Vendors can read own bids"
    ON public.bids
    FOR SELECT
    USING (vendor_id = auth.uid());

-- Approved vendors can create bids
CREATE POLICY "Approved vendors can create bids"
    ON public.bids
    FOR INSERT
    WITH CHECK (
        vendor_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.vendor_status = 'approved'
        )
        AND EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_id
            AND projects.status = 'open'
        )
    );

-- Vendors can update their own submitted bids
CREATE POLICY "Vendors can update own submitted bids"
    ON public.bids
    FOR UPDATE
    USING (
        vendor_id = auth.uid()
        AND status = 'submitted'
    );

-- Admin can update all bids
CREATE POLICY "Admin can update all bids"
    ON public.bids
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Vendors can delete their own submitted bids
CREATE POLICY "Vendors can delete own submitted bids"
    ON public.bids
    FOR DELETE
    USING (
        vendor_id = auth.uid()
        AND status = 'submitted'
    );

-- Admin can delete all bids
CREATE POLICY "Admin can delete all bids"
    ON public.bids
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===== Announcements RLS Policies =====

-- Admin can read all announcements
CREATE POLICY "Admin can read all announcements"
    ON public.announcements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Vendors can read announcements targeted to them
CREATE POLICY "Vendors can read targeted announcements"
    ON public.announcements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.vendor_status = 'approved'
        )
        AND (
            target_scope = 'all_vendors'
            OR (target_scope = 'approved_vendors')
            OR (target_scope = 'specific' AND auth.uid() = ANY(target_vendor_ids))
        )
    );

-- Admin can manage announcements
CREATE POLICY "Admin can manage announcements"
    ON public.announcements
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===== Storage RLS Policies for CMS Marketing Images =====

-- Public can read images from cms_marketing_images bucket
CREATE POLICY "Public can read CMS marketing images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'cms_marketing_images');

-- Admin can upload images to cms_marketing_images bucket
CREATE POLICY "Admin can upload CMS marketing images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'cms_marketing_images'
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Admin can update images in cms_marketing_images bucket
CREATE POLICY "Admin can update CMS marketing images"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'cms_marketing_images'
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Admin can delete images from cms_marketing_images bucket
CREATE POLICY "Admin can delete CMS marketing images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'cms_marketing_images'
        AND EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'superadmin')
        )
    );
