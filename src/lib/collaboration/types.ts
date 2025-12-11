import { User } from "@/lib/setting/types";

// Re-export User type for convenience
export type { User };

export type VendorType = 'company' | 'individual';
export type VendorStatus = 'pending' | 'approved' | 'rejected';
export type PkpStatus = 'pkp' | 'non_pkp';

export interface VendorDocuments {
  nib?: string; // URL
  company_profile?: string; // URL
  portfolio?: string; // URL
  invoice?: string; // URL
  npwp?: string; // URL
  ktp?: string; // URL
  pkp?: string; // URL
  nda?: string; // URL
  [key: string]: string | undefined;
}

export interface Vendor {
  id: string; // References users.id
  type: VendorType;

  // Company Details
  company_name?: string;
  company_address?: any; // JSONB
  company_email?: string;
  company_phone?: string;
  nib_number?: string;

  // Individual Details
  individual_name?: string;
  individual_address?: any; // JSONB
  individual_email?: string;
  individual_phone?: string;

  // Common
  specializations: string[];

  // Bank
  bank_name: string;
  bank_account_number: string;
  bank_account_holder: string;

  // Tax
  npwp_number: string;
  pkp_status?: PkpStatus;

  // Documents
  documents: VendorDocuments;

  // Metadata
  status: VendorStatus;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'draft' | 'open' | 'closed' | 'awarded' | 'cancelled';

export interface Project {
  id: string;
  title: string;
  description: string;
  client_name?: string;
  budget?: number;
  currency: string;
  status: ProjectStatus;
  requirements: any[]; // JSONB
  created_by?: string;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export type BidStatus = 'invited' | 'submitted' | 'under_review' | 'shortlisted' | 'rejected' | 'awarded';

export interface Bid {
  id: string;
  project_id: string;
  vendor_id: string;
  amount?: number;
  currency: string;
  proposal_document?: { url: string; name: string }; // JSONB
  notes?: string;
  status: BidStatus;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
  updated_at: string;

  // Joins
  project?: Project;
}

export interface VendorMessage {
  id: string;
  vendor_id: string;
  project_id?: string;
  subject: string;
  body: string;
  action_label?: string;
  action_url?: string;
  is_read: boolean;
  sent_by?: string;
  created_at: string;
}

export interface VendorChangeLog {
  id: string;
  vendor_id: string;
  changed_by: string;
  changed_by_user_id?: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

// Aggregated View Data
export interface DashboardData {
  vendor: Vendor;
  bids: Bid[];
  messages: VendorMessage[];
}

export type DashboardViewState =
  | 'loading'
  | 'vendor_portal'
  | 'vendor_pending'
  | 'vendor_rejected'
  | 'vendor_none'
  | 'admin_console'
  | 'error';
