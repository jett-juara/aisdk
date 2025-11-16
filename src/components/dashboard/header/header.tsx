/**
 * Dashboard Header Component
 * User dropdown profile integration dari header-menu.tsx pattern
 * Responsive dengan sidebar toggle functionality
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
  return (
    <nav className="flex items-center space-x-2 text-sm text-text-400">
      <Link href="/dashboard" className="hover:text-text-50 transition-colors">
        Dashboard
      </Link>
      <span className="text-text-600">/</span>
      <span className="text-text-50">Overview</span>
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
  collapsed,
}: {
  onClick: () => void;
  collapsed: boolean;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="lg:hidden h-10 w-10"
    >
      {collapsed ? (
        <PanelLeftOpen className="h-5 w-5 text-text-50" />
      ) : (
        <PanelLeftClose className="h-5 w-5 text-text-50" />
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
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [expandedWidth, setExpandedWidth] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Mount gate untuk mencegah hydration mismatch dengan Radix DropdownMenu
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Sync dropdown width saat terbuka
  useEffect(() => {
    let raf: number;
    if (!menuOpen) {
      raf = requestAnimationFrame(() => {
        setExpandedWidth(null);
      });
    } else {
      raf = requestAnimationFrame(() => {
        const width = contentRef.current?.offsetWidth;
        if (width && width > 0) {
          setExpandedWidth(width);
        }
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [menuOpen]);

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
          style={expandedWidth ? { width: `${expandedWidth}px` } : undefined}
          className="group h-11 justify-between font-button font-medium text-sm px-4 overflow-hidden transition-all duration-200 font-semibold tracking-wide bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active border-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8">
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
                  className="lucide lucide-user-icon lucide-user h-5 w-5 text-[var(--color-button-primary)]"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-text-50 truncate max-w-[10rem]">
              {firstName}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-text-50 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={contentRef}
        align="end"
        className="w-auto border-border-900 bg-background-900 p-0"
      >
        <DropdownMenuSeparator className="bg-border-800" />

        <DropdownMenuItem
          className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent flex items-center gap-3 w-full px-3 py-2 min-h-[44px]"
          onSelect={async (event) => {
            event.preventDefault();
            if (loading) return;
            await onLogout();
          }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="font-button font-medium text-sm">
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
}: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-20 items-center justify-between px-6",
        "bg-background-900 backdrop-blur-sm sticky top-0 z-30",
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
            <PanelLeftOpen className="h-5 w-5 text-text-50" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-text-50" />
          )}
        </Button>

        {/* Mobile Menu Toggle */}
        <MobileMenuToggle
          onClick={onSidebarToggle}
          collapsed={sidebarCollapsed}
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
