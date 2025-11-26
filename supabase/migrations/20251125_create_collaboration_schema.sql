-- Create Enum Types
CREATE TYPE public.vendor_type AS ENUM ('company', 'individual');
CREATE TYPE public.vendor_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.pkp_status AS ENUM ('pkp', 'non_pkp');
CREATE TYPE public.user_vendor_status AS ENUM ('none', 'pending', 'approved', 'rejected');

-- Update public.users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS vendor_status public.user_vendor_status DEFAULT 'none';

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    type public.vendor_type NOT NULL,
    
    -- Company Details
    company_name TEXT,
    company_address JSONB,
    company_email TEXT,
    company_phone TEXT,
    nib_number TEXT,
    
    -- Individual Details
    individual_name TEXT,
    individual_address JSONB,
    individual_email TEXT,
    individual_phone TEXT,
    
    -- Common Details
    specializations TEXT[], -- Array of strings
    
    -- Bank Details
    bank_name TEXT NOT NULL,
    bank_account_number TEXT NOT NULL,
    bank_account_holder TEXT NOT NULL,
    
    -- Tax Details
    npwp_number TEXT NOT NULL,
    pkp_status public.pkp_status,
    
    -- Documents (URLs)
    documents JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    status public.vendor_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Policies for vendors table
CREATE POLICY "Users can view their own vendor profile"
    ON public.vendors
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own vendor profile"
    ON public.vendors
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own vendor profile"
    ON public.vendors
    FOR UPDATE
    USING (auth.uid() = id);

-- Storage Bucket for Vendor Documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor_documents', 'vendor_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Vendor documents are private"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'vendor_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own vendor documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'vendor_documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own vendor documents"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'vendor_documents' AND auth.uid()::text = (storage.foldername(name))[1]);
