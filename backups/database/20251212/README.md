# JUARA JETT Database Backup Documentation

**Backup Date**: 2025-12-12
**Database Type**: Supabase PostgreSQL
**Status**: ✅ **COMPLETE** - Empty database (structure only, no data)
**Purpose**: Complete schema backup for potential migration to alternative databases (e.g., Convex)

---

## 📋 Table of Contents

1. [Backup Overview](#backup-overview)
2. [Database Statistics](#database-statistics)
3. [File Structure](#file-structure)
4. [Table Categories](#table-categories)
5. [Custom Types (Enums)](#custom-types-enums)
6. [Key Relationships](#key-relationships)
7. [Security Architecture](#security-architecture)
8. [Migration History](#migration-history)
9. [Usage Instructions](#usage-instructions)
10. [Important Notes](#important-notes)

---

## 🎯 Backup Overview

This backup contains the **complete database schema** for the JUARA JETT application as of December 12, 2025. The database is currently empty (no data), making this an ideal baseline for:

- **Database migration** to alternative platforms (Convex, PlanetScale, etc.)
- **Development environment setup**
- **Disaster recovery planning**
- **Schema documentation and auditing**

### What's Included

✅ **42 database tables** with complete column definitions
✅ **11 custom enum types** for type-safe data
✅ **1 database view** (dashboard_latest_snapshot)
✅ **9 database functions** (triggers, RLS helpers, utilities)
✅ **12 database triggers** (auto-update, statistics, constraints)
✅ **110 RLS policies** with complete USING/WITH CHECK clauses
✅ **200+ indexes** for query optimization
✅ **Foreign key relationships** and constraints
✅ **TypeScript type definitions** for frontend integration

---

## 📊 Database Statistics

| Metric | Count |
|--------|-------|
| **Total Tables** | 42 |
| **Custom Types/Enums** | 11 |
| **Views** | 1 |
| **Functions** | 9 |
| **Triggers** | 12 |
| **RLS Policies** | 110 |
| **Total Indexes** | 200+ |
| **Total Migrations Applied** | 68 |
| **Local Migration Files** | 8 |
| **Missing Migration Files** | 60 |

---

## 📁 File Structure

```
backups/database/20251212/
├── README.md                 # This documentation file
├── schema_dump.sql          # Complete SQL schema dump
└── database.types.ts        # TypeScript type definitions
```

### File Descriptions

#### 1. `schema_dump.sql` (Complete Schema) ✅
- **Size**: ~155KB
- **Content**: ✅ **COMPLETE** DDL statements including:
  - 11 Custom type definitions (enums)
  - 42 Table creation statements with all constraints
  - 1 View definition (dashboard_latest_snapshot)
  - 9 Function definitions (complete source code)
  - 12 Trigger definitions
  - 110 RLS policies with full USING/WITH CHECK clauses
  - Primary keys and foreign key relationships
  - Index definitions (200+)

#### 2. `database.types.ts` (TypeScript Types)
- **Size**: ~115KB
- **Content**: Auto-generated TypeScript definitions for:
  - All 42 tables
  - Insert and update types
  - Relationship types
  - Enum definitions
  - View and function types

---

## 🗂️ Table Categories

### 1. **User Management** (6 tables)
Core user authentication, roles, and profiles.

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts and profiles | email, role, vendor_status |
| `user_sessions` | Active user sessions | sessionid, userid, isactive |
| `user_permissions` | Granular feature permissions | user_id, feature_key, access_granted |
| `role_permissions` | Role-based permissions | role, permission, enabled |
| `permission_conflicts` | Permission conflict tracking | user_id, conflict_type, resolution |
| `permission_inheritance_rules` | Permission inheritance logic | source_role, target_role, inheritance_type |

**Key Features**:
- Role hierarchy: `superadmin` > `admin` > `user`
- Vendor status tracking: `none`, `pending`, `approved`, `rejected`
- Session management with device tracking
- Granular permission system

---

### 2. **Security & Audit** (3 tables)
Security monitoring, audit logging, and compliance.

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `security_audit_logs` | Comprehensive audit trail | userid, action, resource, timestamp |
| `security_events` | Security incidents | type, severity, resolved |
| `security_settings` | User security preferences | userid, requiremfa, sessiontimeout |

**Key Features**:
- Complete audit trail of all actions
- Security event monitoring and alerting
- Customizable security settings per user
- IP whitelisting and trusted devices

---

### 3. **Vendor Collaboration** (6 tables)
Vendor onboarding, project bidding, and communication.

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `vendors` | Vendor profiles and details | type, status, specializations |
| `vendor_change_logs` | Vendor data change history | vendor_id, field_name, old_value, new_value |
| `projects` | Available projects | status, budget_range, timeline |
| `bids` | Vendor project bids | project_id, vendor_id, bid_amount, status |
| `messages` | Vendor notifications | vendor_id, subject, is_read |
| `announcements` | Admin announcements | target_scope, target_vendor_ids |

**Key Features**:
- Two vendor types: `company` and `individual`
- Complete bid lifecycle tracking
- Change history for compliance
- Targeted communication system

---

### 4. **Content Management System (CMS)** (5 tables)
Dynamic content management for website pages.

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `cms_pages` | Page metadata | slug, status, meta_title |
| `cms_content_blocks` | Dynamic content blocks | page_slug, section, content |
| `cms_image_grid_items` | Image grid components | page_slug, position, image_url |
| `cms_detail_blocks` | Detailed content sections | item_slug, paragraphs, status |
| `cms_home` | Homepage configuration | bg_desktop_url, hero_text_h2, cta_buttons |

**Key Features**:
- Multi-status workflow: `draft` > `review` > `published`
- Structured content with JSONB flexibility
- SEO metadata management
- Image position control

---

### 5. **Performance Monitoring** (11 tables)
Application performance tracking and optimization.

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `performance_metrics` | Real-time metrics | metric_name, value, category |
| `performance_alerts` | Performance alerts | alert_type, severity, is_resolved |
| `performance_anomalies` | Anomaly detection | baseline_value, actual_value, confidence_score |
| `performance_baselines` | Performance baselines | metric_name, baseline_value, std_deviation |
| `performance_thresholds` | Alert thresholds | metric_name, operator, threshold_value |
| `performance_recommendations` | Optimization suggestions | recommendation_type, priority, sql_statement |
| `query_performance` | Query execution tracking | query_hash, execution_time_ms, performance_score |
| `performance_dashboard_snapshots` | Dashboard snapshots | snapshot_date, system_health |

**Key Features**:
- Real-time performance monitoring
- Anomaly detection with confidence scoring
- Automated optimization recommendations
- Query performance tracking

---

### 6. **Caching System** (3 tables)
Multi-layer caching architecture.

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `cache_entries` | Cached data entries | layer_name, cache_key, ttl_seconds |
| `cache_statistics` | Cache performance stats | layer_name, cache_hits, cache_misses |
| `cache_warming_schedules` | Cache pre-warming | cron_expression, queries |

**Key Features**:
- Multi-layer cache support
- TTL-based expiration
- Hit/miss ratio tracking
- Automated cache warming

---

### 7. **Data Archival** (5 tables)
Automated data archiving and retention.

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `archive_configurations` | Archive settings per table | table_name, retention_days, enabled |
| `archive_jobs` | Archive job execution | status, processed_records, duration_ms |
| `archive_files` | Archived file metadata | filename, record_count, file_size_mb |
| `archive_statistics` | Archive metrics | date, records_archived, space_saved_mb |
| `archive_notifications` | Archive notifications | job_id, type, sent |

**Key Features**:
- Per-table archival configuration
- Automated scheduling
- Compression support
- Space savings tracking

---

### 8. **Administrative** (3 tables)
Admin user management and system configuration.

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `admin_invitations` | Admin invite management | email, role, status |
| `audit_logs` | General audit logging | user_id, action, resource_type |
| `system_metrics` | System-level metrics | metric_name, metric_value |

---

## 🏷️ Custom Types (Enums)

### 1. **user_role**
```sql
CREATE TYPE user_role AS ENUM (
    'superadmin',  -- Full system access
    'admin',       -- Administrative access
    'user'         -- Standard user access
);
```

### 2. **user_status**
```sql
CREATE TYPE user_status AS ENUM (
    'active',   -- Active account
    'blocked',  -- Temporarily blocked
    'deleted'   -- Soft deleted
);
```

### 3. **user_vendor_status**
```sql
CREATE TYPE user_vendor_status AS ENUM (
    'none',      -- Not a vendor
    'pending',   -- Application pending
    'approved',  -- Approved vendor
    'rejected'   -- Application rejected
);
```

### 4. **vendor_type**
```sql
CREATE TYPE vendor_type AS ENUM (
    'company',     -- Corporate entity (PT, CV)
    'individual'   -- Freelancer, individual specialist
);
```

### 5. **vendor_status**
```sql
CREATE TYPE vendor_status AS ENUM (
    'pending',   -- Under review
    'approved',  -- Approved for projects
    'rejected'   -- Rejected
);
```

### 6. **project_status**
```sql
CREATE TYPE project_status AS ENUM (
    'draft',        -- Being created
    'open',         -- Open for bidding
    'in_progress',  -- Project underway
    'completed',    -- Finished
    'cancelled'     -- Cancelled
);
```

### 7. **bid_status**
```sql
CREATE TYPE bid_status AS ENUM (
    'submitted',     -- Initial submission
    'under_review',  -- Being evaluated
    'accepted',      -- Bid accepted
    'rejected'       -- Bid rejected
);
```

### 8. **cms_page_status**
```sql
CREATE TYPE cms_page_status AS ENUM (
    'draft',      -- Work in progress
    'review',     -- Under review
    'published',  -- Live on website
    'archived'    -- Archived
);
```

### 9. **invitation_status**
```sql
CREATE TYPE invitation_status AS ENUM (
    'pending',    -- Not yet sent
    'sent',       -- Invitation sent
    'accepted',   -- Invitation accepted
    'expired',    -- Invitation expired
    'cancelled'   -- Invitation cancelled
);
```

### 10. **announcement_target_scope**
```sql
CREATE TYPE announcement_target_scope AS ENUM (
    'all_vendors',       -- All vendors
    'approved_vendors',  -- Only approved vendors
    'specific'           -- Specific vendor list
);
```

### 11. **pkp_status**
```sql
CREATE TYPE pkp_status AS ENUM (
    'pkp',      -- Pengusaha Kena Pajak (Tax liable)
    'non_pkp'   -- Non-PKP
);
```

---

## 🔗 Key Relationships

### Primary Foreign Key Chains

```
users (id)
  ├── user_sessions (userid)
  ├── user_permissions (user_id)
  ├── security_audit_logs (userid)
  ├── security_events (userid)
  ├── security_settings (userid)
  ├── vendors (id) [1:1]
  ├── projects (created_by)
  ├── bids (vendor_id)
  ├── messages (vendor_id, sent_by)
  └── announcements (created_by)

projects (id)
  ├── bids (project_id)
  └── messages (project_id)

vendors (id)
  └── vendor_change_logs (vendor_id)

admin_invitations (inviter_id) → users (id)
```

### Relationship Patterns

1. **1:1 Relationships**
   - `users` ↔ `vendors` (user can be a vendor)
   - `users` ↔ `security_settings` (one settings per user)

2. **1:Many Relationships**
   - `users` → `user_sessions` (multiple active sessions)
   - `users` → `bids` (vendor can submit many bids)
   - `projects` → `bids` (project can receive many bids)

3. **Many:Many (through junction)**
   - No direct many-to-many tables currently
   - Can be implemented via `user_permissions` for complex access

---

## 🔐 Security Architecture

### Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:

#### 1. **Role-Based Access Control (RBAC)**

```
superadmin → Full access to all tables
admin      → Management access to most tables
user       → Limited to own data
```

#### 2. **Owner-Based Access**

Users can only:
- View their own profile (`users`)
- Manage own sessions (`user_sessions`)
- View own security settings (`security_settings`)
- Update own vendor profile (`vendors`)

#### 3. **Admin Policies**

Admins can:
- View all users and vendors
- Manage admin invitations
- Update vendor statuses
- Create announcements
- Manage projects and bids

#### 4. **Public Access**

Limited public access for:
- Published CMS pages (`status = 'published'`)
- Open projects (`status = 'open'`)

### Security Features

✅ **Audit Logging**: All critical actions logged
✅ **Session Management**: Device tracking and activity monitoring
✅ **Rate Limiting**: Built-in rate limit tracking
✅ **MFA Support**: User-level MFA configuration
✅ **IP Whitelisting**: Per-user IP restrictions

---

## 📜 Migration History

### Summary

- **Total Migrations**: 68 applied to Supabase
- **Local Files**: Only 8 migration files present
- **Missing**: 60 migrations from Sept-Nov 2025

### Local Migration Files

```
supabase/migrations/
├── 20251125_create_collaboration_schema.sql
├── 20251203_create_system_health_schema.sql
├── 20251210_add_vendor_dashboard_indexes.sql
├── 20251210_create_vendor_dashboard_tables.sql
├── 20251210_harden_projects_rls.sql
├── 20251210_harden_vendor_change_logs_rls_for_admin.sql
├── 20251210_harden_vendors_rls_for_admin.sql
└── 20251211_collaboration_security_hardening.sql
```

### Gap Analysis

⚠️ **Critical Finding**: 60 migrations missing from local repository

**Recommendation**: This backup serves as the canonical source for the complete schema. The missing migrations represent schema evolution that occurred between September and November 2025.

---

## 📖 Usage Instructions

### 1. **Restore to Supabase**

```bash
# Using Supabase CLI
supabase db reset
psql -h <host> -U <user> -d <database> -f schema_dump.sql
```

### 2. **Migrate to Convex**

1. Review `schema_dump.sql` for schema structure
2. Map PostgreSQL types to Convex types:
   - `uuid` → `v.id()` or `v.string()`
   - `text` → `v.string()`
   - `jsonb` → `v.any()` or structured `v.object()`
   - `timestamp with time zone` → `v.number()` (Unix timestamp)
3. Recreate tables as Convex schemas
4. Implement RLS logic in Convex functions

### 3. **Use TypeScript Types**

```typescript
// Import generated types
import { Database } from './backups/database/20251212/database.types';

// Use in application
type User = Database['public']['Tables']['users']['Row'];
type VendorInsert = Database['public']['Tables']['vendors']['Insert'];
```

---

## ⚠️ Important Notes

### 1. **Database is Empty**

This backup contains **structure only**, no data. Perfect for:
- ✅ New environment setup
- ✅ Schema documentation
- ✅ Migration planning
- ❌ Data recovery (no data present)

### 2. **Missing Migrations**

60 migration files are missing from local repository. This backup represents the **current applied state**, not the migration history.

### 3. **RLS Policies** ✅ **COMPLETE**

The SQL dump includes **complete RLS policies** with full `CREATE POLICY` statements including:
- 110 policies across all 42 tables
- Complete USING clauses for row-level filtering
- Complete WITH CHECK clauses for insert/update validation
- Role-based access control logic (superadmin, admin, user)
- Owner-based access patterns

### 4. **Indexes**

200+ indexes exist on the database for optimal query performance. Critical indexes include:
- Primary key indexes (automatic)
- Foreign key indexes
- Composite indexes for common queries
- GIN indexes for JSONB and array columns

### 5. **Functions and Triggers** ✅ **COMPLETE**

All helper functions and triggers are **fully included** in this dump:
- **9 Functions**: `is_admin()`, `is_superadmin()`, `set_updated_at()`, `enforce_user_profile_constraints()`, `create_performance_snapshot()`, `update_archive_statistics()`, `update_cache_statistics()`, etc.
- **12 Triggers**: Auto-update timestamps, statistics updates, constraint enforcement
- **1 View**: `dashboard_latest_snapshot` for system health monitoring

---

## 🔄 Next Steps

If migrating to a new database platform:

1. **Review schema compatibility**
   - Check data type mappings
   - Review constraint support
   - Plan RLS equivalent implementation

2. **Plan migration strategy**
   - Incremental vs full migration
   - Data migration approach (when data exists)
   - Testing strategy

3. **Update application code**
   - Update database client imports
   - Modify RLS function calls
   - Test all database interactions

4. **Verify security**
   - Ensure RLS policies are correctly implemented
   - Test permission scenarios
   - Validate audit logging

---

## 📞 Support

For questions or issues with this backup:

1. Check migration files in `supabase/migrations/`
2. Review Supabase dashboard for live schema
3. Consult team for missing migration context

---

**Generated**: 2025-12-12
**Version**: 2.0 ✅ **COMPLETE**
**Status**: Complete schema backup with all database objects (no data)
**Completeness**: 100% - All tables, views, functions, triggers, and RLS policies included
