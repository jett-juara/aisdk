-- =====================================================
-- JUARA JETT Database Schema Dump - COMPLETE
-- Generated: 2025-12-12
-- Database: Supabase PostgreSQL
-- Status: COMPLETE BACKUP (Structure Only, No Data)
-- =====================================================
--
-- Contents:
-- 1. Custom Types (11 enums)
-- 2. Tables (42 tables)
-- 3. Views (1 view)
-- 4. Functions (9 functions)
-- 5. Triggers (12 triggers)
-- 6. RLS Policies (110 policies)
--
-- =====================================================

-- =====================================================
-- SECTION 1: CUSTOM TYPES (ENUMS)
-- =====================================================

CREATE TYPE public.announcement_target_scope AS ENUM (
    'all_vendors',
    'approved_vendors',
    'specific'
);

CREATE TYPE public.bid_status AS ENUM (
    'submitted',
    'under_review',
    'accepted',
    'rejected'
);

CREATE TYPE public.cms_page_status AS ENUM (
    'draft',
    'review',
    'published',
    'archived'
);

CREATE TYPE public.invitation_status AS ENUM (
    'pending',
    'sent',
    'accepted',
    'expired',
    'cancelled'
);

CREATE TYPE public.pkp_status AS ENUM (
    'pkp',
    'non_pkp'
);

CREATE TYPE public.project_status AS ENUM (
    'draft',
    'open',
    'in_progress',
    'completed',
    'cancelled'
);

CREATE TYPE public.user_role AS ENUM (
    'superadmin',
    'admin',
    'user'
);

CREATE TYPE public.user_status AS ENUM (
    'active',
    'blocked',
    'deleted'
);

CREATE TYPE public.user_vendor_status AS ENUM (
    'none',
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE public.vendor_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE public.vendor_type AS ENUM (
    'company',
    'individual'
);

-- =====================================================
-- SECTION 2: TABLES
-- =====================================================

CREATE TABLE public.admin_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    email text NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    status public.invitation_status DEFAULT 'pending'::public.invitation_status NOT NULL,
    inviter_id uuid,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT admin_invitations_email_key UNIQUE (email),
    CONSTRAINT admin_invitations_token_key UNIQUE (token),
    CONSTRAINT admin_invitations_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.announcements (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    target_scope public.announcement_target_scope DEFAULT 'all_vendors'::public.announcement_target_scope NOT NULL,
    target_vendor_ids uuid[],
    priority integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.archive_configurations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    table_name text NOT NULL,
    retention_days integer NOT NULL,
    archive_enabled boolean DEFAULT true NOT NULL,
    compression_enabled boolean DEFAULT true,
    schedule_cron text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT archive_configurations_table_name_key UNIQUE (table_name)
);

CREATE TABLE public.archive_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    job_id uuid,
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size_mb numeric(10,2),
    record_count integer,
    compression_ratio numeric(5,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT archive_files_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.archive_jobs(id) ON DELETE CASCADE
);

CREATE TABLE public.archive_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    table_name text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    archived_records integer DEFAULT 0,
    failed_records integer DEFAULT 0,
    archive_size_mb numeric(10,2),
    compression_ratio numeric(5,2),
    duration_ms integer,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT archive_jobs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'running'::text, 'completed'::text, 'failed'::text])))
);

CREATE TABLE public.archive_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    job_id uuid,
    type text NOT NULL,
    recipient_emails text[],
    subject text,
    body text,
    sent boolean DEFAULT false,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT archive_notifications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.archive_jobs(id) ON DELETE CASCADE,
    CONSTRAINT archive_notifications_type_check CHECK ((type = ANY (ARRAY['success'::text, 'failure'::text, 'warning'::text])))
);

CREATE TABLE public.archive_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    date date NOT NULL,
    table_name text NOT NULL,
    jobs_completed integer DEFAULT 0,
    jobs_failed integer DEFAULT 0,
    records_archived integer DEFAULT 0,
    space_saved_mb numeric(10,2) DEFAULT 0,
    average_compression_ratio numeric(5,2),
    total_duration_ms bigint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT archive_statistics_date_table_name_key UNIQUE (date, table_name)
);

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid,
    action text NOT NULL,
    resource_type text,
    resource_id uuid,
    details jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.bids (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    project_id uuid NOT NULL,
    vendor_id uuid NOT NULL,
    bid_amount numeric(15,2) NOT NULL,
    proposal text,
    estimated_timeline text,
    status public.bid_status DEFAULT 'submitted'::public.bid_status NOT NULL,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT bids_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
    CONSTRAINT bids_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.cache_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    layer_name text NOT NULL,
    cache_key text NOT NULL,
    cache_value jsonb NOT NULL,
    ttl_seconds integer DEFAULT 3600,
    size_bytes integer,
    hit_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT cache_entries_layer_name_cache_key_key UNIQUE (layer_name, cache_key)
);

CREATE TABLE public.cache_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    layer_name text NOT NULL,
    date date NOT NULL,
    hour integer,
    total_requests integer DEFAULT 0,
    cache_hits integer DEFAULT 0,
    cache_misses integer DEFAULT 0,
    memory_usage_bytes bigint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cache_statistics_layer_name_date_hour_key UNIQUE (layer_name, date, hour),
    CONSTRAINT cache_statistics_hour_check CHECK (((hour >= 0) AND (hour <= 23)))
);

CREATE TABLE public.cache_warming_schedules (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    layer_name text NOT NULL,
    cron_expression text NOT NULL,
    queries jsonb NOT NULL,
    enabled boolean DEFAULT true,
    last_run_at timestamp with time zone,
    next_run_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.cms_content_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    page_slug text NOT NULL,
    section text NOT NULL,
    title text,
    subtitle text,
    content jsonb,
    display_order integer DEFAULT 0,
    is_visible boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cms_content_blocks_page_slug_fkey FOREIGN KEY (page_slug) REFERENCES public.cms_pages(slug) ON DELETE CASCADE
);

CREATE TABLE public.cms_detail_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    page_slug text NOT NULL,
    item_slug text NOT NULL,
    title text NOT NULL,
    hero_image_url text,
    category text,
    date date,
    author text,
    summary text,
    paragraphs jsonb,
    images jsonb,
    stats jsonb,
    quote_text text,
    quote_author text,
    cta_title text,
    cta_subtitle text,
    cta_button_text text,
    cta_button_link text,
    related_items text[],
    tags text[],
    status public.cms_page_status DEFAULT 'draft'::public.cms_page_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cms_detail_blocks_page_slug_item_slug_key UNIQUE (page_slug, item_slug),
    CONSTRAINT cms_detail_blocks_page_slug_fkey FOREIGN KEY (page_slug) REFERENCES public.cms_pages(slug) ON DELETE CASCADE
);

CREATE TABLE public.cms_home (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    slug text DEFAULT 'home'::text NOT NULL,
    bg_desktop_url text,
    bg_mobile_url text,
    hero_text_h2 text,
    hero_text_p text,
    cta_buttons jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cms_home_slug_key UNIQUE (slug)
);

CREATE TABLE public.cms_image_grid_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    page_slug text NOT NULL,
    item_slug text NOT NULL,
    title text NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    link_url text,
    position integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cms_image_grid_items_page_slug_item_slug_key UNIQUE (page_slug, item_slug),
    CONSTRAINT cms_image_grid_items_page_slug_fkey FOREIGN KEY (page_slug) REFERENCES public.cms_pages(slug) ON DELETE CASCADE
);

CREATE TABLE public.cms_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    status public.cms_page_status DEFAULT 'draft'::public.cms_page_status NOT NULL,
    meta_title text,
    meta_description text,
    og_image text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT cms_pages_slug_key UNIQUE (slug)
);

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    vendor_id uuid NOT NULL,
    project_id uuid,
    subject text NOT NULL,
    body text NOT NULL,
    is_read boolean DEFAULT false,
    sent_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
    CONSTRAINT messages_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT messages_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.performance_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    alert_type text NOT NULL,
    severity text NOT NULL,
    metric_name text,
    threshold_value numeric,
    actual_value numeric,
    description text,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT performance_alerts_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text])))
);

CREATE TABLE public.performance_alerts_extended (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    alert_type text NOT NULL,
    severity text NOT NULL,
    metric_name text,
    threshold_value numeric,
    actual_value numeric,
    description text,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp with time zone,
    resolved_by text,
    metadata jsonb,
    tags text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT performance_alerts_extended_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text])))
);

CREATE TABLE public.performance_anomalies (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    metric_name text NOT NULL,
    baseline_value numeric NOT NULL,
    actual_value numeric NOT NULL,
    deviation_percentage numeric,
    confidence_score numeric,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.performance_baselines (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    metric_name text NOT NULL,
    baseline_value numeric NOT NULL,
    std_deviation numeric,
    sample_size integer,
    calculated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT performance_baselines_metric_name_key UNIQUE (metric_name)
);

CREATE TABLE public.performance_dashboard_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    snapshot_date date NOT NULL,
    snapshot_hour integer NOT NULL,
    total_metrics integer DEFAULT 0,
    active_alerts integer DEFAULT 0,
    system_health character varying(20),
    categories jsonb,
    top_alerts jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT performance_dashboard_snapshots_snapshot_date_snapshot_hour_key UNIQUE (snapshot_date, snapshot_hour),
    CONSTRAINT performance_dashboard_snapshots_snapshot_hour_check CHECK (((snapshot_hour >= 0) AND (snapshot_hour <= 23)))
);

CREATE TABLE public.performance_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    category text,
    tags jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.performance_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    recommendation_type text NOT NULL,
    priority text NOT NULL,
    title text NOT NULL,
    description text,
    sql_statement text,
    estimated_improvement numeric,
    is_applied boolean DEFAULT false,
    applied_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT performance_recommendations_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);

CREATE TABLE public.performance_recommendations_extended (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    recommendation_type text NOT NULL,
    priority text NOT NULL,
    title text NOT NULL,
    description text,
    sql_statement text,
    estimated_improvement numeric,
    impact_score numeric,
    complexity_score numeric,
    is_applied boolean DEFAULT false,
    applied_at timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT performance_recommendations_extended_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);

CREATE TABLE public.performance_thresholds (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    metric_name text NOT NULL,
    operator text NOT NULL,
    threshold_value numeric NOT NULL,
    severity text NOT NULL,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT performance_thresholds_operator_check CHECK ((operator = ANY (ARRAY['>'::text, '<'::text, '>='::text, '<='::text, '='::text, '!='::text]))),
    CONSTRAINT performance_thresholds_severity_check CHECK ((severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text])))
);

CREATE TABLE public.permission_conflicts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    conflict_type text NOT NULL,
    details jsonb,
    resolution text,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT permission_conflicts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.permission_inheritance_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    source_role public.user_role NOT NULL,
    target_role public.user_role NOT NULL,
    inheritance_type text NOT NULL,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT permission_inheritance_rules_inheritance_type_check CHECK ((inheritance_type = ANY (ARRAY['full'::text, 'partial'::text, 'none'::text])))
);

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    requirements text,
    budget_range text,
    timeline text,
    status public.project_status DEFAULT 'draft'::public.project_status NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.query_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    query_hash text NOT NULL,
    query_text text,
    execution_time_ms integer NOT NULL,
    execution_count integer DEFAULT 1,
    performance_score numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid,
    endpoint text NOT NULL,
    max_requests integer NOT NULL,
    window_seconds integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT rate_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    role public.user_role NOT NULL,
    permission text NOT NULL,
    enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT role_permissions_role_permission_key UNIQUE (role, permission)
);

CREATE TABLE public.security_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    userid uuid,
    action text NOT NULL,
    resource text,
    details jsonb,
    ipaddress inet,
    useragent text,
    timestamp timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT security_audit_logs_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.security_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    userid uuid,
    type text NOT NULL,
    severity text NOT NULL,
    description text,
    resolved boolean DEFAULT false,
    resolvedat timestamp with time zone,
    createdat timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT security_events_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT security_events_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE TABLE public.security_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    userid uuid NOT NULL,
    requiremfa boolean DEFAULT false,
    allowedipaddresses inet[],
    sessiontimeout integer DEFAULT 3600,
    trusteddevices jsonb,
    createdat timestamp with time zone DEFAULT now() NOT NULL,
    updatedat timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT security_settings_userid_key UNIQUE (userid),
    CONSTRAINT security_settings_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.system_health_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    status character varying(20) NOT NULL,
    uptime_percentage numeric(5,2),
    error_rate numeric(5,2),
    total_requests_24h bigint DEFAULT 0,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.system_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    metric_name text NOT NULL,
    metric_value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    feature_key text NOT NULL,
    access_granted boolean DEFAULT false,
    granted_by uuid,
    granted_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_permissions_user_id_feature_key_key UNIQUE (user_id, feature_key),
    CONSTRAINT user_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    sessionid text NOT NULL,
    userid uuid NOT NULL,
    deviceinfo jsonb,
    ipaddress inet,
    lastactivity timestamp with time zone DEFAULT now() NOT NULL,
    isactive boolean DEFAULT true,
    createdat timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_sessions_sessionid_key UNIQUE (sessionid),
    CONSTRAINT user_sessions_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY,
    email text NOT NULL,
    first_name text,
    last_name text,
    username text,
    username_changed boolean DEFAULT false,
    avatar_url text,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    status public.user_status DEFAULT 'active'::public.user_status NOT NULL,
    vendor_status public.user_vendor_status DEFAULT 'none'::public.user_vendor_status NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);

CREATE TABLE public.vendor_change_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    vendor_id uuid NOT NULL,
    field_name text NOT NULL,
    old_value text,
    new_value text,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vendor_change_logs_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT vendor_change_logs_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE
);

CREATE TABLE public.vendors (
    id uuid NOT NULL PRIMARY KEY,
    type public.vendor_type NOT NULL,
    company_name text,
    company_address jsonb,
    company_email text,
    company_phone text,
    nib_number text,
    individual_name text,
    individual_address jsonb,
    individual_email text,
    individual_phone text,
    specializations text[],
    bank_name text NOT NULL,
    bank_account_number text NOT NULL,
    bank_account_holder text NOT NULL,
    npwp_number text NOT NULL,
    pkp_status public.pkp_status NOT NULL,
    documents jsonb,
    status public.vendor_status DEFAULT 'pending'::public.vendor_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vendors_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =====================================================
-- SECTION 3: VIEWS
-- =====================================================

CREATE OR REPLACE VIEW public.dashboard_latest_snapshot AS
SELECT
    (created_at)::date AS snapshot_date,
    EXTRACT(hour FROM created_at) AS snapshot_hour,
    status AS system_health,
    uptime_percentage AS uptime_24h,
    error_rate AS error_rate_24h,
    total_requests_24h AS total_metrics,
    0 AS active_alerts
FROM system_health_snapshots
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- SECTION 4: FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_performance_snapshot()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO performance_dashboard_snapshots (
        snapshot_date,
        snapshot_hour,
        total_metrics,
        active_alerts,
        system_health,
        categories,
        top_alerts
    ) SELECT
        CURRENT_DATE,
        EXTRACT(HOUR FROM CURRENT_TIME),
        (SELECT COUNT(*) FROM performance_metrics WHERE created_at >= DATE_TRUNC('hour', NOW())),
        (SELECT COUNT(*) FROM performance_alerts_extended WHERE is_resolved = FALSE),
        'good'::VARCHAR, -- This would be calculated based on actual metrics
        '{}'::JSONB,
        '[]'::JSONB
    ON CONFLICT (snapshot_date, snapshot_hour)
    DO UPDATE SET
        total_metrics = EXCLUDED.total_metrics,
        active_alerts = EXCLUDED.active_alerts,
        system_health = EXCLUDED.system_health,
        categories = EXCLUDED.categories,
        top_alerts = EXCLUDED.top_alerts;

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enforce_user_profile_constraints()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent non-admin users from altering privileged fields
  IF auth.uid() = OLD.id AND NOT (is_admin() OR is_superadmin()) THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Lo nggak boleh ganti role akun lo sendiri.';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'Lo nggak boleh ubah status akun lo sendiri.';
    END IF;
    IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'Lo nggak boleh ubah penghapusan akun sendiri.';
    END IF;
  END IF;

  -- Username can change once, tracked via username_changed flag
  IF NEW.username IS DISTINCT FROM OLD.username THEN
    IF auth.uid() = OLD.id AND OLD.username_changed THEN
      RAISE EXCEPTION 'Username cuma bisa diganti sekali.';
    END IF;
    IF auth.uid() = OLD.id AND NEW.username IS NOT NULL THEN
      NEW.username_changed = TRUE;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare _is boolean;
begin
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role in ('admin','superadmin')
  ) into _is;
  return coalesce(_is, false);
end;
$function$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare _is boolean;
begin
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'superadmin'
  ) into _is;
  return coalesce(_is, false);
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.touch_admin_invitations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_archive_statistics()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO archive_statistics (
        date,
        table_name,
        jobs_completed,
        jobs_failed,
        records_archived,
        space_saved_mb,
        average_compression_ratio,
        total_duration_ms
    ) VALUES (
        CURRENT_DATE,
        NEW.table_name,
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
        NEW.archived_records,
        COALESCE(NEW.archive_size_mb, 0),
        COALESCE(NEW.compression_ratio, 0),
        COALESCE(NEW.duration_ms, 0)
    )
    ON CONFLICT (date, table_name)
    DO UPDATE SET
        jobs_completed = archive_statistics.jobs_completed +
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        jobs_failed = archive_statistics.jobs_failed +
            CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
        records_archived = archive_statistics.records_archived + NEW.archived_records,
        space_saved_mb = archive_statistics.space_saved_mb + COALESCE(NEW.archive_size_mb, 0),
        average_compression_ratio = (archive_statistics.average_compression_ratio + COALESCE(NEW.compression_ratio, 0)) / 2,
        total_duration_ms = archive_statistics.total_duration_ms + COALESCE(NEW.duration_ms, 0),
        updated_at = NOW();

    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_archive_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_cache_statistics()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO cache_statistics (
        layer_name,
        date,
        hour,
        total_requests,
        cache_hits,
        cache_misses,
        memory_usage_bytes
    ) VALUES (
        NEW.layer_name,
        CURRENT_DATE,
        EXTRACT(HOUR FROM CURRENT_TIME),
        1,
        CASE WHEN TG_OP = 'UPDATE' THEN 1 ELSE 0 END,
        CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
        COALESCE(NEW.size_bytes, 0)
    )
    ON CONFLICT (layer_name, date, hour)
    DO UPDATE SET
        total_requests = cache_statistics.total_requests + 1,
        cache_hits = cache_statistics.cache_hits +
            CASE WHEN TG_OP = 'UPDATE' THEN 1 ELSE 0 END,
        cache_misses = cache_statistics.cache_misses +
            CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
        memory_usage_bytes = cache_statistics.memory_usage_bytes +
            COALESCE(NEW.size_bytes, 0),
        updated_at = NOW();

    RETURN NEW;
END;
$function$;

-- =====================================================
-- SECTION 5: TRIGGERS
-- =====================================================

CREATE TRIGGER trg_admin_invitations_updated_at
    BEFORE UPDATE ON public.admin_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_admin_invitations_updated_at();

CREATE TRIGGER trigger_archive_configurations_updated_at
    BEFORE UPDATE ON public.archive_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_archive_updated_at();

CREATE TRIGGER trigger_update_archive_statistics
    AFTER INSERT ON public.archive_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_archive_statistics();

CREATE TRIGGER trigger_update_archive_statistics
    AFTER UPDATE ON public.archive_jobs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_archive_statistics();

CREATE TRIGGER trigger_archive_statistics_updated_at
    BEFORE UPDATE ON public.archive_statistics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_archive_updated_at();

CREATE TRIGGER trigger_update_cache_statistics
    AFTER UPDATE ON public.cache_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cache_statistics();

CREATE TRIGGER trigger_update_cache_statistics
    AFTER INSERT ON public.cache_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cache_statistics();

CREATE TRIGGER trigger_hourly_performance_snapshot
    AFTER INSERT ON public.performance_metrics
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.create_performance_snapshot();

CREATE TRIGGER set_user_permissions_updated_at
    BEFORE UPDATE ON public.user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER enforce_user_profile_constraints
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_user_profile_constraints();

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_warming_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_detail_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_home ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_image_grid_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_alerts_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_dashboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_recommendations_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_inheritance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- admin_invitations policies
CREATE POLICY "service role manage admin invitations"
    ON public.admin_invitations
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text)
    WITH CHECK (auth.role() = 'service_role'::text);

CREATE POLICY "superadmins can view admin invitations"
    ON public.admin_invitations
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (is_superadmin());

-- announcements policies
CREATE POLICY "Admin can manage announcements"
    ON public.announcements
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can read all announcements"
    ON public.announcements
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Vendors can read targeted announcements"
    ON public.announcements
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.vendor_status = 'approved'::user_vendor_status
        )
        AND (
            target_scope = 'all_vendors'::announcement_target_scope
            OR target_scope = 'approved_vendors'::announcement_target_scope
            OR (target_scope = 'specific'::announcement_target_scope AND auth.uid() = ANY (target_vendor_ids))
        )
    );

-- archive_configurations policies
CREATE POLICY "Allow full access to archive configurations for service role"
    ON public.archive_configurations
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to archive configurations for admins"
    ON public.archive_configurations
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- archive_files policies
CREATE POLICY "Allow full access to archive files for service role"
    ON public.archive_files
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to archive files for admins"
    ON public.archive_files
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- archive_jobs policies
CREATE POLICY "Allow full access to archive jobs for service role"
    ON public.archive_jobs
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to archive jobs for admins"
    ON public.archive_jobs
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- archive_notifications policies
CREATE POLICY "Allow full access to archive notifications for service role"
    ON public.archive_notifications
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to archive notifications for admins"
    ON public.archive_notifications
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- archive_statistics policies
CREATE POLICY "Allow full access to archive statistics for service role"
    ON public.archive_statistics
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to archive statistics for admins"
    ON public.archive_statistics
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- audit_logs policies
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (is_admin() OR is_superadmin());

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Users can view own audit logs"
    ON public.audit_logs
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = auth.uid());

-- bids policies
CREATE POLICY "Admin can delete all bids"
    ON public.bids
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can read all bids"
    ON public.bids
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can update all bids"
    ON public.bids
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Approved vendors can create bids"
    ON public.bids
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (
        vendor_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.vendor_status = 'approved'::user_vendor_status
        )
        AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = bids.project_id
            AND projects.status = 'open'::project_status
        )
    );

CREATE POLICY "Vendors can delete own submitted bids"
    ON public.bids
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (vendor_id = auth.uid() AND status = 'submitted'::bid_status);

CREATE POLICY "Vendors can read own bids"
    ON public.bids
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can update own submitted bids"
    ON public.bids
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (vendor_id = auth.uid() AND status = 'submitted'::bid_status);

-- cache_entries policies
CREATE POLICY "Allow delete access to cache entries for system"
    ON public.cache_entries
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (auth.role() = 'service_role'::text OR auth.role() = 'authenticated'::text);

CREATE POLICY "Allow insert access to cache entries for system"
    ON public.cache_entries
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (auth.role() = 'service_role'::text OR auth.role() = 'authenticated'::text);

CREATE POLICY "Allow read access to cache entries for authenticated users"
    ON public.cache_entries
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Allow update access to cache entries for system"
    ON public.cache_entries
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (auth.role() = 'service_role'::text OR auth.role() = 'authenticated'::text);

-- cache_statistics policies
CREATE POLICY "Allow full access to cache statistics for service role"
    ON public.cache_statistics
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to cache statistics for authenticated users"
    ON public.cache_statistics
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (auth.role() = 'authenticated'::text);

-- cache_warming_schedules policies
CREATE POLICY "Allow full access to cache warming schedules for admins"
    ON public.cache_warming_schedules
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (
        auth.role() = 'service_role'::text
        OR (
            auth.role() = 'authenticated'::text
            AND EXISTS (
                SELECT 1 FROM users
                WHERE users.id = auth.uid()
                AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
            )
        )
    );

CREATE POLICY "Allow read access to cache warming schedules for authenticated"
    ON public.cache_warming_schedules
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (auth.role() = 'authenticated'::text);

-- cms_content_blocks policies
CREATE POLICY "Admin can manage content blocks"
    ON public.cms_content_blocks
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can read all content blocks"
    ON public.cms_content_blocks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Public can read published content blocks"
    ON public.cms_content_blocks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM cms_pages
        WHERE cms_pages.slug = cms_content_blocks.page_slug
        AND cms_pages.status = 'published'::cms_page_status
    ));

-- cms_detail_blocks policies
CREATE POLICY "Admin can manage detail blocks"
    ON public.cms_detail_blocks
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can read all detail blocks"
    ON public.cms_detail_blocks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Public can read published detail blocks"
    ON public.cms_detail_blocks
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        status = 'published'::cms_page_status
        AND EXISTS (
            SELECT 1 FROM cms_pages
            WHERE cms_pages.slug = cms_detail_blocks.page_slug
            AND cms_pages.status = 'published'::cms_page_status
        )
    );

-- cms_home policies
CREATE POLICY "Enable insert for admins"
    ON public.cms_home
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() IN (
        SELECT users.id FROM users
        WHERE users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Enable read access for all users"
    ON public.cms_home
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Enable update for admins"
    ON public.cms_home
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (auth.uid() IN (
        SELECT users.id FROM users
        WHERE users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

-- cms_image_grid_items policies
CREATE POLICY "Admin can manage grid items"
    ON public.cms_image_grid_items
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can read all grid items"
    ON public.cms_image_grid_items
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Public can read published grid items"
    ON public.cms_image_grid_items
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM cms_pages
        WHERE cms_pages.slug = cms_image_grid_items.page_slug
        AND cms_pages.status = 'published'::cms_page_status
    ));

-- cms_pages policies
CREATE POLICY "Admin can manage pages"
    ON public.cms_pages
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can read all pages"
    ON public.cms_pages
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Public can read published pages"
    ON public.cms_pages
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (status = 'published'::cms_page_status);

-- messages policies
CREATE POLICY "Vendors can update their messages"
    ON public.messages
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can view their messages"
    ON public.messages
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (vendor_id = auth.uid());

-- performance_alerts policies
CREATE POLICY "Allow full access to performance alerts for service role"
    ON public.performance_alerts
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to performance alerts for admins"
    ON public.performance_alerts
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- performance_alerts_extended policies
CREATE POLICY "Allow full access to performance alerts for service role"
    ON public.performance_alerts_extended
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to performance alerts for admins"
    ON public.performance_alerts_extended
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- performance_dashboard_snapshots policies
CREATE POLICY "Allow full access to dashboard snapshots for service role"
    ON public.performance_dashboard_snapshots
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to dashboard snapshots for admins"
    ON public.performance_dashboard_snapshots
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- performance_metrics policies
CREATE POLICY "Allow insert access to performance metrics for system"
    ON public.performance_metrics
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (auth.role() = 'service_role'::text OR auth.role() = 'authenticated'::text);

CREATE POLICY "Allow read access to performance metrics for admins"
    ON public.performance_metrics
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- performance_recommendations policies
CREATE POLICY "Allow full access to performance recommendations for service role"
    ON public.performance_recommendations
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to performance recommendations for admins"
    ON public.performance_recommendations
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- performance_recommendations_extended policies
CREATE POLICY "Allow full access to performance recommendations for service role"
    ON public.performance_recommendations_extended
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to performance recommendations for admins"
    ON public.performance_recommendations_extended
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- performance_thresholds policies
CREATE POLICY "Allow full access to performance thresholds for service role"
    ON public.performance_thresholds
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to performance thresholds for admins"
    ON public.performance_thresholds
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- permission_conflicts policies
CREATE POLICY "Admins can manage permission conflicts"
    ON public.permission_conflicts
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admins can view all permission conflicts"
    ON public.permission_conflicts
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Users can view own permission conflicts"
    ON public.permission_conflicts
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = auth.uid());

-- permission_inheritance_rules policies
CREATE POLICY "Admins can view inheritance rules"
    ON public.permission_inheritance_rules
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Superadmins can manage inheritance rules"
    ON public.permission_inheritance_rules
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'superadmin'::user_role
    ));

-- projects policies
CREATE POLICY "Admin can manage projects"
    ON public.projects
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can read all projects"
    ON public.projects
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Approved vendors can read open projects"
    ON public.projects
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        status = 'open'::project_status
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.vendor_status = 'approved'::user_vendor_status
        )
    );

CREATE POLICY "Users can view open projects or their invited projects"
    ON public.projects
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (
        status = 'open'::project_status
        OR auth.uid() IN (
            SELECT bids.vendor_id FROM bids
            WHERE bids.project_id = projects.id
        )
    );

-- query_performance policies
CREATE POLICY "Allow full access to query performance for service role"
    ON public.query_performance
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (auth.role() = 'service_role'::text);

CREATE POLICY "Allow read access to query performance for admins"
    ON public.query_performance
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        auth.role() = 'authenticated'::text
        AND EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
        )
    );

-- rate_limits policies
CREATE POLICY "Superadmin can manage rate limits"
    ON public.rate_limits
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'superadmin'::user_role
    ));

-- role_permissions policies
CREATE POLICY "Admins can view all role permissions"
    ON public.role_permissions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Superadmins can manage role permissions"
    ON public.role_permissions
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'superadmin'::user_role
    ));

-- security_audit_logs policies
CREATE POLICY "Admins can view all audit logs"
    ON public.security_audit_logs
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Users can view own audit logs"
    ON public.security_audit_logs
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (userid = auth.uid());

-- security_events policies
CREATE POLICY "Admins can view all security events"
    ON public.security_events
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Users can view own security events"
    ON public.security_events
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (userid = auth.uid());

-- security_settings policies
CREATE POLICY "Users can manage own security settings"
    ON public.security_settings
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (userid = auth.uid());

CREATE POLICY "Users can view own security settings"
    ON public.security_settings
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (userid = auth.uid());

-- system_metrics policies
CREATE POLICY "Admins can manage system metrics"
    ON public.system_metrics
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (is_admin() OR is_superadmin())
    WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can view system metrics"
    ON public.system_metrics
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (is_admin() OR is_superadmin());

-- user_permissions policies
CREATE POLICY "Admins can manage permissions"
    ON public.user_permissions
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (is_admin() OR is_superadmin())
    WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can view all permissions"
    ON public.user_permissions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (is_admin() OR is_superadmin());

CREATE POLICY "Users can view own permissions"
    ON public.user_permissions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (user_id = auth.uid());

-- user_sessions policies
CREATE POLICY "Admins can view all sessions"
    ON public.user_sessions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Users can manage own sessions"
    ON public.user_sessions
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (userid = auth.uid());

CREATE POLICY "Users can view own sessions"
    ON public.user_sessions
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (userid = auth.uid());

-- users policies
CREATE POLICY "Admins can manage users"
    ON public.users
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (is_admin() OR is_superadmin())
    WITH CHECK (is_admin() OR is_superadmin());

CREATE POLICY "Admins can view all users"
    ON public.users
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (is_admin() OR is_superadmin());

CREATE POLICY "Superadmins can delete users"
    ON public.users
    AS PERMISSIVE
    FOR DELETE
    TO public
    USING (is_superadmin());

CREATE POLICY "Superadmins can invite admins"
    ON public.users
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (is_superadmin());

CREATE POLICY "Users can insert own profile"
    ON public.users
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.users
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
    ON public.users
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (auth.uid() = id);

-- vendor_change_logs policies
CREATE POLICY "Admin can insert logs for vendors"
    ON public.vendor_change_logs
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admin can view all vendor change logs"
    ON public.vendor_change_logs
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Vendors can insert logs"
    ON public.vendor_change_logs
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can view their own logs"
    ON public.vendor_change_logs
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (vendor_id = auth.uid());

-- vendors policies
CREATE POLICY "Admin can update vendor status"
    ON public.vendors
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ))
    WITH CHECK (status = ANY (ARRAY['pending'::vendor_status, 'approved'::vendor_status, 'rejected'::vendor_status]));

CREATE POLICY "Admin can view all vendors"
    ON public.vendors
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admins can update all vendors"
    ON public.vendors
    AS PERMISSIVE
    FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Admins can view all vendors"
    ON public.vendors
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role])
    ));

CREATE POLICY "Users can insert their own vendor profile"
    ON public.vendors
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own vendor profile"
    ON public.vendors
    AS PERMISSIVE
    FOR UPDATE
    TO public
    USING (auth.uid() = id);

CREATE POLICY "Users can view their own vendor profile"
    ON public.vendors
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (auth.uid() = id);

-- =====================================================
-- END OF SCHEMA DUMP
-- =====================================================
