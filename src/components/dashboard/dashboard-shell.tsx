/**
 * DashboardShell - Main shadcn-block component
 * Data-driven architecture dengan internal sub-components
 * Pattern mirip Hero47 dari homepage
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "./sidebar/sidebar";
import { DashboardHeader } from "./header/header";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { User, DashboardConfig } from "@/lib/dashboard/types";
import { getNavigationItems, getActiveNavigation } from "@/lib/dashboard/navigation";

/**
 * Dashboard shell configuration interface
 */
interface DashboardShellProps {
  user: User;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
  onLogout?: () => Promise<void>;
}

/**
 * DashboardShell - Main dashboard container dengan sidebar dan header
 * Mengikuti shadcn-block pattern seperti Hero47
 */
	export function DashboardShell({
  user,
  loading = false,
  className,
  children,
  onLogout,
	}: DashboardShellProps) {
	  const pathname = usePathname();

	  // Sidebar state management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mobile sidebar state untuk Sheet
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Mount gate untuk menghindari hydration mismatch dengan Radix Sheet
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Handle mobile sidebar toggle & close
  const handleMobileSidebarToggle = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const handleMobileSidebarClose = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

	  // Get navigation items berdasarkan user role + current path
	  const navigationItems = getActiveNavigation(
	    getNavigationItems(user.role),
	    pathname || "/dashboard",
	  );

  // Dashboard configuration object
  const dashboardConfig: DashboardConfig = {
    sidebar: {
      collapsed: sidebarCollapsed,
      width: {
        expanded: 'w-64',
        collapsed: 'w-16',
      },
    },
    user,
    loading,
  };

  /**
   * Sidebar Component - Internal sub-component
   */
  const Sidebar = () => (
    <DashboardSidebar
      collapsed={sidebarCollapsed}
      onToggle={handleSidebarToggle}
      user={user}
      navigationItems={navigationItems}
      onNavigate={() => handleMobileSidebarClose()}
      variant="desktop"
    />
  );

  /**
   * Header Component - Internal sub-component
   */
  const Header = () => (
    <DashboardHeader
      user={user}
      loading={loading}
      onLogout={onLogout || (() => Promise.resolve())}
      onSidebarToggle={handleSidebarToggle}
      sidebarCollapsed={sidebarCollapsed}
      mobileSidebarOpen={mobileSidebarOpen}
      onMobileSidebarToggle={handleMobileSidebarToggle}
    />
  );

  /**
   * Main Layout Component - Internal sub-component
   */
	  const MainLayout = () => (
	    <div className="flex flex-1 overflow-hidden">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

	      {/* Main Content Area */}
	      <div className="flex flex-1 flex-col overflow-hidden">
	        <Header />

	        {/* Horizontal separator aligned with sidebar header */}
	        <Separator className="bg-border-800" />

	        {/* Page Content */}
	        <main
	          className={cn(
	            "dashboard-scroll flex-1 overflow-auto p-6 lg:p-8",
	            "bg-background-900 text-text-50",
	            // Smooth transition untuk sidebar toggle
	            "transition-all duration-200 ease-in-out"
	          )}
	        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );

  /**
   * Mobile Sidebar Overlay - Internal sub-component
   */
  const MobileSidebar = () => {
    if (!mounted) return null;

    return (
      <div className="lg:hidden">
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent
            side="left"
            className="border-none bg-background-900 w-[74vw] max-w-[340px] p-0"
          >
            <SheetTitle className="sr-only">Menu dashboard</SheetTitle>
            <div className="flex h-full flex-col">
              <DashboardSidebar
                collapsed={false}
                onToggle={handleSidebarToggle}
                user={user}
                navigationItems={navigationItems}
                onNavigate={() => handleMobileSidebarClose()}
                variant="mobile"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  };

  // Render main dashboard shell
  return (
    <div
      className={cn(
        "flex h-screen min-h-screen bg-background-900 overflow-hidden",
        "font-body antialiased",
        className
      )}
    >
      {/* Main Layout */}
      <MainLayout />

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar />
    </div>
  );
}

// Export types untuk reuse
export type { DashboardShellProps };
