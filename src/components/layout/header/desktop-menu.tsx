"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React from "react";

import type { HeaderMenuItem } from "./config";

// Dynamic import untuk mengatasi hydration warning
import {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuTrigger as DropdownMenuTriggerPrimitive,
  DropdownMenuContent as DropdownMenuContentPrimitive,
  DropdownMenuItem as DropdownMenuItemPrimitive
} from "@/components/ui/dropdown-menu";

const DropdownMenu = dynamic(() => Promise.resolve(DropdownMenuPrimitive), {
  ssr: false,
});

const DropdownMenuContent = dynamic(() => Promise.resolve(DropdownMenuContentPrimitive), {
  ssr: false,
});

const DropdownMenuItem = dynamic(() => Promise.resolve(DropdownMenuItemPrimitive), {
  ssr: false,
});

const DropdownMenuTrigger = dynamic(() => Promise.resolve(DropdownMenuTriggerPrimitive), {
  ssr: false,
});

interface DesktopMenuProps {
  items: HeaderMenuItem[];
}

const baseLinkClass =
  "font-body text-sm uppercase tracking-[0.12em] text-auth-text-primary transition-colors duration-200 hover:text-[color:var(--color-auth-button-brand)]";

export const DesktopMenu = ({ items }: DesktopMenuProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {items.map((item) =>
        item.children && item.children.length > 0 ? (
          mounted ? (
            <DropdownMenu key={item.label}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    baseLinkClass,
                    "flex items-center gap-1 focus-visible:outline-none focus-visible:text-[color:var(--color-auth-button-brand)]"
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                sideOffset={12}
                className="min-w-[14rem] space-y-1 border-auth-border bg-background/95 p-2 backdrop-blur"
              >
                {item.children.map((child) => (
                  <DropdownMenuItem
                    key={child.label}
                    asChild
                    className="cursor-pointer rounded-md px-3 py-2 focus:bg-[color:var(--color-auth-surface-elevated)] focus:text-auth-text-primary"
                  >
                    <Link href={child.href} className="flex flex-col gap-1 text-left">
                      <span className="font-heading text-sm text-auth-text-primary">{child.label}</span>
                      {child.description ? (
                        <span className="text-xs font-body uppercase tracking-[0.08em] text-auth-text-muted">
                          {child.description}
                        </span>
                      ) : null}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        ) : (
          <Link key={item.label} href={item.href} className={baseLinkClass}>
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
};