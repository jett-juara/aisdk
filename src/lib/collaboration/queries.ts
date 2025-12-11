import { SupabaseClient } from "@supabase/supabase-js";
import { User, Vendor, Bid, VendorMessage, Project, DashboardViewState, VendorChangeLog } from "./types";
import { isApprovedVendor, isPendingVendor, isRejectedVendor } from "./utils";

/**
 * Get vendor profile for a specific user ID
 */
export async function getVendorByUserId(supabase: SupabaseClient, userId: string): Promise<Vendor | null> {
    const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        if (process.env.NODE_ENV === 'development') console.error("Error fetching vendor:", error);
        return null;
    }

    return data as Vendor;
}

/**
 * Get full user profile including vendor_status
 */
export async function getUserProfile(supabase: SupabaseClient, userId: string): Promise<User | null> {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        if (process.env.NODE_ENV === 'development') console.error("Error fetching user profile:", error);
        return null;
    }

    return data as User;
}



/**
 * Fetch bids with joined project info
 */
export async function getVendorBids(supabase: SupabaseClient, vendorId: string): Promise<Bid[]> {
    const { data, error } = await supabase
        .from('bids')
        .select(`
            *,
            project:projects(*)
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) {
        if (process.env.NODE_ENV === 'development') console.error("Error fetching bids:", error);
        return [];
    }

    return data as Bid[];
}

/**
 * Fetch vendor messages
 */
export async function getVendorMessages(supabase: SupabaseClient, vendorId: string): Promise<VendorMessage[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) {
        if (process.env.NODE_ENV === 'development') console.error("Error fetching messages:", error);
        return [];
    }

    return data as VendorMessage[];
}

/**
 * Fetch all vendors for Admin (joined with user data)
 */
export async function getAdminVendors(supabase: SupabaseClient): Promise<any[]> {
    // Join vendors with users to get name/email/status from user table if needed
    // However, Supabase joins on foreign keys. 'vendors.id' references 'users.id'.

    const { data, error } = await supabase
        .from('vendors')
        .select(`
            *,
            user:users!inner(
                email,
                first_name,
                last_name,
                vendor_status
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        if (process.env.NODE_ENV === 'development') console.error("Error fetching admin vendors:", error);
        return [];
    }
    return data;
}

/**
 * Fetch all projects for Admin
 */
export async function getAdminProjects(supabase: SupabaseClient): Promise<Project[]> {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        if (process.env.NODE_ENV === 'development') console.error("Error fetching admin projects:", error);
        return [];
    }
    return data as Project[];
}

export async function getDashboardViewData(supabase: SupabaseClient, userId: string): Promise<{
    user: User | null;
    vendor: Vendor | null;
    bids: Bid[];
    messages: VendorMessage[];
    allVendors: any[]; // For admin
    allProjects: Project[]; // For admin
    viewState: DashboardViewState;
}> {
    const user = await getUserProfile(supabase, userId);

    if (!user) {
        return { user: null, vendor: null, bids: [], messages: [], allVendors: [], allProjects: [], viewState: 'error' };
    }

    // 1. Admin/Superadmin View
    if (user.role === 'admin' || user.role === 'superadmin') {
        const [allVendors, allProjects] = await Promise.all([
            getAdminVendors(supabase),
            getAdminProjects(supabase)
        ]);
        return {
            user,
            vendor: null,
            bids: [],
            messages: [],
            allVendors,
            allProjects,
            viewState: 'admin_console'
        };
    }

    // 2. Vendor Views
    const vendor = await getVendorByUserId(supabase, userId);
    let bids: Bid[] = [];
    let messages: VendorMessage[] = [];

    // If approved, fetch data
    if (isApprovedVendor(user) && vendor?.status === 'approved') {
        // Parallel fetch
        [bids, messages] = await Promise.all([
            getVendorBids(supabase, userId),
            getVendorMessages(supabase, userId)
        ]);

        return {
            user,
            vendor,
            bids,
            messages,
            allVendors: [],
            allProjects: [],
            viewState: 'vendor_portal'
        };
    }

    if (isPendingVendor(user) || vendor?.status === 'pending') {
        return { user, vendor, bids: [], messages: [], allVendors: [], allProjects: [], viewState: 'vendor_pending' };
    }

    if (isRejectedVendor(user) || vendor?.status === 'rejected') {
        return { user, vendor, bids: [], messages: [], allVendors: [], allProjects: [], viewState: 'vendor_rejected' };
    }

    // Default: User role but no vendor status/entry
    return { user, vendor, bids: [], messages: [], allVendors: [], allProjects: [], viewState: 'vendor_none' };
}

/**
 * Fetch logs for a specific vendor
 */
export async function getVendorChangeLogs(supabase: SupabaseClient, vendorId: string): Promise<VendorChangeLog[]> {
    const { data: logs, error } = await supabase
        .from('vendor_change_logs')
        .select(`
            *,
            changed_by_user:users!vendor_change_logs_changed_by_user_id_fkey(
                email,
                first_name,
                last_name
            )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

    if (error) {
        if (process.env.NODE_ENV === 'development') console.error("Error fetching logs:", error);
        return [];
    }

    return logs as unknown as VendorChangeLog[];
}
