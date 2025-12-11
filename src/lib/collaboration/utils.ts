import { User } from "@/lib/setting/types";

/**
 * Type guard to check if a user is an approved vendor
 */
export function isApprovedVendor(user: User): boolean {
    return user.vendor_status === 'approved';
}

/**
 * Type guard to check if a user is a pending vendor
 */
export function isPendingVendor(user: User): boolean {
    return user.vendor_status === 'pending';
}

/**
 * Type guard to check if a user is a rejected vendor
 */
export function isRejectedVendor(user: User): boolean {
    return user.vendor_status === 'rejected';
}
