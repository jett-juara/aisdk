"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Menu, ChevronDown, User2, LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import type { HeaderMenuItem } from "./config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ABOUT_RESET_EVENT } from "@/lib/constants/events";

interface HeaderUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role?: string;
}

interface MobileMenuProps {
  items: HeaderMenuItem[];
  profile: HeaderUserProfile | null;
  onLogout?: () => Promise<void> | void;
  loggingOut?: boolean;
  loading?: boolean;
}

export const MobileMenu = ({ items, profile, onLogout, loggingOut, loading }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);

  const emitAboutReset = useCallback((href: string) => {
    if (href === "/about" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(ABOUT_RESET_EVENT));
    }
  }, []);

  const handleNavigate = useCallback((href?: string) => {
    if (href) {
      emitAboutReset(href);
    }
    setOpen(false);
  }, [emitAboutReset]);

  const handleLogout = useCallback(async () => {
    if (!onLogout) return;
    await onLogout();
    setOpen(false);
  }, [onLogout]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Buka menu navigasi"
          className="lg:hidden h-11 w-11 text-text-50 hover:text-brand-100"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-none bg-background-900 w-[60vw] max-w-md data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-right-8 data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-6"
      >
        {/* A11y: Dialog requires a Title (visually hidden) */}
        <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
        
        
        <nav className="flex flex-col gap-3 py-6">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="inline-flex min-h-[44px] justify-start px-3 text-xl md:text-xl  font-raleway uppercase tracking-wide text-50 transition-colors duration-200 hover:text-brand-100 focus-visible:text-brand-100 hover:underline hover:decoration-dotted hover:underline-offset-4 hover:decoration-1 hover:bg-transparent focus:bg-transparent rounded-none ring-0 focus-visible:ring-0 outline-none focus-visible:outline-0"
                asChild
              >
                <Link href={item.href} onClick={() => handleNavigate(item.href)}>
                  {item.label}
                </Link>
              </Button>
              {item.children && item.children.length > 0 ? (
                <div className="ml-3 flex flex-col gap-1 border-l border-border-800/40 pl-4">
                  {item.children.map((child) => (
                    <Button
                      key={child.label}
                      variant="ghost"
                      className="inline-flex min-h-[40px] justify-start px-3 text-md font-rubik uppercase tracking-wide text-50 transition-colors duration-200 hover:text-brand-100 hover:bg-transparent focus:bg-transparent rounded-none ring-0 focus-visible:ring-0 outline-none focus-visible:outline-0"
                      asChild
                    >
                      <Link href={child.href} onClick={() => handleNavigate(child.href)}>
                        {child.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        {/* Auth actions for mobile + tablet */}
        {loading ? (
          <div className="mt-6 flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-background-800" />
            <div className="h-3 w-24 animate-pulse rounded bg-background-800" />
          </div>
        ) : !profile ? (
          <Button
            asChild
            className="font-heading w-full justify-center h-12 text-xl bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide rounded-lg transition-all duration-500 ease-out mt-6"
          >
            <Link href="/auth" onClick={() => handleNavigate("/auth")}>Login</Link>
          </Button>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="group font-heading w-full justify-between pl-4 pr-3 h-12 text-xl md:text-xl bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide rounded-lg transition-all duration-500 ease-out">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <User2 className="h-5 w-5 md:h-6 md:w-6 text-text-50" />
                    <span className="truncate text-left font-heading text-xl md:text-xl text-text-50">
                      {profile.firstName} {profile.lastName ?? ""}
                    </span>
                  </div>
                  <ChevronDown className="h-5 w-5 md:h-6 md:w-6 text-text-50 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={-1}
                className="min-w-0 w-[var(--radix-popper-anchor-width)] border-border-800 bg-background-800 p-1 overflow-hidden rounded-lg"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem className="group cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent" asChild>
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 min-h-[44px] w-full" onClick={() => handleNavigate("/dashboard")}>
                      <LayoutDashboard className="h-4 w-4 md:h-6 md:w-6 text-text-50 group-hover:text-brand-100" />
                      <span className="font-heading text-xl md:text-xl">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border-800" />
                <DropdownMenuItem
                  className="group cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent px-3 py-2 min-h-[44px] gap-3 w-full"
                  onSelect={async (event) => {
                    event.preventDefault();
                    if (loggingOut) return;
                    await handleLogout();
                  }}
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 md:h-6 md:w-6 animate-spin text-text-50 group-hover:text-brand-100" />
                  ) : (
                    <LogOut className="h-4 w-4 md:h-6 md:w-6 text-text-50 group-hover:text-brand-100" />
                  )}
                  <span className="font-heading text-xl md:text-xl">{loggingOut ? "Keluar..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
