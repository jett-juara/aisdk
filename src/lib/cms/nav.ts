import type { NavigationItem } from '@/lib/setting/types'
import { CMS_PAGE_CONFIG, type CmsPageSlug } from './config'

export function buildCmsNavItems(activePath: string): NavigationItem[] {
  const items: NavigationItem[] = [
    {
      id: 'cms-overview',
      label: 'Overview',
      href: '/cms',
      icon: 'layout-dashboard',
      isActive: activePath === '/cms',
    },
  ]

  const pageIconMap: Record<CmsPageSlug, string> = {
    about: 'book-open',
    product: 'package',
    services: 'wrench',
    collaboration: 'handshake',
  }

  ;(Object.keys(CMS_PAGE_CONFIG) as CmsPageSlug[]).forEach((page: CmsPageSlug) => {
    const label = CMS_PAGE_CONFIG[page].label
    const pageActive = activePath.startsWith(`/cms/${page}`)
    const childHeroHref = `/cms/${page}/hero`
    const childDetailHref = `/cms/${page}/detail`

    items.push({
      id: `${page}-root`,
      label,
      href: childHeroHref,
      icon: pageIconMap[page] || 'layout-dashboard',
      isActive: pageActive,
      children: [
        {
          id: `${page}-hero`,
          label: 'Hero',
          href: childHeroHref,
          icon: 'image',
          isActive: activePath.startsWith(childHeroHref),
        },
        {
          id: `${page}-detail`,
          label: 'Detail',
          href: childDetailHref,
          icon: 'detail',
          isActive: activePath.startsWith(childDetailHref),
        },
      ],
    })
  })

  items.push({
    id: 'back-setting',
    label: 'Back to Setting',
    href: '/setting',
    icon: 'layout-dashboard',
    isActive: activePath.startsWith('/setting'),
    section: 'footer',
  })

  return items
}

export function normalizeCmsActivePath(pathname: string | null | undefined) {
  return pathname && pathname.startsWith('/cms') ? pathname : '/cms'
}

export { CmsPageSlug, CMS_PAGE_CONFIG }
