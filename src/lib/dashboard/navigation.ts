export type DashboardRole = 'user' | 'admin' | 'superadmin'

export type DashboardPermission = {
  page_key: string | null
  feature_key: string | null
  access_granted: boolean
}

export type DashboardIconKey =
  | 'layout-dashboard'
  | 'settings'
  | 'users'
  | 'permissions'
  | 'invitations'
  | 'analytics'

export type DashboardNavItem = {
  title: string
  description?: string
  href: string
  icon: DashboardIconKey
  pageKey?: string
  featureKey?: string
  roles?: DashboardRole[]
}

export type DashboardNavSection = {
  title: string
  items: DashboardNavItem[]
}

export const DASHBOARD_NAV_SECTIONS: DashboardNavSection[] = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Ringkasan',
        description: 'Status singkat operasi dan event aktif.',
        href: '/dashboard',
        icon: 'layout-dashboard',
        pageKey: 'dashboard',
      },
      {
        title: 'Profil',
        description: 'Kelola informasi akun lo sendiri.',
        href: '/dashboard/profile',
        icon: 'settings',
        pageKey: 'profile',
      },
    ],
  },
  {
    title: 'Manajemen',
    items: [
      {
        title: 'Pengguna',
        description: 'Kelola akun admin dan user.',
        href: '/dashboard/users',
        icon: 'users',
        pageKey: 'users',
        featureKey: 'manage-users',
        roles: ['admin', 'superadmin'],
      },
      {
        title: 'Izin Akses',
        description: 'Atur modul dan fitur yang bisa dipakai tiap user.',
        href: '/dashboard/permissions',
        icon: 'permissions',
        pageKey: 'permissions',
        featureKey: 'manage-permissions',
        roles: ['admin', 'superadmin'],
      },
      {
        title: 'Undangan Admin',
        description: 'Kelola undangan admin baru dan pantau statusnya.',
        href: '/dashboard/invitations',
        icon: 'invitations',
        pageKey: 'invitations',
        featureKey: 'manage-invitations',
        roles: ['superadmin'],
      },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      {
        title: 'Analitik',
        description: 'Pantau performa sistem dan metrik event.',
        href: '/dashboard/analytics',
        icon: 'analytics',
        pageKey: 'analytics',
        featureKey: 'analytics-view',
        roles: ['admin', 'superadmin'],
      },
    ],
  },
]

function matchPermission(
  permission: DashboardPermission,
  item: DashboardNavItem
): boolean {
  if (!permission.access_granted) return false
  const derivedHref = item.href.replace('/dashboard/', '')
  const pageKey = item.pageKey ?? (derivedHref.length > 0 ? derivedHref : 'dashboard')
  const featureKey = item.featureKey ?? pageKey

  return (
    permission.feature_key === featureKey ||
    permission.page_key === pageKey ||
    permission.page_key === item.href
  )
}

export function deriveAccessibleNavigation(
  role: DashboardRole,
  permissions: DashboardPermission[]
): {
  sections: DashboardNavSection[]
  allowedPaths: string[]
} {
  const hasAdminPrivilege = role === 'admin' || role === 'superadmin'

  const sections = DASHBOARD_NAV_SECTIONS.map((section) => {
    const items = section.items.filter((item) => {
      if (item.roles && !item.roles.includes(role)) return false
      if (hasAdminPrivilege) return true
      if (!item.featureKey && !item.pageKey && !item.roles) return true
      return permissions.some((permission) => matchPermission(permission, item))
    })

    return { ...section, items }
  }).filter((section) => section.items.length > 0)

  const allowedPaths = new Set<string>()

  sections.forEach((section) => {
    section.items.forEach((item) => {
      allowedPaths.add(item.href)
      if (item.href !== '/dashboard') {
        allowedPaths.add('/dashboard')
      }
    })
  })

  if (!allowedPaths.size) {
    allowedPaths.add('/dashboard')
  }

  return {
    sections,
    allowedPaths: Array.from(allowedPaths),
  }
}
