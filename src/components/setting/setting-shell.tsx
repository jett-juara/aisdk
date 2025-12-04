/**
 * SettingShell - Main shadcn-block component
 * Data-driven architecture dengan internal sub-components
 * Pattern mirip Hero47 dari homepage
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SettingSidebar } from "./sidebar/sidebar";
import { SettingHeader } from "./header/header";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { User, SettingConfig, NavigationItem } from "@/lib/setting/types";
import { getNavigationItems, getActiveNavigation } from "@/lib/setting/navigation";
import { SettingGridBackground } from "./setting-grid-background";
import { SettingFooter } from "./footer/footer";

/**
 * Setting shell configuration interface
 */
interface SettingShellProps {
  user: User;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
  onLogout?: () => Promise<void>;
  navigationItemsOverride?: NavigationItem[];
  activePathOverride?: string;
  onNavigateOverride?: (href: string) => void;
}

/**
 * SettingShell - Main setting container dengan sidebar dan header
 * Mengikuti shadcn-block pattern seperti Hero47
 */
export function SettingShell({
  user,
  loading = false,
  className,
  children,
  onLogout,
  navigationItemsOverride,
  activePathOverride,
  onNavigateOverride,
}: SettingShellProps) {
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
  const activePath = activePathOverride || pathname || "/setting";
  let navigationItems: NavigationItem[];

  if (navigationItemsOverride) {
    // If override provided, respect incoming isActive; otherwise derive from activePath
    navigationItems = navigationItemsOverride.map((item) => ({
      ...item,
      isActive:
        item.isActive ??
        item.href === activePath ||
        (!!item.href && activePath.startsWith(item.href)),
    }));
  } else {
    navigationItems = getActiveNavigation(
      getNavigationItems(user.role),
      activePath,
    );
  }

  // Setting configuration object
  const settingConfig: SettingConfig = {
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

  return (
    <div
      className={cn(
        "flex h-screen min-h-screen bg-background-900 overflow-hidden",
        "font-body antialiased",
        className
      )}
    >
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <SettingSidebar
            collapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
            user={user}
            navigationItems={navigationItems}
            onNavigate={(href) => {
              handleMobileSidebarClose();
              onNavigateOverride?.(href);
            }}
            variant="desktop"
          />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <SettingGridBackground />
            <div className="absolute inset-0 bg-background-950/60 z-10" />
          </div>
          <SettingHeader
            user={user}
            loading={loading}
            onLogout={onLogout || (() => Promise.resolve())}
            onSidebarToggle={handleSidebarToggle}
            sidebarCollapsed={sidebarCollapsed}
            mobileSidebarOpen={mobileSidebarOpen}
            onMobileSidebarToggle={handleMobileSidebarToggle}
          />
          <main
            className={cn(
              "setting-scroll flex-1 overflow-auto p-6 lg:p-8 relative z-10",
              "bg-transparent text-text-50",
              "transition-all duration-200 ease-in-out"
            )}
          >
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
          <SettingFooter />
        </div>
      </div>
      {mounted && (
        <div className="lg:hidden">
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetContent
              side="left"
              className="border-none bg-background-900 w-[74vw] max-w-[340px] p-0"
            >
              <SheetTitle className="sr-only">Menu setting</SheetTitle>
              <div className="flex h-full flex-col">
                <SettingSidebar
                  collapsed={false}
                  onToggle={handleSidebarToggle}
                  user={user}
                  navigationItems={navigationItems}
                  onNavigate={(href) => {
                    handleMobileSidebarClose();
                    onNavigateOverride?.(href);
                  }}
                  variant="mobile"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}

// Export types untuk reuse
export type { SettingShellProps };
