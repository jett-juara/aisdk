export type CmsPageSlug = 'about' | 'product' | 'services' | 'collaboration'

export const CMS_PAGE_CONFIG: Record<CmsPageSlug, { label: string; maxItems: number; section: string }> = {
  about: { label: 'About', maxItems: 4, section: 'hero_grid' },
  product: { label: 'Product', maxItems: 6, section: 'hero_grid' },
  services: { label: 'Services', maxItems: 4, section: 'hero_grid' },
  collaboration: { label: 'Collaboration', maxItems: 2, section: 'hero_grid' },
}

export const CMS_DETAIL_CONFIG: Record<CmsPageSlug, { pageSlug: CmsPageSlug; itemSlug: string; label: string; position: number }[]> = {
  about: [
    { pageSlug: 'about', itemSlug: 'event', label: 'Event', position: 1 },
    { pageSlug: 'about', itemSlug: 'community', label: 'Community', position: 2 },
    { pageSlug: 'about', itemSlug: 'tech', label: 'Tech', position: 3 },
    { pageSlug: 'about', itemSlug: 'analytic', label: 'Analytics', position: 4 },
  ],
  product: [
    { pageSlug: 'product', itemSlug: 'audience-flow-management', label: 'Audience Flow', position: 1 },
    { pageSlug: 'product', itemSlug: 'creative-agency', label: 'Creative Agency', position: 2 },
    { pageSlug: 'product', itemSlug: 'event-activation', label: 'Event Activation', position: 3 },
    { pageSlug: 'product', itemSlug: 'mice-event', label: 'MICE Event', position: 4 },
    { pageSlug: 'product', itemSlug: 'music-concert-management', label: 'Music Concert', position: 5 },
    { pageSlug: 'product', itemSlug: 'sport-event-management', label: 'Sport Event', position: 6 },
  ],
  services: [
    { pageSlug: 'services', itemSlug: 'creative-and-plan-development', label: 'Creative & Plan', position: 1 },
    { pageSlug: 'services', itemSlug: 'execution-handling', label: 'Execution Handling', position: 2 },
    { pageSlug: 'services', itemSlug: 'talent-and-logistic-management', label: 'Talent & Logistic', position: 3 },
    { pageSlug: 'services', itemSlug: 'local-authority-liaison', label: 'Local Authority Liaison', position: 4 },
  ],
  collaboration: [
    { pageSlug: 'collaboration', itemSlug: 'partnership-guide', label: 'Partnership Guide', position: 1 },
    { pageSlug: 'collaboration', itemSlug: 'chat-jett', label: 'Chat JETT', position: 2 },
  ],
}

export function isCmsPageSlug(value: string | undefined): value is CmsPageSlug {
  return value === 'about' || value === 'product' || value === 'services' || value === 'collaboration'
}

export function getCmsPageLabel(slug: CmsPageSlug | string) {
  if (isCmsPageSlug(slug)) return CMS_PAGE_CONFIG[slug].label
  return slug.charAt(0).toUpperCase() + slug.slice(1)
}

export const CMS_HERO_ASPECT_RATIOS: Record<CmsPageSlug, Record<number, { ratio: number; label: string }> | undefined> = {
  about: {
    1: { ratio: 1, label: 'Square (1:1)' },
    2: { ratio: 0.5, label: 'Portrait (1:2)' },
    3: { ratio: 1, label: 'Square (1:1)' },
    4: { ratio: 2, label: 'Landscape (2:1)' },
  },
  product: {
    1: { ratio: 1, label: 'Square (1:1)' },
    2: { ratio: 1, label: 'Square (1:1)' },
    3: { ratio: 1, label: 'Square (1:1)' },
    4: { ratio: 1, label: 'Square (1:1)' },
    5: { ratio: 1, label: 'Square (1:1)' },
    6: { ratio: 1, label: 'Square (1:1)' },
  },
  services: {
    1: { ratio: 1, label: 'Square (1:1)' },
    2: { ratio: 0.5, label: 'Portrait (1:2)' },
    3: { ratio: 1, label: 'Square (1:1)' },
    4: { ratio: 2, label: 'Landscape (2:1)' },
  },
  collaboration: {
    1: { ratio: 0.6, label: 'Portrait (3:5)' },
    2: { ratio: 0.6, label: 'Portrait (3:5)' },
  },
}
