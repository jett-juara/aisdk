
-- Create ENUMs for Projects and Bids
CREATE TYPE public.project_status AS ENUM ('draft', 'open', 'closed', 'awarded', 'cancelled');
CREATE TYPE public.bid_status AS ENUM ('invited', 'submitted', 'under_review', 'shortlisted', 'rejected', 'awarded');

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    client_name TEXT,
    budget NUMERIC,
    currency TEXT NOT NULL DEFAULT 'IDR',
    status public.project_status NOT NULL DEFAULT 'draft',
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    created_by UUID REFERENCES auth.users(id), -- Admin/System user who created it
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    deadline TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bids Table
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- Assuming vendors is 1:1 with users(id)
    
    amount NUMERIC,
    currency TEXT NOT NULL DEFAULT 'IDR',
    proposal_document JSONB, -- { "url": "...", "name": "..." }
    notes TEXT,
    
    status public.bid_status NOT NULL DEFAULT 'invited',
    decided_by UUID REFERENCES auth.users(id),
    decided_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Prevent duplicate bids for same project/vendor (unless multiple revisions allowed, but usually unique active bid)
    UNIQUE(project_id, vendor_id)
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL, -- Optional context
    
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    action_label TEXT,
    action_url TEXT,
    
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_by UUID REFERENCES auth.users(id), -- Admin who sent it
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Vendor Change Logs Table
CREATE TABLE IF NOT EXISTS public.vendor_change_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    changed_by TEXT NOT NULL, -- 'vendor' | 'admin' | 'system'
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_change_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Projects: 
-- Admins have full access available via service roles/admin app logic (usually bypassing RLS or distinct policy).
-- Vendors: Currently restricted. We might create a view later.
-- For now, allow authenticated users to SELECT 'open' projects (if we want public listing)
-- OR restrict strictly. Let's start conservative: NO public access for now. 
-- Admin access is assumed to be handled by service role key or admin-specific policies (not defined here as typical Supabase pattern relies on service_role for admin tasks or specific admin policies).
-- Adding a placeholder policy for ALL authenticated users (to be refined):
CREATE POLICY "Projects are viewable by authenticated users" 
    ON public.projects FOR SELECT 
    TO authenticated 
    USING (true); -- Simplification for Phase 1. Real rule: status='open' OR user is admin.

-- Bids:
-- Vendor can VIEW their own bids.
CREATE POLICY "Vendors can view their own bids" 
    ON public.bids FOR SELECT 
    TO authenticated 
    USING (vendor_id = auth.uid());

-- Vendor can UPDATE their own bids (e.g. submit proposal).
CREATE POLICY "Vendors can update their own bids" 
    ON public.bids FOR UPDATE
    TO authenticated 
    USING (vendor_id = auth.uid());

-- Messages:
-- Vendor can VIEW messages sent to them.
CREATE POLICY "Vendors can view their messages" 
    ON public.messages FOR SELECT 
    TO authenticated 
    USING (vendor_id = auth.uid());

-- Vendor can UPDATE 'is_read' on their messages.
CREATE POLICY "Vendors can update their messages" 
    ON public.messages FOR UPDATE 
    TO authenticated 
    USING (vendor_id = auth.uid());

-- Vendor Change Logs:
-- Vendor can VIEW their own logs.
CREATE POLICY "Vendors can view their own logs" 
    ON public.vendor_change_logs FOR SELECT 
    TO authenticated 
    USING (vendor_id = auth.uid());

-- Vendor can INSERT logs (when self-editing profile).
CREATE POLICY "Vendors can insert logs" 
    ON public.vendor_change_logs FOR INSERT 
    TO authenticated 
    WITH CHECK (vendor_id = auth.uid());
