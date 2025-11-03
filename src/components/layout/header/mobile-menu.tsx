"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import type { HeaderMenuItem } from "./config";
import { HeaderAuthActions, type HeaderUserProfile } from "./auth-actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

interface MobileMenuProps {
  items: HeaderMenuItem[];
  profile: HeaderUserProfile | null;
  onLogout?: () => Promise<void> | void;
  loggingOut?: boolean;
  loading?: boolean;
}

export const MobileMenu = ({ items, profile, onLogout, loggingOut, loading }: MobileMenuProps) => {
  const [open, setOpen] = useState(false);

  const handleNavigate = useCallback(() => {
    setOpen(false);
  }, []);

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
          className="md:hidden h-11 w-11 text-header-nav-text hover:text-header-nav-text"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-none bg-header-dropdown-bg w-[80vw] max-w-md data-[state=open]:animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-right-8 data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-6"
      >
        {/* A11y: Dialog requires a Title (visually hidden) */}
        <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
        
        
        <nav className="flex flex-col gap-3 py-6">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="inline-flex min-h-[44px] justify-start rounded-lg px-3 text-base font-body uppercase tracking-[0.16em] text-header-nav-text transition-colors duration-200 hover:text-header-nav-text-hover hover:underline hover:decoration-dotted hover:underline-offset-4 hover:decoration-1"
                asChild
              >
                <Link href={item.href} onClick={handleNavigate}>
                  {item.label}
                </Link>
              </Button>
              {item.children && item.children.length > 0 ? (
                <div className="ml-3 flex flex-col gap-1 border-l border-header-border/40 pl-4">
                  {item.children.map((child) => (
                    <Button
                      key={child.label}
                      variant="ghost"
                      className="inline-flex min-h-[44px] justify-start rounded-md px-3 text-sm font-body uppercase tracking-[0.12em] text-header-nav-text-muted transition-colors duration-200 hover:text-header-nav-text"
                      asChild
                    >
                      <Link href={child.href} onClick={handleNavigate}>
                        {child.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <HeaderAuthActions
          profile={profile}
          loggingOut={loggingOut}
          loading={loading}
          layout="mobile"
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      </SheetContent>
    </Sheet>
  );
};
