"use client"

import { useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { ContentManagement } from "@/components/setting/content-management";
import type { CMSPageStatus } from "@/components/setting/page-status-badge";
import type { User } from "@/lib/setting/types";
import { CmsShell } from "./cms-shell";
import { buildCmsNavItems, normalizeCmsActivePath } from "@/lib/cms/nav";
import type { CmsPageSlug } from "@/lib/cms/config";

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
  initialTab: CmsPageSlug | "overview";
}

export function CmsDashboard({
  user,
  initialData,
  initialDetailData,
  initialStatuses,
  initialTab,
}: CmsDashboardProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activePath = normalizeCmsActivePath(pathname);
  const paramPage = searchParams.get("page");
  const activePage = paramPage && isPageSlug(paramPage) ? paramPage : initialTab;
  const navItems = useMemo(() => buildCmsNavItems(activePath), [activePath]);

  return (
    <CmsShell user={user} activePath={activePath}>
      <div className="flex flex-col gap-6">
        <ContentManagement
          user={user}
          initialData={initialData}
          initialDetailData={initialDetailData}
          initialStatuses={initialStatuses}
          initialTab={activePage}
          key={activePage}
        />
      </div>
    </CmsShell>
  );
}

function isPageSlug(value: string): value is CmsPageSlug | "overview" {
  return ["overview", "about", "product", "services", "collaboration"].includes(value);
}
