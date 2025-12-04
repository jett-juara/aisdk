"use client"

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SettingShell } from '@/components/setting/setting-shell'
import type { User } from '@/lib/setting/types'
import { buildCmsNavItems } from '@/lib/cms/nav'
import { logoutAction } from '@/lib/supabase/actions'

interface CmsShellProps {
  user: User
  activePath: string
  children: React.ReactNode
}

export function CmsShell({ user, activePath, children }: CmsShellProps) {
  const router = useRouter()

  const navItems = useMemo(() => buildCmsNavItems(activePath), [activePath])

  const handleNavigate = (href: string) => {
    if (href === '/setting') return
    router.push(href)
  }

  const handleLogout = async () => {
    try {
      await logoutAction()
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/auth'
    }
  }

  return (
    <SettingShell
      user={user}
      navigationItemsOverride={navItems}
      activePathOverride={activePath}
      onNavigateOverride={handleNavigate}
      onLogout={handleLogout}
    >
      {children}
    </SettingShell>
  )
}
