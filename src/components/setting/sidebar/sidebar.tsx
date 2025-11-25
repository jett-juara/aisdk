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
import { SheetClose } from "@/components/ui/sheet";
import type { SidebarProps, NavigationItem } from "@/lib/setting/types";
import { sidebarConfig } from "@/lib/setting/navigation";
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
  PanelLeftClose,
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
 * Logo size classes - sama persis dengan header/logo.tsx
 */
const SIZE_CLASSES = {
  sm: {
    container: "h-10 w-10 rounded-xl",
    icon: "h-6 w-6",
    text: "text-xl font-bold uppercase text-text-50",
    gap: "gap-2",
  },
  md: {
    container: "h-10 w-10 rounded-xl",
    icon: "h-6 w-6",
    text: "text-xl font-bold uppercase text-text-50",
    gap: "gap-2",
  },
  lg: {
    container: "h-10 w-10 rounded-xl",
    icon: "h-6 w-6",
    text: "text-xl font-bold uppercase lg:text-2xl text-text-50 lg:text-text-50",
    gap: "gap-3",
  },
} as const;

/**
 * Logo component untuk sidebar - menggunakan pattern yang sama dengan header/logo.tsx
 */
function SidebarLogo({
  collapsed,
  variant = "desktop",
}: {
  collapsed: boolean;
  variant?: "desktop" | "mobile";
}) {
  const [isMounted, setIsMounted] = React.useState(false);
  const isMobileVariant = variant === "mobile";

  // Determine size berdasarkan variant - sama seperti header.tsx pattern
  const size = isMobileVariant ? "sm" : collapsed ? "sm" : "lg";
  const sizeClasses = SIZE_CLASSES[size];

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return consistent placeholder during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className={`flex items-center ${sizeClasses.gap} transition-all duration-200 ease-in-out`}>
        <div
          className={`flex flex-shrink-0 items-center justify-center ${sizeClasses.container} bg-button-primary transition-all duration-200 transform-gpu`}
        >
          <svg
            className={`${sizeClasses.icon} text-text-50 transition-all duration-200 transform-gpu`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.3 1.046A1 1 0 0010 2v5H4a1 1 0 00-.82 1.573l7 10A1 1 0 0011 18v-5h6a1 1 0 00.82-1.573l-7-10a1 1 0 00-.68-.381z"
            />
          </svg>
        </div>
        <span className={`font-brand ${sizeClasses.text} text-text-50 transition-all duration-200 transform-gpu`}>
          {sidebarConfig.branding.name}
        </span>
      </div>
    );
  }

  return (
    <Link
      href="/"
      className={`flex w-full items-center ${sizeClasses.gap} transition-all duration-200 ease-in-out transform-gpu motion-reduce:transition-none`}
    >
      {/* Logo Icon - gunakan SIZE_CLASSES yang sama dengan HeaderLogo */}
      <div
        className={`flex flex-shrink-0 items-center justify-center ${sizeClasses.container} bg-button-primary transition-all duration-200 transform-gpu`}
      >
        <svg
          className={`${sizeClasses.icon} text-text-50 transition-all duration-200 transform-gpu`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.3 1.046A1 1 0 0010 2v5H4a1 1 0 00-.82 1.573l7 10A1 1 0 0011 18v-5h6a1 1 0 00.82-1.573l-7-10a1 1 0 00-.68-.381z"
          />
        </svg>
      </div>

      {/* Logo Text - selalu dirender, center terhadap logo, di-fade saat collapsed */}
      <div
        className={cn(
          "flex items-center overflow-hidden transition-all duration-200 ease-in-out transform-gpu",
          collapsed
            ? "opacity-0 pointer-events-none select-none"
            : "opacity-100",
        )}
      >
        <span className={`font-brand ${sizeClasses.text} transition-all duration-200 transform-gpu`}>
          {sidebarConfig.branding.name}
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
  onNavigate,
}: {
  item: NavigationItem;
  collapsed: boolean;
  isActive: boolean;
  onNavigate?: (href: string) => void;
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
          ? "bg-button-primary text-text-50 hover:bg-button-primary-hover shadow-lg shadow-brand-500/20 rounded-full"
          : "text-text-50 hover:bg-white/5 hover:text-text-50 rounded-full",
        "group relative",
      )}
      size={effectiveCollapsed ? "icon" : "md"}
    >
      <Link
        href={item.href}
        onClick={() => {
          if (onNavigate) {
            onNavigate(item.href);
          }
        }}
      >
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


      </Link>
    </Button>
  );
}

/**
 * Main Sidebar Component
 */
export function SettingSidebar({
  collapsed,
  onToggle,
  user,
  navigationItems,
  onNavigate,
  variant = "desktop",
}: SidebarProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const isMobileVariant = variant === "mobile";

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Ensure consistent SSR rendering - always render in expanded state initially
  // Untuk varian mobile di dalam Sheet, kita paksa tidak collapsed
  const effectiveCollapsed = isMounted
    ? isMobileVariant
      ? false
      : collapsed
    : false;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background-800",
        isMobileVariant ? "w-full" : effectiveCollapsed ? "w-20" : "w-56",
      )}
    >
      {/* Sidebar Header dengan Logo */}
      <div
        className={cn(
          "flex items-center px-4",
          isMobileVariant ? "h-20 justify-between" : "h-20",
        )}
      >
        <SidebarLogo collapsed={effectiveCollapsed} variant={variant} />
        {isMobileVariant && (
          <SheetClose asChild>
            <button
              aria-label="Tutup menu setting"
              className="grid h-10 w-10 place-items-center text-text-50 hover:text-brand-100 hover:bg-white/5 rounded-lg transition-colors"
            >
              <PanelLeftClose
                className="h-8 w-8 text-text-100"
                strokeWidth={1}
              />
            </button>
          </SheetClose>
        )}
      </div>



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
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </div>
  );
}
