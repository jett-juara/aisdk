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
import { User, DashboardConfig, SidebarProps } from "@/lib/dashboard/types";
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

  // Mobile sidebar state untuk slide-over
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Handle sidebar toggle
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Handle mobile sidebar close
  const handleMobileSidebarClose = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleMobileSidebarClose();
      }
    };

    if (mobileSidebarOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [mobileSidebarOpen, handleMobileSidebarClose]);

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
  const MobileSidebar = () => (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        "transition-all duration-200 ease-in-out",
        mobileSidebarOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm",
          mobileSidebarOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={handleMobileSidebarClose}
      />

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "relative flex h-full w-80 max-w-[80vw] flex-col",
          "bg-background-900 border-r border-border-800",
          "transform transition-transform duration-200 ease-in-out",
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        )}
      >
        {/* Mobile Sidebar Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-border-800">
          <h2 className="text-lg font-semibold text-text-50">Menu</h2>
          <button
            onClick={handleMobileSidebarClose}
            className="p-2 rounded-lg text-text-400 hover:text-text-50 hover:bg-hover-overlay-700 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile Sidebar Content */}
        <div className="flex-1 overflow-auto">
          <Sidebar />
        </div>
      </div>
    </div>
  );

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
