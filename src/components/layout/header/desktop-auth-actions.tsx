"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Loader2, LayoutDashboard, ChevronDown, User2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface HeaderUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role?: string;
}

interface DesktopAuthActionsProps {
  profile: HeaderUserProfile | null;
  onLogout?: () => Promise<void> | void;
  loggingOut?: boolean;
  loading?: boolean;
  className?: string;
}

const buildDisplayName = (firstName?: string, lastName?: string) => {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  return firstName ?? lastName ?? "Guest";
};

export const DesktopAuthActions = ({
  profile,
  onLogout,
  loggingOut,
  loading,
  className,
}: DesktopAuthActionsProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-3 px-3 py-2", className)}>
        <div className="h-8 w-8 animate-pulse rounded-full bg-background-800" />
        <div className="h-3 w-24 animate-pulse rounded bg-background-800" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Button
        asChild
        className={cn(
          "font-heading text-lg bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide px-6 rounded-lg transition-all duration-500 ease-out",
          "px-4 py-2 h-10 text-lg",
          className
        )}
      >
        <Link href="/auth">Login</Link>
      </Button>
    );
  }

  const displayName = buildDisplayName(profile.firstName, profile.lastName);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <DropdownMenu onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn(
              "group font-heading text-lg justify-between px-4 h-10 overflow-hidden transition-all duration-200 font-semibold tracking-wide rounded-lg",
              isDropdownOpen ? "lg:w-56" : "lg:w-40",
              "bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active border-none"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User2 className="h-4 w-4 text-text-50" />
              <span className="flex-1 text-left font-heading text-lg text-text-50 truncate">
                {displayName}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-text-50 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-border-900 bg-background-900">
          <DropdownMenuLabel className="font-normal text-text-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-button-primary">
                <Mail className="h-5 w-5 text-text-50" />
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-text-50 text-lg leading-none">{profile.email}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border-800" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent"
              asChild
            >
              <Link href="/dashboard" className="flex items-center gap-3 w-full px-3 py-2 min-h-[44px] group">
                <LayoutDashboard className="h-4 w-4 text-text-50 group-hover:text-brand-100" />
                <span className="font-heading text-lg">Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-border-800" />

          <DropdownMenuItem
            className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent group"
            onSelect={async (event) => {
              event.preventDefault();
              if (loggingOut) return;
              await onLogout?.();
            }}
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin text-text-50 group-hover:text-brand-100" />
            ) : (
              <LogOut className="h-4 w-4 text-text-50 group-hover:text-brand-100" />
            )}
            <span className="font-heading text-lg">{loggingOut ? "Keluar..." : "Logout"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

