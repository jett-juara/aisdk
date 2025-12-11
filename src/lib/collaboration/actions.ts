"use server";

import { createSupabaseRSCClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Vendor } from "./types";

// Define allowed editable fields for safety
const ALLOWED_FIELDS = [
    'company_email', 'company_phone', 'company_address',
    'individual_email', 'individual_phone', 'individual_address',
    'bank_name', 'bank_account_number', 'bank_account_holder',
    'npwp_number', 'pkp_status',
    'documents'
];

export async function updateVendorProfile(vendorId: string, data: Partial<Vendor>) {
    const supabase = await createSupabaseRSCClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    // Verify ownership (auth.uid === vendorId is typical, assuming vendor_id IS user_id)
    if (vendorId !== user.id) {
        return { error: "Unauthorized access to vendor profile" };
    }

    // 2. Fetch current data for Change Log
    const { data: currentVendor, error: fetchError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

    if (fetchError || !currentVendor) {
        return { error: "Vendor not found" };
    }

    // 3. Prepare Updates and Logs
    const updates: any = {};
    const logs: any[] = [];

    for (const [key, newValue] of Object.entries(data)) {
        if (!ALLOWED_FIELDS.includes(key)) continue;

        const oldValue = (currentVendor as any)[key];

        // Simple equality check
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            updates[key] = newValue;

            logs.push({
                vendor_id: vendorId,
                changed_by: 'vendor',
                changed_by_user_id: vendorId,
                field_name: key,
                old_value: typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue || ''),
                new_value: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue || '')
            });
        }
    }

    if (Object.keys(updates).length === 0) {
        return { success: true, message: "No changes detected" };
    }

    updates['updated_at'] = new Date().toISOString();

    // 4. Perform Update Transaction 
    const { error: updateError } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendorId);

    if (updateError) {
        return { error: `Failed to update profile: ${updateError.message}` };
    }

    // 5. Insert Logs
    if (logs.length > 0) {
        // Log errors are silent but we could return warning if needed
        await supabase.from("vendor_change_logs").insert(logs);
    }

    revalidatePath('/collaboration/dashboard');
    return { success: true };
}

/**
 * Admin: Approve Vendor
 */
export async function adminApproveVendor(vendorId: string) {
    const supabase = await createSupabaseRSCClient();

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        return { success: false, error: "Unauthorized: Admin access required" };
    }

    try {
        // 1. Update vendors table
        const { error: vendorError } = await supabase
            .from("vendors")
            .update({ status: 'approved' })
            .eq("id", vendorId);

        if (vendorError) throw vendorError;

        // 2. Update users table
        const { error: userError } = await supabase
            .from("users")
            .update({ vendor_status: 'approved' })
            .eq("id", vendorId); // vendorId is userId

        if (userError) throw userError;

        // 3. Log change
        await supabase.from("vendor_change_logs").insert({
            vendor_id: vendorId,
            changed_by: 'admin',
            changed_by_user_id: user.id,
            field_name: "status",
            old_value: "pending",
            new_value: "approved"
        });

        revalidatePath("/collaboration/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to approve vendor" };
    }
}

/**
 * Admin: Reject Vendor
 */
export async function adminRejectVendor(vendorId: string) {
    const supabase = await createSupabaseRSCClient();

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        return { success: false, error: "Unauthorized: Admin access required" };
    }

    try {
        // 1. Update vendors table
        const { error: vendorError } = await supabase
            .from("vendors")
            .update({ status: 'rejected' })
            .eq("id", vendorId);

        if (vendorError) throw vendorError;

        // 2. Update users table
        const { error: userError } = await supabase
            .from("users")
            .update({ vendor_status: 'rejected' })
            .eq("id", vendorId);

        if (userError) throw userError;

        // 3. Log change
        await supabase.from("vendor_change_logs").insert({
            vendor_id: vendorId,
            changed_by: 'admin',
            changed_by_user_id: user.id,
            field_name: "status",
            old_value: "pending",
            new_value: "rejected"
        });

        revalidatePath("/collaboration/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to reject vendor" };
    }
}

/**
 * Admin: Create Project
 */
import { projectSchema, ProjectFormValues } from "./project-schema";

export async function createProject(data: ProjectFormValues) {
    const supabase = await createSupabaseRSCClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        return { success: false, error: "Unauthorized: Admin access required" };
    }

    // 2. Validate Data
    const validation = projectSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.message };
    }

    try {
        // 3. Insert into projects table
        const { error: projectError } = await supabase
            .from("projects")
            .insert({
                ...data,
                created_by: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (projectError) throw projectError;

        revalidatePath("/collaboration/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to create project" };
    }
}

/**
 * Vendor: Submit Bid
 */
import { bidSchema, BidFormValues } from "./bid-schema";

export async function submitBid(projectId: string, data: BidFormValues & { proposal_url?: string, proposal_name?: string }) {
    const supabase = await createSupabaseRSCClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    // 2. Verify Invitation & Project Status
    // We check if a bid entry exists for this user+project (invitation created it)
    const { data: existingBid, error: bidError } = await supabase
        .from("bids")
        .select("*")
        .eq("project_id", projectId)
        .eq("vendor_id", user.id) // vendor_id is usually same as user.id
        .single();

    if (bidError || !existingBid) {
        return { success: false, error: "You are not invited to this project or it does not exist." };
    }

    if (existingBid.status !== 'invited' && existingBid.status !== 'submitted') {
        // Allow re-submission if already submitted or just invited. 
        // If rejected/awarded, maybe block? For now, allow updates if 'submitted' or 'invited'.
        // Let's stricter: if it's closed or awarded elsewhere, maybe block.
        // For simplicity: mostly allow unless locked.
    }

    // 3. Validate Data
    const validation = bidSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.message };
    }

    try {
        // 4. Update Bid
        const updateData: any = {
            amount: data.amount,
            currency: data.currency,
            notes: data.notes,
            status: 'submitted',
            updated_at: new Date().toISOString()
        };

        if (data.proposal_url) {
            updateData.proposal_document = {
                url: data.proposal_url,
                name: data.proposal_name || "Proposal"
            };
        }

        const { error: updateError } = await supabase
            .from("bids")
            .update(updateData)
            .eq("id", existingBid.id);

        if (updateError) throw updateError;

        revalidatePath("/collaboration/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to submit bid" };
    }
}

/**
 * Vendor: Mark Message as Read
 */
export async function markMessageAsRead(messageId: string) {
    const supabase = await createSupabaseRSCClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("id", messageId)
            .eq("vendor_id", user.id); // Ensure ownership

        if (error) throw error;

        revalidatePath("/collaboration/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
