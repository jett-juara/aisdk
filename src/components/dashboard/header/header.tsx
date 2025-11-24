/**
 * Dashboard Header Component
 * User dropdown profile integration dari header-menu.tsx pattern
 * Responsive dengan sidebar toggle functionality
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardHeaderProps, User } from "@/lib/dashboard/types";
import {
  Bell,
  LogOut,
  Loader2,
  ChevronDown,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";

/**
 * Breadcrumb Navigation Component
 */
function DashboardBreadcrumb() {
  const pathname = usePathname();

  // Map path segments to readable labels
  const breadcrumbMap: Record<string, string> = {
    overview: "Overview",
    profile: "My Profile",
    users: "User Management",
    permissions: "Permissions",
    system: "System Health",
    invitations: "Invitations",
    audit: "Audit Logs",
    security: "Security",
  };

  // Get segments after /dashboard
  const segments = pathname?.split("/").filter(Boolean).slice(1) || [];

  // If we are at root /dashboard, show Overview
  const isRoot = segments.length === 0;
  const currentLabel = isRoot ? "Overview" : breadcrumbMap[segments[0]] || segments[0];

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-400">
      <Link href="/dashboard" className="hover:text-text-50 transition-colors">
        Dashboard
      </Link>
      <span className="text-text-600">/</span>
      <span className="text-text-50 capitalize">
        {currentLabel}
      </span>
    </nav>
  );
}

/**
 * Notification Bell Component
 */
function NotificationBell() {
  return (
    <Button variant="ghost" size="icon" className="relative h-10 w-10">
      <Bell className="h-5 w-5 text-text-50" />
      <span className="absolute top-1 right-1 h-2 w-2 bg-button-destructive rounded-full" />
    </Button>
  );
}

/**
 * Mobile Menu Toggle Component
 */
function MobileMenuToggle({
  onClick,
  open,
}: {
  onClick: () => void;
  open: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden h-10 w-10"
    >
      {open ? (
        <PanelLeftClose
          className="h-8 w-8 text-text-100"
          strokeWidth={1}
        />
      ) : (
        <PanelLeftOpen
          className="h-8 w-8 text-text-100"
          strokeWidth={1}
        />
      )}
    </Button>
  );
}

/**
 * User Profile Dropdown - Integration dari header-menu.tsx pattern
 */
function UserProfileDropdown({
  user,
  onLogout,
  loading,
}: {
  user: User | null;
  onLogout: () => Promise<void>;
  loading?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [baseWidth, setBaseWidth] = useState<number | null>(null);
  const [syncedWidth, setSyncedWidth] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const EXPANSION_DELTA = 24;

  // Mount gate untuk mencegah hydration mismatch dengan Radix DropdownMenu
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Hitung lebar dasar tombol setelah mount (saat dropdown tertutup)
  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => {
      const width = triggerRef.current?.offsetWidth ?? 0;
      if (width > 0) {
        setBaseWidth((prev) => prev ?? width);
        setSyncedWidth((prev) => prev ?? width);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  // Saat menu dibuka, sinkronkan lebar tombol dan konten ke nilai maksimum
  useEffect(() => {
    if (!menuOpen) return;
    const raf = requestAnimationFrame(() => {
      const triggerWidth = triggerRef.current?.offsetWidth ?? 0;
      const contentWidth = contentRef.current?.offsetWidth ?? 0;
      const base = baseWidth ?? triggerWidth;
      const width = contentWidth > base
        ? Math.max(contentWidth, triggerWidth)
        : base + EXPANSION_DELTA;
      if (width > 0) {
        setSyncedWidth(width);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [menuOpen, baseWidth]);

  useEffect(() => {
    if (!menuOpen) {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      return;
    }
    const el = contentRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      const currentWidth = rect?.width ?? el.offsetWidth;
      const base = baseWidth ?? (triggerRef.current?.offsetWidth ?? 0);
      const width = currentWidth > base ? currentWidth : base + EXPANSION_DELTA;
      if (width > 0) setSyncedWidth(width);
    });
    resizeObserverRef.current = ro;
    ro.observe(el);
    return () => {
      ro.disconnect();
      resizeObserverRef.current = null;
    };
  }, [menuOpen, baseWidth]);

  useEffect(() => {
    if (menuOpen) return;
    const w = baseWidth ?? (triggerRef.current?.offsetWidth ?? 0);
    if (w > 0 && w !== syncedWidth) {
      const raf = requestAnimationFrame(() => setSyncedWidth(w));
      return () => cancelAnimationFrame(raf);
    }
    return;
  }, [menuOpen, baseWidth, syncedWidth]);

  if (!user) return null;

  // SSR-safe placeholder sebelum mounted di client
  if (!mounted) {
    return (
      <div className="h-11 min-w-[2.75rem] rounded-md bg-background-800 animate-pulse" />
    );
  }

  const firstName =
    (user as any).firstName ??
    (user as any).first_name ??
    "";

  return (
    <DropdownMenu onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          style={syncedWidth ? { width: `${syncedWidth}px` } : undefined}
          className="group justify-between font-button font-medium px-0 has-[>svg]:px-0 overflow-hidden transition-all duration-500 ease-premium font-semibold tracking-wide bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active border-none h-11 text-sm rounded-full"
        >
          <div className="flex items-center gap-3 min-w-0 pl-4">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-text-50 font-bold bg-brand-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-user-icon lucide-user h-6 w-6 text-[var(--color-button-primary)]"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </AvatarFallback>
            </Avatar>
            <span className="font-button font-medium text-text-50 text-sm">
              {firstName}
            </span>
          </div>
          <ChevronDown className="mr-4 h-4 w-4 text-text-50 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={contentRef}
        align="end"
        style={syncedWidth ? { width: `${syncedWidth}px` } : undefined}
        className="w-auto border-glass-border bg-background-900/95 backdrop-blur-xl p-2 rounded-xl"
      >


        <DropdownMenuItem
          className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-glass-bg focus:bg-glass-bg flex items-center gap-3 w-full px-4 py-2 min-h-[44px] hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4 rounded-lg"
          onSelect={async (event) => {
            event.preventDefault();
            if (loading) return;
            await onLogout();
          }}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <LogOut className="h-6 w-6" />
          )}
          <span className="font-button font-medium text-sm text-text-50">
            {loading ? "Keluar..." : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Main Dashboard Header Component
 */
export function DashboardHeader({
  user,
  loading = false,
  onLogout,
  onSidebarToggle,
  sidebarCollapsed,
  mobileSidebarOpen,
  onMobileSidebarToggle,
}: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-20 items-center justify-between px-6",
        "bg-background-900/80 backdrop-blur-2xl border-b border-white/10 shadow-sm sticky top-0 z-30",
        "transition-all duration-200 ease-in-out",
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="hidden lg:flex h-10 w-10"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-8 w-8 text-text-50"
              strokeWidth={1} />
          ) : (
            <PanelLeftClose className="h-8 w-8 text-text-50" strokeWidth={1} />
          )}
        </Button>

        {/* Mobile Menu Toggle */}
        <MobileMenuToggle
          onClick={onMobileSidebarToggle}
          open={mobileSidebarOpen}
        />

        {/* Breadcrumb */}
        <div className="hidden md:block">
          <DashboardBreadcrumb />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* User Profile Dropdown */}
        <UserProfileDropdown
          user={user}
          onLogout={onLogout}
          loading={loading}
        />
      </div>
    </header>
  );
}
