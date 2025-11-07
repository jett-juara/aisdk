"use client";

import Link from "next/link";
import { LogOut, Loader2, LayoutDashboard, ChevronDown, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface HeaderUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role?: string;
}

interface HeaderAuthActionsProps {
  profile: HeaderUserProfile | null;
  onLogout?: () => Promise<void> | void;
  loggingOut?: boolean;
  loading?: boolean;
  layout?: "desktop" | "mobile";
  className?: string;
  onNavigate?: () => void;
}

const loginButtonClasses =
  "rounded-lg px-4 py-2 font-heading text-sm font-semibold transition-colors duration-200 min-h-[44px]";

const mobileLoginClasses =
  "w-full rounded-lg bg-header-button-primary px-4 py-3 font-heading text-base font-semibold text-header-button-primary-text transition-colors duration-200 hover:bg-header-button-primary-hover active:bg-header-button-primary-active min-h-[44px]";

const mobileDashboardClasses =
  "w-full inline-flex items-center justify-center gap-3 rounded-lg border border-button-border px-4 py-3 font-heading text-base font-semibold text-header-button-primary-text transition-colors duration-200 h-12 bg-[var(--color-auth-button-brand)] hover:bg-[var(--color-auth-button-brand-hover)] active:bg-[var(--color-auth-button-brand-active)]";

const mobileUserClasses =
  "w-full flex items-center justify-between gap-3 rounded-lg border border-button-border bg-[var(--color-auth-surface-elevated)] px-4 py-3 transition-colors duration-200 hover:border-button-border hover:bg-[var(--color-auth-surface-elevated)] font-heading text-[var(--color-auth-text-primary)] h-12";

const buildDisplayName = (firstName?: string, lastName?: string) => {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  return firstName ?? lastName ?? "Guest";
};

export const HeaderAuthActions = ({
  profile,
  onLogout,
  loggingOut,
  loading,
  layout = "desktop",
  className,
  onNavigate,
}: HeaderAuthActionsProps) => {
  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-header-border/50 px-3 py-2 lg:border-0",
          layout === "mobile" ? "mt-6" : "",
          className
        )}
      >
        <div className="h-8 w-8 animate-pulse rounded-full bg-header-surface" />
        <div className="h-3 w-24 animate-pulse rounded bg-header-surface" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Button
        asChild
        variant="header-auth"
        size={layout === "mobile" ? "lg" : "md"}
        className={cn(layout === "mobile" ? "w-full py-3 text-base" : loginButtonClasses, className)}
      >
        <Link
          href="/auth"
          onClick={() => {
            onNavigate?.();
          }}
        >
          Login
        </Link>
      </Button>
    );
  }

  const displayName = buildDisplayName(profile.firstName, profile.lastName);

  if (layout === "mobile") {
    return (
      <div className={cn("mt-6 flex flex-col gap-3", className)}>
        {/* Dashboard Button - Primary Color */}
        <Button
          asChild
          variant="header-auth"
          size="lg"
          className="w-full items-center justify-start gap-3 py-3 text-base"
        >
          <Link
            href="/dashboard"
            onClick={() => {
              onNavigate?.();
            }}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>
        </Button>

        {/* User Dropdown - Secondary Color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={cn(mobileUserClasses, "pl-4 pr-3") }>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <User2 className="h-5 w-5 text-[var(--color-auth-text-primary)]" />
                <span className="truncate text-left font-heading text-base text-[var(--color-auth-text-primary)]">
                  {displayName}
                </span>
              </div>
              <ChevronDown className="h-5 w-5 text-[var(--color-auth-text-primary)] flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={-1}
            className="min-w-0 w-[var(--radix-popper-anchor-width)] border-button-border bg-[var(--color-auth-surface-elevated)] p-0 overflow-hidden rounded-lg"
          >
            <DropdownMenuItem
              className="flex h-12 cursor-pointer items-center gap-3 rounded-lg px-4 text-base font-heading text-[var(--color-auth-text-primary)] focus:bg-[var(--color-auth-dropdown-item-hover)] w-full hover:bg-[var(--color-auth-dropdown-item-hover)] transition-colors"
              onSelect={async (event) => {
                event.preventDefault();
                if (loggingOut) return;
                await onLogout?.();
                onNavigate?.();
              }}
            >
              {loggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
              <span className="text-base font-heading">{loggingOut ? "Keluar..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Layout for Tablet (768px-1024px) */}
      <div className="hidden lg:hidden mt-6 flex flex-col gap-3">
        {/* Dashboard Button - Primary Color */}
        <Button
          asChild
          variant="header-auth"
          size="lg"
          className="w-full items-center justify-start gap-3 py-3 text-base"
        >
          <Link
            href="/dashboard"
            onClick={() => {
              onNavigate?.();
            }}
          >
            <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
            <span>Dashboard</span>
          </Link>
        </Button>

        {/* User Dropdown - Secondary Color */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={cn(mobileUserClasses, "pl-4 pr-3") }>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <User2 className="h-5 w-5 text-[var(--color-auth-text-primary)]" />
                <span className="truncate text-left font-heading text-base text-[var(--color-auth-text-primary)]">
                  {displayName}
                </span>
              </div>
              <ChevronDown className="h-5 w-5 text-[var(--color-auth-text-primary)] flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={-1}
            className="min-w-0 w-[var(--radix-popper-anchor-width)] border-button-border bg-[var(--color-auth-surface-elevated)] p-0 overflow-hidden rounded-lg"
          >
            <DropdownMenuItem
              className="flex h-12 cursor-pointer items-center gap-3 rounded-lg px-4 text-base font-heading text-[var(--color-auth-text-primary)] focus:bg-[var(--color-auth-dropdown-item-hover)] w-full hover:bg-[var(--color-auth-dropdown-item-hover)] transition-colors"
              onSelect={async (event) => {
                event.preventDefault();
                if (loggingOut) return;
                await onLogout?.();
                onNavigate?.();
              }}
            >
              {loggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
              <span className="text-base font-heading">{loggingOut ? "Keluar..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Layout (>1024px) */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Dashboard Button - Only visible when user is logged in */}
        <Button
          asChild
          variant="header-auth"
          size="md"
          className="hidden items-center gap-3 lg:flex lg:w-40"
        >
          <Link href="/dashboard" className="flex items-center gap-3 w-full justify-center">
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            <span className="hidden lg:inline whitespace-nowrap">Dashboard</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="md"
              className={cn(
                "lg:w-40 justify-between font-heading px-4 overflow-hidden",
                className
              )}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <User2 className="h-4 w-4 text-header-button-secondary-text" />
                <span className="flex-1 text-left font-heading text-sm text-header-nav-text truncate">
                  {displayName}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-header-button-secondary-text flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 border-button-border bg-[#171717] p-1">
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-heading text-header-nav-text focus:bg-header-dropdown-item-hover"
              onSelect={async (event) => {
                event.preventDefault();
                if (loggingOut) return;
                await onLogout?.();
              }}
            >
              {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span>{loggingOut ? "Keluar..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
};
