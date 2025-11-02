'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import type { DashboardNavSection, DashboardRole } from '@/lib/dashboard/navigation'
import { cn } from '@/lib/utils'

type HeaderProps = {
  sections: DashboardNavSection[]
  role: DashboardRole
}

export function DashboardHeader({ sections, role }: HeaderProps) {
  const pathname = usePathname()

  const navTitleMap = useMemo(() => {
    const map = new Map<string, string>()
    sections.forEach((section) => {
      section.items.forEach((item) => {
        map.set(item.href, item.title)
      })
    })
    map.set('/dashboard', navLabel(map, '/dashboard'))
    return map
  }, [sections])

  const crumbs = useMemo(() => {
    if (pathname === '/dashboard') {
      return [{ href: '/dashboard', label: navLabel(navTitleMap, '/dashboard') }]
    }

    const segments = pathname.replace(/^\/dashboard/, '').split('/').filter(Boolean)
    const items = [{ href: '/dashboard', label: navLabel(navTitleMap, '/dashboard') }]

    let currentHref = '/dashboard'
    segments.forEach((segment) => {
      currentHref = `${currentHref}/${segment}`
      items.push({ href: currentHref, label: navLabel(navTitleMap, currentHref) })
    })

    return items
  }, [pathname, navTitleMap])

  return (
    <header className="flex items-center justify-between border-b border-auth-border dashboard-bg-main px-6 py-4">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-xs text-auth-text-muted">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1
            return (
              <li key={crumb.href} className="flex items-center gap-2">
                {isLast ? (
                  <span className="font-medium text-auth-text-primary">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="transition-colors duration-fast hover:text-auth-text-primary"
                  >
                    {crumb.label}
                  </Link>
                )}
                {!isLast ? <span className="text-auth-text-muted">/</span> : null}
              </li>
            )
          })}
        </ol>
      </nav>
      <div className="flex items-center gap-2">
        <span className="text-xxs uppercase tracking-wide text-auth-text-muted">Role</span>
        <span
          className={cn(
            'rounded-full bg-auth-button-secondary/20 px-3 py-1 text-xxs font-semibold uppercase tracking-wide',
            'text-auth-text-primary'
          )}
        >
          {role}
        </span>
      </div>
    </header>
  )
}

function navLabel(map: Map<string, string>, href: string): string {
  return map.get(href) ?? (href === '/dashboard' ? 'Dashboard' : href.split('/').pop() ?? 'Halaman')
}
