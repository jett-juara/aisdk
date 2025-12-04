import { CmsDashboard } from "@/components/cms/cms-dashboard";
import { getCmsUserOrRedirect } from "./_data";
import { getImageGridItems, getPageStatus, getDetailBlocksAdmin } from "@/lib/cms/cms-admin";
import type { CmsPageSlug } from "@/lib/cms/config";

const PAGE_ORDER = ["overview", "about", "product", "services", "collaboration"] as const;
type PageSlug = typeof PAGE_ORDER[number];

export default async function CmsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCmsUserOrRedirect();

  const resolvedSearchParams = await searchParams;

  const requested = Array.isArray(resolvedSearchParams.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams.page;
  const initialTab = isPageSlug(requested) ? requested : "overview";

  const [
    aboutItems,
    productItems,
    servicesItems,
    collaborationItems,
    aboutStatus,
    productStatus,
    servicesStatus,
    collaborationStatus,
    aboutDetails,
    productDetails,
    servicesDetails,
    collaborationDetails,
  ] =
    await Promise.all([
      getImageGridItems("about", "hero_grid"),
      getImageGridItems("product", "hero_grid"),
      getImageGridItems("services", "hero_grid"),
      getImageGridItems("collaboration", "hero_grid"),
      getPageStatus("about"),
      getPageStatus("product"),
      getPageStatus("services"),
      getPageStatus("collaboration"),
      getDetailBlocksAdmin("about"),
      getDetailBlocksAdmin("product"),
      getDetailBlocksAdmin("services"),
      getDetailBlocksAdmin("collaboration"),
    ]);

  return (
    <CmsDashboard
      user={user}
      initialData={{
        about: aboutItems,
        product: productItems,
        services: servicesItems,
        collaboration: collaborationItems,
      }}
      initialDetailData={{
        about: aboutDetails,
        product: productDetails,
        services: servicesDetails,
        collaboration: collaborationDetails,
      }}
      initialStatuses={{
        about: aboutStatus || "draft",
        product: productStatus || "draft",
        services: servicesStatus || "draft",
        collaboration: collaborationStatus || "draft",
      }}
      initialTab={initialTab}
    />
  );
}

function isPageSlug(value: string | undefined): value is CmsPageSlug | "overview" {
  if (!value) return false;
  return (PAGE_ORDER as readonly string[]).includes(value);
}
