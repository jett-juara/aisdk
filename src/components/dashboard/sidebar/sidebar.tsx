/**
 * Dashboard Sidebar Component
 * Collapsible sidebar dengan logo integration dari header
 * Responsive behavior untuk desktop dan mobile
 */

"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { SidebarProps, NavigationItem } from "@/lib/dashboard/types";
import { sidebarConfig } from "@/lib/dashboard/navigation";
import {
  Home,
  User as UserIcon, // ← NEEDED untuk "My Profile" menu (rename to avoid conflict)
  Users,
  Shield,
  ShieldCheck,
  FileText,
  Mail,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

/**
 * Icon mapping untuk SEMUA navigation items
 *
 * 🔥 DAFTAR LENGKAP SEMUA MENU YANG ADA DI SIDEBAR:
 *
 * ✅ MENU UNTUK SEMUA USER (user, admin, superadmin):
 *    📊 'layout-dashboard' → Home → "Overview" (Dashboard utama)
 *    👤 'user' → User → "My Profile" (Profil user)
 *
 * 🔒 MENU UNTUK ADMIN + SUPERADMIN SAJA:
 *    👥 'users' → Users → "User Management" (Kelola user)
 *    🛡️ 'shield' → Shield → "Permissions" (Kelola permissions)
 *
 * 🔒 MENU UNTUK SUPERADMIN SAJA:
 *    📊 'activity' → Activity → "System Health" (Status system)
 *    📧 'mail' → Mail → "Invitations" (Undangan user)
 *    📄 'file-text' → FileText → "Audit Logs" (Log aktivitas)
 *    🔐 'shield-check' → ShieldCheck → "Security" (Keamanan)
 *
 * ⚙️ FALLBACK MENU:
 *    ⚙️ 'settings' → Settings → Default icon kalau error
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // ✅ MENU UNTUK SEMUA USER:
  "layout-dashboard": Home, // "Overview" - Dashboard utama
  user: UserIcon, // "My Profile" - Profil user

  // 🔒 MENU UNTUK ADMIN + SUPERADMIN:
  users: Users, // "User Management" - Kelola user
  shield: Shield, // "Permissions" - Kelola permissions

  // 🔒 MENU UNTUK SUPERADMIN SAJA:
  activity: Activity, // "System Health" - Status system
  mail: Mail, // "Invitations" - Undangan user
  "file-text": FileText, // "Audit Logs" - Log aktivitas
  "shield-check": ShieldCheck, // "Security" - Keamanan

  // ⚙️ FALLBACK:
  settings: Settings, // Default icon kalau error
};

/**
 * Logo component untuk sidebar - modified dari header logo
 */
function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return consistent placeholder during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <Link
        href="/dashboard"
        className="flex items-center gap-3 transition-all duration-200 ease-in-out"
      >
        {/* Logo Icon - Always render in consistent state during SSR */}
        <div className="flex-shrink-0 flex items-center justify-center bg-button-primary rounded-sm h-10 w-10 transition-all duration-200">
          <Zap className="text-text-50 h-6 w-6 transition-all duration-200" />
        </div>

        {/* Logo Text - Always show during SSR for consistency */}
        <div className="flex flex-col">
          <span className="text-xl font-bold uppercase text-text-50 font-brand">
            {sidebarConfig.branding.name}
          </span>
          <span className="text-xs text-text-400 font-body">
            {sidebarConfig.branding.tagline}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="flex w-full items-center gap-3 transition-colors duration-200 ease-in-out"
    >
      {/* Logo Icon */}
      <div className="flex-shrink-0 flex items-center justify-center bg-button-primary rounded-sm h-10 w-10 transition-colors duration-200">
        <Zap className="text-text-50 h-5 w-5 transition-colors duration-200" />
      </div>

      {/* Logo Text - selalu dirender, tapi di-fade saat collapsed */}
      <div
        className={cn(
          "flex flex-col transition-opacity duration-200",
          collapsed
            ? "opacity-0 pointer-events-none select-none"
            : "opacity-100",
        )}
      >
        <span className="text-xl font-bold uppercase text-text-50 font-brand">
          {sidebarConfig.branding.name}
        </span>
        <span className="text-xs text-text-400 font-body">
          {sidebarConfig.branding.tagline}
        </span>
      </div>
    </Link>
  );
}

/**
 * Navigation Item Component
 */
function NavigationItemComponent({
  item,
  collapsed,
  isActive,
}: {
  item: NavigationItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const [isMounted, setIsMounted] = React.useState(false);
  const IconComponent = iconMap[item.icon || "settings"] || Settings;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ensure consistent SSR rendering - always render in expanded state initially
  const effectiveCollapsed = isMounted ? collapsed : false;

  return (
    <Button
      asChild
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "transition-colors duration-200 ease-in-out",
        effectiveCollapsed
          ? "w-10 justify-center p-0 mx-auto"
          : "w-full justify-start px-4",
        effectiveCollapsed ? "gap-0" : "gap-3",
        isActive
          ? "bg-button-primary text-text-50 hover:bg-button-primary-hover"
          : "text-text-50 hover:bg-hover-overlay-700 hover:text-text-50",
        "group relative",
      )}
      size={effectiveCollapsed ? "icon" : "md"}
    >
      <Link href={item.href}>
        <IconComponent
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-colors duration-200",
            isActive && "text-text-50",
            !isActive && "text-text-400 group-hover:text-text-50",
          )}
        />
        <span
          className={cn(
            "truncate transition-opacity duration-200 ease-in-out",
            effectiveCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
          )}
        >
          {item.label}
        </span>

        {/* Active indicator */}
        {isActive && !effectiveCollapsed && (
          <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-button-primary" />
        )}
      </Link>
    </Button>
  );
}

/**
 * Main Sidebar Component
 */
export function DashboardSidebar({
  collapsed,
  onToggle,
  user,
  navigationItems,
  onNavigate,
}: SidebarProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ensure consistent SSR rendering - always render in expanded state initially
  const effectiveCollapsed = isMounted ? collapsed : false;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background-900 border-r border-border-800",
        effectiveCollapsed ? "w-20" : "w-56",
      )}
	    >
	      {/* Sidebar Header dengan Logo */}
	      <div className="flex h-20 items-center px-4">
	        <SidebarLogo collapsed={effectiveCollapsed} />
	      </div>

      <Separator className="bg-border-800" />

      {/*
      📋 MENU NAVIGATION LENGKAP - RENDER SEMUA MENU SESUAI ROLE:

      ✅ UNTUK SEMUA USER:
         - "Overview" (Dashboard utama dengan icon Home)
         - "My Profile" (Profil user dengan icon User)

      🔒 UNTUK ADMIN + SUPERADMIN:
         - "User Management" (Kelola user dengan icon Users)
         - "Permissions" (Kelola permissions dengan icon Shield)

      🔒 UNTUK SUPERADMIN SAJA:
         - "System Health" (Status system dengan icon Activity)
         - "Invitations" (Undangan user dengan icon Mail)
         - "Audit Logs" (Log aktivitas dengan icon FileText)
         - "Security" (Keamanan dengan icon ShieldCheck)

      🔄 Menu otomatis muncul/hilang berdasarkan user role dari navigation.ts
      */}
      <nav className="flex-1 p-4 space-y-2 overflow-auto">
        {navigationItems.map((item) => (
          <NavigationItemComponent
            key={item.id}
            item={item}
            collapsed={effectiveCollapsed}
            isActive={item.isActive || false}
          />
        ))}
      </nav>
    </div>
  );
}
