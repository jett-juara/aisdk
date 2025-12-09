import { notFound } from "next/navigation";
import { getCmsUserOrRedirect } from "@/app/cms/_data";
import { CmsShell } from "@/components/cms/cms-shell";
import { CMS_PAGE_CONFIG, getCmsPageLabel, isCmsPageSlug } from "@/lib/cms/config";
import { getImageGridItemById, getImageGridItems } from "@/lib/cms/cms-admin";
import { HeroForm } from "@/components/cms/hero-form";

interface HeroEditPageProps {
  params: Promise<{ page: string; id: string }>;
}

export default async function HeroEditPage({ params }: HeroEditPageProps) {
  const { page, id } = await params;
  const pageSlug = page;

  if (!isCmsPageSlug(pageSlug)) {
    return notFound();
  }

  const user = await getCmsUserOrRedirect();
  const [item, allItems] = await Promise.all([
    id === "new" ? null : getImageGridItemById(id),
    getImageGridItems(pageSlug, "hero_grid"),
  ]);

  if (id !== "new" && !item) return notFound();

  const pageLabel = getCmsPageLabel(pageSlug);
  const pageConfig = CMS_PAGE_CONFIG[pageSlug];
  const nextPosition = allItems.length + 1;

  return (
    <CmsShell user={user} activePath={`/cms/${pageSlug}/hero/edit/${id}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{id === "new" ? `Tambah Hero – ${pageLabel}` : `Edit Hero – ${pageLabel}`}</h1>
            <p className="text-sm text-text-300">Kelola konten hero grid untuk halaman {pageLabel}.</p>
            <p className="text-xs text-text-500">Max items: {pageConfig.maxItems} • Posisi default: {nextPosition}</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-background-900/80 p-4">
          <HeroForm
            pageSlug={pageSlug}
            pageLabel={pageLabel}
            section={pageConfig.section}
            item={item as any}
            nextPosition={nextPosition}
          />
        </div>
      </div>
    </CmsShell>
  );
}
