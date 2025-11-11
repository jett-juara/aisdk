"use client";

import Link from "next/link";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { HeaderMenuItem } from "./config";
import { cn } from "@/lib/utils";
import { ABOUT_RESET_EVENT } from "@/lib/constants/events";

interface DesktopMenuProps {
  items: HeaderMenuItem[];
}

const baseLinkClass =
  "font-raleway text-xl uppercase tracking-wide text-50 transition-all duration-[var(--transition-base)] hover:text-brand-100 focus-visible:text-brand-100 hover:underline hover:decoration-dotted hover:underline-offset-4 hover:decoration-1";

export const DesktopMenu = ({ items }: DesktopMenuProps) => {
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
                    // Hilangkan hover box/rounded: transparan, tanpa padding/ring/outline
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
                        className="cursor-pointer rounded-lg px-3 py-2 focus:text-50 transition-colors duration-[var(--transition-base)] "
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
                    // Hilangkan hover box/rounded pada item level-atas
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
