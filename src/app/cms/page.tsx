import { CmsDashboard } from "@/components/cms/cms-dashboard";
import { getCmsUserOrRedirect } from "./_data";
import { getImageGridItems, getPageStatus } from "@/lib/cms/cms-admin";

const PAGE_ORDER = ["about", "product", "services", "collaboration"] as const;
type PageSlug = typeof PAGE_ORDER[number];

export default async function CmsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCmsUserOrRedirect();

  const requested = Array.isArray(searchParams.page)
    ? searchParams.page[0]
    : searchParams.page;
  const initialTab = isPageSlug(requested) ? requested : "about";

  const [aboutItems, productItems, servicesItems, collaborationItems, aboutStatus, productStatus, servicesStatus, collaborationStatus] =
    await Promise.all([
      getImageGridItems("about", "hero_grid"),
      getImageGridItems("product", "hero_grid"),
      getImageGridItems("services", "hero_grid"),
      getImageGridItems("collaboration", "hero_grid"),
      getPageStatus("about"),
      getPageStatus("product"),
      getPageStatus("services"),
      getPageStatus("collaboration"),
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

function isPageSlug(value: string | undefined): value is PageSlug {
  if (!value) return false;
  return (PAGE_ORDER as readonly string[]).includes(value);
}
