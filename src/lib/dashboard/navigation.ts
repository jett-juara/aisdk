/**
 * Navigation configuration untuk JETT Dashboard
 * Role-based menu items dengan access control
 */

import { UserRole, NavigationItem } from "./types";

// Base navigation items untuk semua roles
const baseNavigation: NavigationItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/dashboard",
    icon: "layout-dashboard",
    isActive: true,
  },
  {
    id: "profile",
    label: "My Profile",
    href: "/dashboard/profile",
    icon: "user",
  },
];

// Admin-only navigation items
const adminNavigation: NavigationItem[] = [
  {
    id: "users",
    label: "User Management",
    href: "/dashboard/users",
    icon: "users",
    requiredRole: "admin",
  },
  {
    id: "permissions",
    label: "Permissions",
    href: "/dashboard/permissions",
    icon: "shield",
    requiredRole: "admin",
  },
];

// Superadmin-only navigation items
const superadminNavigation: NavigationItem[] = [
  {
    id: "system",
    label: "System Health",
    href: "/dashboard/system",
    icon: "activity",
    requiredRole: "superadmin",
  },
  {
    id: "invitations",
    label: "Invitations",
    href: "/dashboard/invitations",
    icon: "mail",
    requiredRole: "superadmin",
  },
  {
    id: "audit",
    label: "Audit Logs",
    href: "/dashboard/audit",
    icon: "file-text",
    requiredRole: "superadmin",
  },
  {
    id: "security",
    label: "Security",
    href: "/dashboard/security",
    icon: "shield-check",
    requiredRole: "superadmin",
  },
];

/**
 * Get navigation items berdasarkan user role
 */
export function getNavigationItems(role: UserRole): NavigationItem[] {
  const items = [...baseNavigation];

  // Add admin items for admin and superadmin
  if (role === "admin" || role === "superadmin") {
    items.push(...adminNavigation);
  }

  // Add superadmin items only for superadmin
  if (role === "superadmin") {
    items.push(...superadminNavigation);
  }

  return items;
}

/**
 * Check apakah user memiliki akses ke navigation item
 */
export function hasNavigationAccess(
  item: NavigationItem,
  userRole: UserRole,
): boolean {
  if (!item.requiredRole) return true;

  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    admin: 2,
    superadmin: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[item.requiredRole];
}

/**
 * Get active navigation state berdasarkan current path
 */
export function getActiveNavigation(
  items: NavigationItem[],
  currentPath: string,
): NavigationItem[] {
  return items.map((item) => ({
    ...item,
    isActive:
      item.href === currentPath ||
      (item.href !== "/dashboard" && currentPath.startsWith(item.href)),
  }));
}

/**
 * Navigation configuration untuk sidebar
 */
export const sidebarConfig = {
  // Logo dan branding
  branding: {
    name: "Juara",
    tagline: "Dashboard",
  },

  // Sidebar behavior
  behavior: {
    defaultCollapsed: false,
    rememberState: true,
    mobileBreakpoint: "lg",
  },

  // Animation settings
  animations: {
    toggleDuration: 200,
    itemHoverDuration: 150,
  },
} as const;
