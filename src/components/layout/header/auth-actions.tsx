"use client";

import Link from "next/link";
import { LogOut, Loader2, LayoutDashboard, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  "rounded-lg bg-header-button-primary px-4 py-2 font-heading text-sm font-semibold text-header-button-primary-text transition-colors duration-200 hover:bg-header-button-primary-hover active:bg-header-button-primary-active min-h-[44px]";

const mobileLoginClasses =
  "w-full rounded-lg bg-header-button-primary px-4 py-3 font-heading text-base font-semibold text-header-button-primary-text transition-colors duration-200 hover:bg-header-button-primary-hover active:bg-header-button-primary-active min-h-[44px]";

const buildInitials = (firstName?: string, lastName?: string) => {
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  if (initials) return initials.toUpperCase();
  return firstName?.slice(0, 2).toUpperCase() ?? "JT";
};

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
          "flex items-center gap-3 rounded-lg border border-header-border/50 px-3 py-2",
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
        className={cn(layout === "mobile" ? mobileLoginClasses : loginButtonClasses, className)}
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
  const initials = buildInitials(profile.firstName, profile.lastName);
  const roleLabel = profile.role ? profile.role.toUpperCase() : undefined;

  if (layout === "mobile") {
    return (
      <div className={cn("mt-6 flex flex-col gap-3", className)}>
        <div className="flex items-center gap-3 rounded-xl border border-header-border/60 bg-header-button-secondary px-3 py-3">
          <Avatar className="h-9 w-9 border border-header-border/40 bg-header-surface">
            <AvatarFallback className="bg-header-avatar-bg text-sm font-heading text-header-button-primary-text">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center">
            <span className="font-heading text-sm text-header-nav-text">{displayName}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-center gap-2 rounded-lg border border-header-border/50 px-4 py-3 font-heading text-sm text-header-button-secondary-text hover:bg-header-surface min-h-[44px]"
          onClick={async () => {
            if (loggingOut) return;
            await onLogout?.();
          }}
          disabled={loggingOut}
        >
          {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          <span>{loggingOut ? "Keluar..." : "Logout"}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Dashboard Button - Only visible when user is logged in */}
      <Button
        asChild
        className="hidden min-h-[48px] items-center gap-3 rounded-lg border border-transparent bg-header-button-primary px-3 py-2 text-sm font-heading text-header-button-primary-text transition-colors duration-200 hover:bg-header-button-primary-hover active:bg-header-button-primary-active md:flex w-auto lg:w-40"
      >
        <Link href="/dashboard" className="flex items-center gap-3 w-full justify-center">
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          <span className="hidden lg:inline whitespace-nowrap">Dashboard</span>
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn(
              "flex min-h-[48px] items-center gap-3 rounded-lg border border-header-border bg-header-button-secondary px-3 py-2 transition-colors duration-200 hover:border-header-button-primary hover:bg-header-button-secondary-hover focus-visible:outline-none w-auto lg:w-40 justify-between font-heading text-header-button-secondary-text",
              className
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8 border border-header-border/40 bg-header-surface flex-shrink-0">
                <AvatarFallback className="bg-header-avatar-bg text-xs font-heading text-header-button-primary-text">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start justify-center min-w-0">
                <span className="font-heading text-sm text-header-nav-text truncate">{displayName}</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-header-button-secondary-text flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 border-header-dropdown-border bg-header-dropdown-bg p-1">
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
  );
};
