/**
 * Setting Client Component
 * Client-side wrapper untuk SettingShell dengan logout functionality
 */

"use client";

import React from "react";
import { SettingShell } from "./setting-shell";
import { SettingOverview } from "./content/overview";
import {
  SettingProfile,
  SettingUsers,
  SettingPermissions,
  SettingSystem,
  SettingInvitations,
  SettingAudit,
  SettingSecurity,
} from "./content/sections";
import { User } from "@/lib/setting/types";
import { logoutAction } from "@/lib/supabase/actions";

type SettingView =
  | "overview"
  | "profile"
  | "users"
  | "permissions"
  | "system"
  | "invitations"
  | "audit"
  | "security";

interface SettingClientProps {
  user: User;
  view?: SettingView;
}

/**
 * Setting Client Component dengan client-side logout handling
 */
export function SettingClient({ user, view = "overview" }: SettingClientProps) {
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
      content = <SettingProfile user={user} />;
      break;
    case "users":
      content = <SettingUsers user={user} />;
      break;
    case "permissions":
      content = <SettingPermissions user={user} />;
      break;
    case "system":
      content = <SettingSystem user={user} />;
      break;
    case "invitations":
      content = <SettingInvitations user={user} />;
      break;
    case "audit":
      content = <SettingAudit user={user} />;
      break;
    case "security":
      content = <SettingSecurity user={user} />;
      break;
    case "overview":
    default:
      content = <SettingOverview user={user} />;
      break;
  }

  return (
    <SettingShell
      user={user}
      onLogout={handleLogout}
    >
      {content}
    </SettingShell>
  );
}
