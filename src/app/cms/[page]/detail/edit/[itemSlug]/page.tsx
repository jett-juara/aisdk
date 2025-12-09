import { notFound } from "next/navigation";
import { getCmsUserOrRedirect } from "@/app/cms/_data";
import { CmsShell } from "@/components/cms/cms-shell";
import { CMS_DETAIL_CONFIG, getCmsPageLabel, isCmsPageSlug } from "@/lib/cms/config";
import { getDetailBlock } from "@/lib/cms/cms-admin";
import { DetailForm } from "@/components/cms/detail-form";

interface DetailEditPageProps {
  params: Promise<{ page: string; itemSlug: string }>;
}

export default async function DetailEditPage({ params }: DetailEditPageProps) {
  const { page, itemSlug } = await params;
  if (!isCmsPageSlug(page)) return notFound();

  const user = await getCmsUserOrRedirect();
  const configEntry = CMS_DETAIL_CONFIG[page].find((c) => c.itemSlug === itemSlug);
  if (!configEntry) return notFound();

  const block = await getDetailBlock(page, itemSlug);
  const pageLabel = getCmsPageLabel(page);

  return (
    <CmsShell user={user} activePath={`/cms/${page}/detail/edit/${itemSlug}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Detail – {pageLabel}</h1>
            <p className="text-sm text-text-300">Kelola konten detail untuk {configEntry.label}.</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-background-900/80 p-4">
          <DetailForm
            pageSlug={page}
            pageLabel={pageLabel}
            itemSlug={itemSlug}
            position={configEntry.position}
            existing={
              block
                ? {
                  id: block.id,
                  title: block.title,
                  paragraphs: block.paragraphs,
                  imageUrl: block.image_url,
                  altText: block.alt_text,
                  status: block.status,
                }
                : undefined
            }
          />
        </div>
      </div>
    </CmsShell>
  );
}
