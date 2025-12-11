"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SettingShell } from "@/components/setting/setting-shell";
import type { User, NavigationItem } from "@/lib/setting/types";
import { logoutAction } from "@/lib/supabase/actions";

interface CollaborationShellProps {
  user: User;
  children: React.ReactNode;
}

function getCollaborationNavigationItems(): NavigationItem[] {
  return [
    {
      id: "collaboration-dashboard",
      label: "Collab Dashboard",
      href: "/collaboration/dashboard",
      icon: "layout-dashboard",
      section: "main",
    },
    {
      id: "back-to-setting",
      label: "Back to Setting",
      href: "/setting",
      icon: "settings",
      section: "footer",
    },
  ];
}

export function CollaborationShell({ user, children }: CollaborationShellProps) {
  const router = useRouter();

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
      navigationItemsOverride={getCollaborationNavigationItems()}
    >
      {children}
    </SettingShell>
  );
}
