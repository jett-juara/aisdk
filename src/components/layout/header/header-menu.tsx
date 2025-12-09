"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Settings,
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
  "font-button text-sm uppercase tracking-wide text-navigation-menu transition-all duration-300 hover:text-premium-gradient focus-visible:text-white hover:scale-105 transform-gpu hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4";

export const DesktopMenu = ({ items }: { items: HeaderMenuItem[] }) => {
  const pathname = usePathname();
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
                  pathname && item.href !== "#" && pathname.startsWith(item.href)
                    ? "text-navigation-active underline decoration-dotted decoration-navigation-active underline-offset-4"
                    : ""
                )}
              >
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.href === "#") {
                      e.preventDefault()
                      return
                    }
                    emitAboutReset(item.href)
                  }}
                  className="text-sm"
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
  const pathname = usePathname();

  // Width sync logic dari setting header untuk konsistensi behavior
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userTriggerRef = useRef<HTMLButtonElement>(null);
  const userContentRef = useRef<HTMLDivElement>(null);
  const [userBaseWidth, setUserBaseWidth] = useState<number | null>(null);
  const [userSyncedWidth, setUserSyncedWidth] = useState<number | null>(null);
  const [userMounted, setUserMounted] = useState(false);

  // Mount gate untuk mencegah hydration mismatch
  useEffect(() => {
    const raf = requestAnimationFrame(() => setUserMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Hitung lebar dasar tombol setelah mount (saat dropdown tertutup)
  useEffect(() => {
    if (!userMounted) return;
    const raf = requestAnimationFrame(() => {
      const width = userTriggerRef.current?.offsetWidth ?? 0;
      if (width > 0) {
        setUserBaseWidth((prev) => prev ?? width);
        setUserSyncedWidth((prev) => prev ?? width);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [userMounted]);

  // Saat menu dibuka/ditutup, sinkronkan lebar tombol dan konten (desktop behavior)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (userMenuOpen) {
        // Menu dibuka: expand ke lebar maksimum (desktop pattern)
        const triggerWidth = userTriggerRef.current?.offsetWidth ?? 0;
        const contentWidth = userContentRef.current?.offsetWidth ?? 0;
        const base = userBaseWidth ?? triggerWidth;
        const width = Math.max(base, triggerWidth, contentWidth);
        if (width > 0) {
          setUserSyncedWidth(width);
        }
      } else {
        // Menu ditutup: kembali ke ukuran dasar
        setUserSyncedWidth(userBaseWidth);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [userMenuOpen, userBaseWidth]);

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
          className="lg:hidden h-10 w-10 md:h-20 md:px-4 text-text-50 hover:bg-transparent hover:text-brand-100"
        >
          <PanelLeftClose
            className="h-8 w-8 md:h-10 md:w-10 text-text-100"
            strokeWidth={1}
          />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-l border-glass-border bg-background-deep/95 backdrop-blur-xl w-[74vw] max-w-[340px] p-0 shadow-2xl"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center px-4">
            <SheetClose asChild>
              <button
                aria-label="Tutup menu"
                className="grid h-11 w-11 place-items-center text-text-50 hover:text-brand-100"
              >
                <PanelLeftOpen
                  className="h-8 w-8 md:h-10 md:w-10 text-text-100"
                  strokeWidth={1}
                />
              </button>
            </SheetClose>
          </div>

          <nav className="flex-1 flex flex-col bg-transparent text-text-50 min-h-0 relative">
            {/* Noise Overlay for Mobile Menu */}
            <div className="absolute inset-0 bg-noise-overlay z-0 pointer-events-none" />
            <div className="flex-1 overflow-y-auto pt-0 px-2 pb-5 min-h-0 relative z-10">
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.label}>
                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        "w-full justify-between px-3 py-3 min-h-[44px] md:min-h-[60px] text-left text-md md:text-xl font-button font-thin uppercase tracking-wide text-navigation-menu hover:bg-hover-overlay-700 hover:text-text-50 focus:bg-hover-overlay-700 focus:text-text-50 hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4",
                        pathname && item.href !== "#" && pathname.startsWith(item.href)
                          ? "text-navigation-active underline decoration-dotted decoration-navigation-active underline-offset-4"
                          : ""
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          if (item.href === "#") {
                            e.preventDefault()
                            setOpen(false)
                            return
                          }
                          handleNavigate(item.href)
                        }}
                      >
                        {item.label}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Auth actions for mobile inside sheet footer */}
            <div className="px-4 py-3">
              {!profile ? (
                <Button
                  asChild
                  className="w-full font-button font-medium text-md md:text-xl bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide rounded-full transition-all duration-500 ease-out mb-4 min-h-[44px] md:min-h-[60px] hover:scale-105"
                >
                  <Link href="/auth">Login</Link>
                </Button>
              ) : (
                <DropdownMenu onOpenChange={setUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      ref={userTriggerRef}
                      style={userSyncedWidth ? { width: `${userSyncedWidth}px` } : undefined}
                      className="group w-full min-h-[44px] md:min-h-[60px] justify-between font-button font-medium text-md md:text-xl bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active mb-4 overflow-hidden transition-all duration-200 rounded-full"
                    >
                      <span className="flex items-center gap-2 min-w-0">
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
                        <span className="text-md md:text-xl text-text-50">
                          {profile.firstName}
                        </span>
                      </span>
                      <ChevronDown className="h-5 w-5 md:h-6 md:w-6 text-text-50 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    ref={userContentRef}
                    align="end"
                    style={userSyncedWidth ? { width: `${userSyncedWidth}px` } : undefined}
                    className="w-auto border-glass-border bg-background-900/95 backdrop-blur-xl p-2 rounded-xl"
                  >
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer text-text-50 hover:bg-glass-bg hover:text-text-50 focus:bg-glass-bg focus:text-text-50 rounded-lg"
                    >
                      <Link
                        href="/setting"
                        className={cn(
                          "flex items-center gap-3 w-full px-4 py-2 min-h-[44px] md:min-h-[60px] text-left hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4",
                          pathname === "/setting"
                            ? "text-navigation-active underline decoration-dotted decoration-navigation-active underline-offset-4"
                            : ""
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <Settings className="h-6 w-6 md:h-8 md:w-8" />
                        <span className="font-button font-medium text-md md:text-xl">
                          Setting
                        </span>
                      </Link>
                    </DropdownMenuItem>
                    {(profile?.role === "admin" ||
                      profile?.role === "superadmin") && (
                        <DropdownMenuItem
                          asChild
                          className="cursor-pointer text-text-50 hover:bg-glass-bg hover:text-text-50 focus:bg-glass-bg focus:text-text-50 rounded-lg"
                        >
                          <Link
                            href="/cms"
                            className={cn(
                              "flex items-center gap-3 w-full px-4 py-2 min-h-[44px] md:min-h-[60px] text-left hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4",
                              pathname && pathname.startsWith("/cms")
                                ? "text-navigation-active underline decoration-dotted decoration-navigation-active underline-offset-4"
                                : ""
                            )}
                            onClick={() => setOpen(false)}
                          >
                            <LayoutDashboard className="h-6 w-6 md:h-8 md:w-8" />
                            <span className="font-button font-medium text-md md:text-xl">
                              CMS
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuItem
                      asChild
                      className="min-h-[44px] cursor-pointer text-text-50 hover:bg-glass-bg hover:text-text-50 focus:bg-glass-bg focus:text-text-50 rounded-lg"
                    >
                      <button
                        className="flex items-center gap-3 w-full px-4 py-2 text-left hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4"
                        onClick={async (event) => {
                          event.preventDefault();
                          if (loggingOut) return;
                          await handleLogout();
                        }}
                      >
                        {loggingOut ? (
                          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin" />
                        ) : (
                          <LogOut className="h-6 w-6 md:h-8 md:w-8" />
                        )}
                        <span className="font-button font-medium text-md md:text-xl">
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
  const pathname = usePathname();
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
      {/* Desktop: hanya area profil di sisi kanan, navigasi utama di-handle di Header */}
      <div className="hidden lg:flex items-center w-full">
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
                  className="group justify-between font-button font-medium px-0 has-[>svg]:px-0 overflow-hidden transition-all duration-500 ease-premium font-semibold tracking-wide bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active border-none h-11 text-sm rounded-full"
                >
                  <div className="flex items-center gap-3 min-w-0 pl-4">
                    <Avatar className="h-6 w-6">
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
                          className="lucide lucide-user-icon lucide-user h-6 w-6 text-[var(--color-button-primary)]"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-button font-medium text-text-50 truncate max-w-[10rem] text-sm">
                      {profile.firstName}
                    </span>
                  </div>
                  <ChevronDown className="mr-4 h-4 w-4 text-text-50 flex-shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                ref={contentRef}
                align="end"
                className="w-auto border-glass-border bg-background-900/95 backdrop-blur-xl p-2 rounded-xl"
              >
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-glass-bg focus:bg-glass-bg flex items-center gap-3 w-full px-4 py-2 min-h-[44px] rounded-lg"
                >
                  <Link
                    href="/setting"
                    className={cn(
                      "flex items-center gap-3 w-full hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4",
                      pathname === "/setting"
                        ? "text-navigation-active underline decoration-dotted decoration-navigation-active underline-offset-4"
                        : ""
                    )}
                  >
                    <Settings className="h-6 w-6" />
                    <span className={cn(
                      "font-button font-medium text-sm text-text-50",
                      pathname === "/setting" ? "text-navigation-active" : ""
                    )}>
                      Setting
                    </span>
                  </Link>
                </DropdownMenuItem>
                {(profile?.role === "admin" ||
                  profile?.role === "superadmin") && (
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-glass-bg focus:bg-glass-bg flex items-center gap-3 w-full px-4 py-2 min-h-[44px] rounded-lg"
                    >
                      <Link
                        href="/cms"
                        className={cn(
                          "flex items-center gap-3 w-full hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4",
                          pathname && pathname.startsWith("/cms")
                            ? "text-navigation-active underline decoration-dotted decoration-navigation-active underline-offset-4"
                            : ""
                        )}
                      >
                        <LayoutDashboard className="h-6 w-6" />
                        <span
                          className={cn(
                            "font-button font-medium text-sm text-text-50",
                            pathname && pathname.startsWith("/cms")
                              ? "text-navigation-active"
                              : ""
                          )}
                        >
                          CMS
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                <DropdownMenuItem
                  className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-glass-bg focus:bg-glass-bg flex items-center gap-3 w-full px-4 py-2 min-h-[44px] hover:underline hover:decoration-dotted hover:decoration-text-50 hover:underline-offset-4 rounded-lg"
                  onSelect={async (event) => {
                    event.preventDefault();
                    if (loggingOut) return;
                    await onLogout?.();
                  }}
                >
                  {loggingOut ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <LogOut className="h-6 w-6" />
                  )}
                  <span className="font-button font-medium text-sm text-text-50">
                    {loggingOut ? "Keluar..." : "Logout"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className="font-button font-medium bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-premium h-11 text-sm rounded-full hover:scale-105 px-8"
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
