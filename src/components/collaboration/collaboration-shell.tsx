"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SettingShell } from "@/components/setting/setting-shell";
import type { User, NavigationItem } from "@/lib/setting/types";
import { logoutAction } from "@/lib/supabase/actions";

interface CollaborationShellProps {
  user: User;
  children: React.ReactNode;
}

function getCollaborationNavigationItems(role?: string, view?: string | null): NavigationItem[] {
  const items: NavigationItem[] = [
    {
      id: "collaboration-dashboard",
      label: "Overview",
      href: "/collaboration/dashboard",
      icon: "layout-dashboard",
      section: "main",
      isActive: !view, // Active only if no view param
    },
  ];

  // Admin-specific navigation
  if (role === 'admin' || role === 'superadmin') {
    items.push(
      {
        id: "vendors-management",
        label: "Vendors Management",
        href: "/collaboration/dashboard?view=vendors",
        icon: "users",
        section: "main",
        isActive: view === 'vendors',
      },
      {
        id: "projects-management",
        label: "Projects & Bids",
        href: "/collaboration/dashboard?view=projects",
        icon: "briefcase",
        section: "main",
        isActive: view === 'projects',
      }
    );
  }

  items.push({
    id: "back-to-setting",
    label: "Back to Setting",
    href: "/setting",
    icon: "settings",
    section: "footer",
  });

  return items;
}

export function CollaborationShell({ user, children }: CollaborationShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      // Quietly fallback to auth page on error
      window.location.href = "/auth";
    }
  };

  return (
    <SettingShell
      user={user}
      onLogout={handleLogout}
      onNavigateOverride={handleNavigate}
      navigationItemsOverride={getCollaborationNavigationItems(user.role, view)}
    >
      {children}
    </SettingShell>
  );
}
