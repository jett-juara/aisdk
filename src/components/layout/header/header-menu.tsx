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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, ChevronDown, User2, LayoutDashboard, LogOut, Loader2, Mail } from "lucide-react";

export interface HeaderUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  role?: string;
}

// Desktop navigation menu (inline from previous desktop-menu.tsx)
const baseLinkClass =
  "font-raleway text-md uppercase tracking-wide text-50 transition-all duration-base hover:text-brand-100 focus-visible:text-brand-100 hover:underline hover:decoration-dotted hover:underline-offset-4 hover:decoration-1";

export const DesktopMenu = ({ items }: { items: HeaderMenuItem[] }) => {
  const emitAboutReset = React.useCallback((href: string) => {
    if (href === "/about" && typeof window !== "undefined") {
      window.dispatchEvent(new Event(ABOUT_RESET_EVENT));
    }
  }, []);

  return (
    <nav className="hidden items-center gap-8 lg:flex">
      <NavigationMenu viewport={false}>
        <NavigationMenuList className="gap-8">
          {items.map((item) =>
            item.children && item.children.length > 0 ? (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger
                  className={cn(
                    baseLinkClass,
                    "h-auto p-0 rounded-none bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent ring-0 focus-visible:ring-0 outline-none focus-visible:outline-0"
                  )}
                >
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="min-w-[14rem] p-3 ">
                  <div className="space-y-2">
                    {item.children.map((child) => (
                      <NavigationMenuLink
                        key={child.label}
                        asChild
                        className="cursor-pointer rounded-lg px-3 py-2 focus:text-50 transition-colors duration-base "
                      >
                        <Link href={child.href} className="flex flex-col gap-1 text-left" onClick={() => emitAboutReset(child.href)}>
                          <span className="font-rubik text-md text-50">{child.label}</span>
                          {child.description ? (
                            <span className="text-xs font-manrope uppercase tracking-wide text-400">
                              {child.description}
                            </span>
                          ) : null}
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink
                  asChild
                  className={cn(
                    baseLinkClass,
                    "p-0 rounded-none bg-transparent hover:bg-transparent focus:bg-transparent data-[active=true]:bg-transparent ring-0 focus-visible:ring-0 outline-none focus-visible:outline-0"
                  )}
                >
                  <Link href={item.href} onClick={() => emitAboutReset(item.href)}>
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

// Mobile/Tablet menu (inline from previous mobile-menu.tsx)
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
    [emitAboutReset]
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
          className="lg:hidden h-11 w-11 text-text-50 hover:text-brand-100"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="border-none bg-background-900 w-[60vw] max-w-[320px] p-0">
        <SheetTitle className="sr-only">Menu</SheetTitle>

        <nav className="flex h-full flex-col bg-background-900 text-text-50">
          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.label}>
                  {item.children && item.children.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-3 py-3 min-h-[44px] rounded-lg text-left font-raleway text-lg tracking-wide hover:bg-transparent hover:text-brand-100"
                        >
                          {item.label}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[240px] bg-background-900 border-border-900">
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.label} asChild>
                            <Link
                              href={child.href}
                              className="flex w-full items-center gap-2 px-3 py-2 min-h-[44px]"
                              onClick={() => handleNavigate(child.href)}
                            >
                              <span className="font-heading text-lg">{child.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-between px-3 py-3 min-h-[44px] rounded-lg text-left font-raleway text-lg tracking-wide hover:bg-transparent hover:text-brand-100"
                    >
                      <Link href={item.href} onClick={() => handleNavigate(item.href)}>
                        {item.label}
                      </Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Auth actions for mobile inside sheet footer */}
          <div className="border-t border-border-800 p-4">
            {!profile ? (
              <Button asChild className="w-full h-11 font-heading text-lg bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active">
                <Link href="/auth">Login</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full h-11 justify-between font-heading text-lg bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active">
                    <span className="flex items-center gap-2">
                      <User2 className="h-4 w-4" />
                      {profile.firstName}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-full bg-background-900 border-border-900">
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
                    <DropdownMenuItem asChild className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent">
                      <Link href="/dashboard" className="flex items-center gap-3 w-full px-3 py-2 min-h-[44px]" onClick={() => handleNavigate("/dashboard")}>
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="font-heading text-lg">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-border-800" />
                  <DropdownMenuItem
                    className="cursor-pointer text-text-50 focus:text-brand-100 hover:text-brand-100 hover:bg-transparent focus:bg-transparent"
                    onSelect={async (event) => {
                      event.preventDefault();
                      if (loggingOut) return;
                      await handleLogout();
                    }}
                  >
                    {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                    <span className="font-heading text-lg">{loggingOut ? "Keluar..." : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </nav>
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

export const HeaderMenu = ({ items, profile, onLogout, loggingOut, loading }: HeaderMenuProps) => {
  // Mount gate to mimic ssr: false for mobile section to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="flex items-center gap-2">
      {/* Desktop (hidden on mobile) */}
      <div className="hidden lg:flex items-center">
        <DesktopMenu items={items} />
      </div>
      {/* Mobile/Tablet (base + sm/md), hidden on desktop */}
      <div className="lg:hidden">
        {mounted ? (
          <MobileMenu items={items} profile={profile} onLogout={onLogout} loggingOut={loggingOut} loading={loading} />
        ) : (
          <div className="h-11 w-11 animate-pulse rounded-lg bg-text-50/10" />
        )}
      </div>
    </nav>
  );
};

