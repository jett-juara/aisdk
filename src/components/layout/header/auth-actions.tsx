"use client";

import Link from "next/link";
import { LogOut, Loader2 } from "lucide-react";

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
  "rounded-lg bg-[color:var(--color-auth-button-brand)] px-4 py-2 font-heading text-sm font-semibold text-auth-text-primary transition-colors duration-200 hover:bg-[color:var(--color-auth-button-brand-hover)] min-h-[44px]";

const mobileLoginClasses =
  "w-full rounded-lg bg-[color:var(--color-auth-button-brand)] px-4 py-3 font-heading text-base font-semibold text-auth-text-primary transition-colors duration-200 hover:bg-[color:var(--color-auth-button-brand-hover)] min-h-[44px]";

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
          "flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2",
          layout === "mobile" ? "mt-6" : "",
          className
        )}
      >
        <div className="h-8 w-8 animate-pulse rounded-full bg-[color:var(--color-auth-surface-elevated)]" />
        <div className="h-3 w-24 animate-pulse rounded bg-[color:var(--color-auth-surface-elevated)]" />
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
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-3">
          <Avatar className="h-10 w-10 border border-border/40 bg-[color:var(--color-auth-surface-elevated)]">
            <AvatarFallback className="bg-[color:var(--color-auth-button-brand)] text-sm font-heading text-auth-text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-heading text-sm text-auth-text-primary">{displayName}</span>
            <span className="text-xs font-body uppercase tracking-[0.1em] text-auth-text-muted">
              {roleLabel ?? profile.email}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-center gap-2 rounded-lg border border-border/50 px-4 py-3 font-heading text-sm text-auth-text-primary hover:bg-[color:var(--color-auth-surface-elevated)] min-h-[44px]"
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-[44px] items-center gap-3 rounded-lg border border-border/40 bg-background/80 px-3 py-2 transition-colors duration-200 hover:border-[color:var(--color-auth-button-brand)] focus-visible:outline-none",
            className
          )}
        >
          <Avatar className="h-9 w-9 border border-border/40 bg-[color:var(--color-auth-surface-elevated)]">
            <AvatarFallback className="bg-[color:var(--color-auth-button-brand)] text-sm font-heading text-auth-text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-heading text-sm text-auth-text-primary">{displayName}</span>
            <span className="text-xs font-body uppercase tracking-[0.12em] text-auth-text-muted">
              {roleLabel ?? profile.email}
            </span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 border-auth-border bg-background/95 p-2 backdrop-blur">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="font-heading text-sm text-auth-text-primary">{displayName}</span>
            <span className="text-xs font-body uppercase tracking-[0.08em] text-auth-text-muted">
              {profile.email}
            </span>
            {roleLabel ? (
              <span className="text-[10px] font-body uppercase tracking-[0.2em] text-auth-text-muted/80">
                {roleLabel}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 text-auth-text-primary focus:bg-[color:var(--color-auth-surface-elevated)]"
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
  );
};
