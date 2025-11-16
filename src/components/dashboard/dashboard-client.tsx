/**
 * Dashboard Client Component
 * Client-side wrapper untuk DashboardShell dengan logout functionality
 */

"use client";

import React from "react";
import { DashboardShell } from "./dashboard-shell";
import { DashboardOverview } from "./content/overview";
import {
  DashboardProfile,
  DashboardUsers,
  DashboardPermissions,
  DashboardSystem,
  DashboardInvitations,
  DashboardAudit,
  DashboardSecurity,
} from "./content/sections";
import { User } from "@/lib/dashboard/types";
import { logoutAction } from "@/lib/supabase/actions";

type DashboardView =
  | "overview"
  | "profile"
  | "users"
  | "permissions"
  | "system"
  | "invitations"
  | "audit"
  | "security";

interface DashboardClientProps {
  user: User;
  view?: DashboardView;
}

/**
 * Dashboard Client Component dengan client-side logout handling
 */
export function DashboardClient({ user, view = "overview" }: DashboardClientProps) {
  /**
   * Client-side logout handler dengan server action
   */
  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: redirect manual jika server action gagal
      window.location.href = '/auth';
    }
  };

  let content: React.ReactNode;

  switch (view) {
    case "profile":
      content = <DashboardProfile user={user} />;
      break;
    case "users":
      content = <DashboardUsers user={user} />;
      break;
    case "permissions":
      content = <DashboardPermissions user={user} />;
      break;
    case "system":
      content = <DashboardSystem user={user} />;
      break;
    case "invitations":
      content = <DashboardInvitations user={user} />;
      break;
    case "audit":
      content = <DashboardAudit user={user} />;
      break;
    case "security":
      content = <DashboardSecurity user={user} />;
      break;
    case "overview":
    default:
      content = <DashboardOverview user={user} />;
      break;
  }

  return (
    <DashboardShell
      user={user}
      onLogout={handleLogout}
    >
      {content}
    </DashboardShell>
  );
}
