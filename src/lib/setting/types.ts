/**
 * Type definitions untuk JETT Setting
 * Mengikuti existing patterns dari authentication system
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  vendor_status: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'superadmin' | 'admin' | 'user';
export type UserStatus = 'active' | 'blocked' | 'deleted';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  requiredRole?: UserRole;
  isActive?: boolean;
  children?: NavigationItem[];
  section?: 'main' | 'footer';
}

export interface SettingConfig {
  sidebar: {
    collapsed: boolean;
    width: {
      expanded: string;
      collapsed: string;
    };
  };
  user: User | null;
  loading: boolean;
}

export interface SettingStats {
  totalUsers: number;
  activeUsers: number;
  pendingInvitations: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SystemHealth {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastChecked: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  lastLogin?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export type RolePermissions = {
  [K in UserRole]: Permission[];
};

// Dashboard content props
export interface SettingContentProps {
  user: User;
  onNavigate?: (href: string) => void;
}

// Sidebar component props
export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: User | null;
  navigationItems: NavigationItem[];
  onNavigate?: (href: string) => void;
  variant?: "desktop" | "mobile";
}

// Header component props
export interface SettingHeaderProps {
  user: User | null;
  loading?: boolean;
  onLogout: () => Promise<void>;
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  onMobileSidebarToggle: () => void;
}
