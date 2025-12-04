"use client"

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SettingShell } from "@/components/setting/setting-shell";
import { ContentManagement } from "@/components/setting/content-management";
import type { CMSPageStatus } from "@/components/setting/page-status-badge";
import type { User, NavigationItem } from "@/lib/setting/types";

type PageSlug = "about" | "product" | "services" | "collaboration";

interface CmsDashboardProps {
  user: User;
  initialData: {
    about: any[];
    product: any[];
    services: any[];
    collaboration: any[];
  };
  initialDetailData: {
    about: any[];
    product: any[];
    services: any[];
    collaboration: any[];
  };
  initialStatuses: {
    about: CMSPageStatus;
    product: CMSPageStatus;
    services: CMSPageStatus;
    collaboration: CMSPageStatus;
  };
  initialTab: PageSlug;
}

const CMS_NAV: { id: PageSlug; label: string }[] = [
  { id: "about", label: "About" },
  { id: "product", label: "Product" },
  { id: "services", label: "Services" },
  { id: "collaboration", label: "Collaboration" },
];

export function CmsDashboard({
  user,
  initialData,
  initialDetailData,
  initialStatuses,
  initialTab,
}: CmsDashboardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramPage = searchParams.get("page");
  const activePage = paramPage && isPageSlug(paramPage) ? paramPage : initialTab;

  const pageNav: NavigationItem[] = useMemo(
    () =>
      CMS_NAV.map((item) => ({
        id: item.id,
        label: item.label,
        href: `/cms?page=${item.id}`,
        icon: "layout-dashboard",
        isActive: activePage === item.id,
      })),
    [activePage],
  );

  const navItems: NavigationItem[] = useMemo(
    () => [
      ...pageNav,
      {
        id: "back-setting",
        label: "Back to Setting",
        href: "/setting",
        icon: "layout-dashboard",
        isActive: false,
      },
    ],
    [pageNav],
  );

  const handleNavigate = (href: string) => {
    if (href === "/setting") return;
    const url = new URL(href, window.location.origin);
    const page = url.searchParams.get("page");
    if (page && isPageSlug(page)) {
      router.push(`/cms?page=${page}`);
    }
  };

  return (
    <SettingShell
      user={user}
      navigationItemsOverride={navItems}
      activePathOverride="/cms"
      onNavigateOverride={handleNavigate}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="text-sm text-text-200">
              <Link href="/setting" className="underline hover:text-text-50">
                Setting
              </Link>{" "}
              / CMS
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
            <p className="text-text-200">
              Kelola konten About, Product, Services, dan Collaboration dari satu tempat.
            </p>
          </div>
        </div>

        <ContentManagement
          user={user}
          initialData={initialData}
          initialDetailData={initialDetailData}
          initialStatuses={initialStatuses}
          initialTab={activePage}
          key={activePage}
        />
      </div>
    </SettingShell>
  );
}

function isPageSlug(value: string): value is PageSlug {
  return ["about", "product", "services", "collaboration"].includes(value);
}
