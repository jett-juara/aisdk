"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { HeaderMenuItem } from "./config";
import { cn } from "@/lib/utils";
import { ABOUT_RESET_EVENT } from "@/lib/constants/events";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  PanelLeftOpen,
  PanelLeftClose,
  ChevronDown,
  LogOut,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// Desktop layout now handled in header.tsx; this module renders only mobile/tablet

export interface HeaderUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role?: string;
}

// Desktop navigation menu (inline from previous desktop-menu.tsx)
const baseLinkClass =
  "font-heading text-sm uppercase tracking-wide text-50 transition-all duration-base hover:text-brand-100 focus-visible:text-brand-100 hover:underline hover:decoration-dotted hover:underline-offset-4 hover:decoration-1";

export const DesktopMenu = ({ items }: { items: HeaderMenuItem[] }) => {
  const emitAboutReset = React.useCallback((href: string) => {
    if (href === "/about" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(ABOUT_RESET_EVENT));
    }
  }, []);

  return (
    <nav className="hidden lg:flex items-center">
      <NavigationMenu viewport={false}>
        <NavigationMenuList className="gap-8">
          {items.map((item) => (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuLink
                asChild
                className={cn(
                  baseLinkClass,
                  "p-0 mt-6 rounded-none bg-transparent hover:bg-transparent focus:bg-transparent data-[active=true]:bg-transparent ring-0 focus-visible:ring-0 outline-none focus-visible:outline-0",
                )}
              >
                <Link
                  href={item.href}
                  onClick={() => emitAboutReset(item.href)}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

// Mobile/Tablet menu
export const MobileMenu = ({
  items,
  profile,
  onLogout,
  loggingOut,
  loading,
}: {
  items: HeaderMenuItem[];
  profile: HeaderUserProfile | null;
  onLogout?: () => Promise<void> | void;
  loggingOut?: boolean;
  loading?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const emitAboutReset = useCallback((href: string) => {
    if (href === "/about" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(ABOUT_RESET_EVENT));
    }
  }, []);

  const handleNavigate = useCallback(
    (href?: string) => {
      if (href) emitAboutReset(href);
      setOpen(false);
    },
    [emitAboutReset],
  );

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
          className="lg:hidden h-11 w-11 md:h-20 md:px-4 text-text-50 hover:bg-transparent hover:text-brand-100"
        >
          <PanelLeftOpen
            className="h-8 w-8 md:h-10 md:w-10 text-text-100"
            strokeWidth={1.5}
          />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-none bg-background-900 w-[74vw] max-w-[340px] p-0"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="px-4 pt-2 pb-1">
            <SheetClose asChild>
              <button
                aria-label="Tutup menu"
                className="grid h-11 w-11 md:h-20 place-items-center text-text-50 hover:text-brand-100"
              >
                <PanelLeftClose
                  className="h-8 w-8 md:h-10 md:w-10 text-text-100"
                  strokeWidth={1.5}
                />
              </button>
            </SheetClose>
          </div>

          <nav className="flex-1 flex flex-col bg-background-900 text-text-50 min-h-0">
            <div className="flex-1 overflow-y-auto pt-6 px-2 pb-5 min-h-0">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.label}>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-between px-3 py-3 min-h-[44px]  md:min-h-[60px] text-left text-lg md:text-2xl font-manrope font-thin uppercase tracking-wide text-400 hover:bg-transparent hover:text-brand-100"
                    >
                      <Link
                        href={item.href}
                        onClick={() => handleNavigate(item.href)}
                      >
                        {item.label}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Auth actions for mobile inside sheet footer */}
            <div className="border-t border-border-800 px-4 py-3">
              {!profile ? (
                <Button
                  asChild
                  className="w-full font-button font-medium text-lg md:text-2xl bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide rounded-lg transition-all duration-500 ease-out h-10 md:h-12 mb-4 mt-4"
                >
                  <Link href="/auth">Login</Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="group w-full h-11 justify-between font-button font-medium text-lg md:text-2xl bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active md:min-h-[60px]">
                      <span className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 md:h-8 md:w-8">
                          <AvatarFallback className="text-text-50 font-bold bg-brand-50">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-user-icon lucide-user h-4 w-4 md:h-5 md:w-5 text-[var(--color-button-primary)]"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </AvatarFallback>
                        </Avatar>
                        {profile.firstName}
                      </span>
                      <ChevronDown className="h-5 w-5 md:h-6 md:w-6 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-[var(--radix-dropdown-menu-trigger-width)] bg-background-900 border-border-900 p-0"
                  >
                    <DropdownMenuSeparator className="bg-border-800" />
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent"
                    >
                      <button
                        className="flex items-center gap-3 w-full px-3 py-2 min-h-[44px] md:min-h-[60px] text-left"
                        onClick={async (event) => {
                          event.preventDefault();
                          if (loggingOut) return;
                          await handleLogout();
                        }}
                      >
                        {loggingOut ? (
                          <Loader2 className="h-5 w-5 animate-spin md:h-6 md:w-6" />
                        ) : (
                          <LogOut className="h-5 w-5 md:h-6 md:w-6" />
                        )}
                        <span className="font-button font-medium text-lg md:text-2xl">
                          {loggingOut ? "Keluar..." : "Logout"}
                        </span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface HeaderMenuProps {
  items: HeaderMenuItem[];
  profile: HeaderUserProfile | null;
  onLogout?: () => Promise<void> | void;
  loggingOut?: boolean;
  loading?: boolean;
}

export const HeaderMenu = ({
  items,
  profile,
  onLogout,
  loggingOut,
  loading,
}: HeaderMenuProps) => {
  // Mount gate to mimic ssr: false for mobile section to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Desktop only: sinkronkan lebar tombol user dengan lebar dropdown saat terbuka
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [expandedWidth, setExpandedWidth] = useState<number | null>(null);

  useEffect(() => {
    let raf: number;
    if (!menuOpen) {
      raf = requestAnimationFrame(() => {
        setExpandedWidth(null);
      });
    } else {
      // Pastikan content sudah ter-render sebelum mengukur
      raf = requestAnimationFrame(() => {
        const width = contentRef.current?.offsetWidth;
        if (width && width > 0) {
          setExpandedWidth(width);
        }
      });
    }
    return () => cancelAnimationFrame(raf);
  }, [menuOpen]);

  return (
    <nav className="flex items-center gap-2 w-full">
      {/* Desktop: center main menu, auth at right */}
      <div className="hidden lg:flex items-center w-full relative">
        {/* Full-width overlay to center menu against entire page width */}
        <div className="pointer-events-none fixed left-0 right-0 top-0 h-16 z-[1] flex items-center justify-center">
          <div className="pointer-events-auto flex items-center">
            <DesktopMenu items={items} />
          </div>
        </div>
        <div className="ml-auto flex items-center mt-3">
          {loading ? (
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-background-800" />
              <div className="h-3 w-24 animate-pulse rounded bg-background-800" />
            </div>
          ) : profile ? (
            <DropdownMenu onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  ref={triggerRef}
                  style={
                    expandedWidth ? { width: `${expandedWidth}px` } : undefined
                  }
                  className="group h-11 font-button font-medium text-sm px-4 overflow-hidden transition-all duration-200 font-semibold tracking-wide bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active border-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-text-50 font-bold bg-brand-50">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-user-icon lucide-user h-5 w-5 text-[var(--color-button-primary)]"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-text-50 truncate max-w-[10rem]">
                      {profile.firstName}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-text-50 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                ref={contentRef}
                align="end"
                className="w-auto border-border-900 bg-background-900 p-0"
              >
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent flex items-center gap-3 w-full px-3 py-2 min-h-[44px]"
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 w-full"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-button font-medium text-sm">
                      Dashboard
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border-800" />
                <DropdownMenuItem
                  className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent flex items-center gap-3 w-full px-3 py-2 min-h-[44px]"
                  onSelect={async (event) => {
                    event.preventDefault();
                    if (loggingOut) return;
                    await onLogout?.();
                  }}
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  <span className="font-button font-medium text-sm">
                    {loggingOut ? "Keluar..." : "Logout"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className="font-button font-medium text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10"
            >
              <Link href="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile/Tablet (base + sm/md), hidden on desktop */}
      <div className="lg:hidden ml-auto">
        {mounted ? (
          <MobileMenu
            items={items}
            profile={profile}
            onLogout={onLogout}
            loggingOut={loggingOut}
            loading={loading}
          />
        ) : (
          <div className="h-11 w-11 animate-pulse rounded-lg bg-text-50/10" />
        )}
      </div>
    </nav>
  );
};
