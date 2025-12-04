import { notFound } from "next/navigation";
import { getCmsUserOrRedirect } from "../../_data";
import { CmsShell } from "@/components/cms/cms-shell";
import { ImageGridEditor } from "@/components/setting/image-grid-editor";
import { PageStatusBadge } from "@/components/setting/page-status-badge";
import { CMS_PAGE_CONFIG, getCmsPageLabel, isCmsPageSlug } from "@/lib/cms/config";
import { getImageGridItems, getPageStatus } from "@/lib/cms/cms-admin";

interface CmsHeroPageProps {
  params: Promise<{ page: string }>;
}

export default async function CmsHeroPage({ params }: CmsHeroPageProps) {
  const { page } = await params;
  const pageSlug = page;
  if (!isCmsPageSlug(pageSlug)) {
    return notFound();
  }

  const user = await getCmsUserOrRedirect();
  const [items, status] = await Promise.all([
    getImageGridItems(pageSlug, "hero_grid"),
    getPageStatus(pageSlug),
  ]);

  const pageConfig = CMS_PAGE_CONFIG[pageSlug];
  const pageLabel = getCmsPageLabel(pageSlug);

  return (
    <CmsShell user={user} activePath={`/cms/${pageSlug}/hero`}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{pageLabel} Hero</h1>
            <p className="text-sm text-text-300">Kelola grid hero untuk halaman {pageLabel}.</p>
          </div>
          <PageStatusBadge status={status || "draft"} />
        </div>
        <ImageGridEditor
          pageSlug={pageSlug}
          section={pageConfig.section}
          initialItems={items}
          maxItems={pageConfig.maxItems}
        />
      </div>
    </CmsShell>
  );
}
