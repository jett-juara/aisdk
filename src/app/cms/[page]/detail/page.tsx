import { notFound } from "next/navigation";
import { getCmsUserOrRedirect } from "../../_data";
import { CmsShell } from "@/components/cms/cms-shell";
import { CMS_DETAIL_CONFIG, getCmsPageLabel, isCmsPageSlug } from "@/lib/cms/config";
import { getDetailBlocksAdmin } from "@/lib/cms/cms-admin";
import { DetailSectionEditor } from "@/components/cms/detail-section-editor";

interface CmsDetailPageProps {
  params: Promise<{ page: string }>;
}

export default async function CmsDetailPage({ params }: CmsDetailPageProps) {
  const { page } = await params;
  const pageSlug = page;
  if (!isCmsPageSlug(pageSlug)) return notFound();

  const user = await getCmsUserOrRedirect();
  const details = await getDetailBlocksAdmin(pageSlug);
  const pageLabel = getCmsPageLabel(pageSlug);
  const config = CMS_DETAIL_CONFIG[pageSlug];

  return (
    <CmsShell user={user} activePath={`/cms/${pageSlug}/detail`}>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{pageLabel} Detail</h1>
          <p className="text-sm text-text-300">Kelola konten detail untuk halaman {pageLabel}.</p>
        </div>
        <DetailSectionEditor
          pageSlug={pageSlug}
          label={pageLabel}
          items={details}
          config={config}
        />
      </div>
    </CmsShell>
  );
}
