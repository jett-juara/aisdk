import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { DashboardRouteGuard } from '@/components/dashboard/route-guard'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardSidebarHeader } from '@/components/dashboard/sidebar-header'
import {
  deriveAccessibleNavigation,
  type DashboardPermission,
  type DashboardRole,
} from '@/lib/dashboard/navigation'
import { createSupabaseRSCClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

type DashboardLayoutProps = {
  children: ReactNode
}

type DashboardProfile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  username: string | null
  role: DashboardRole
  status: 'active' | 'blocked' | 'deleted'
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createSupabaseRSCClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, username, role, status')
    .eq('id', user.id)
    .single<DashboardProfile>()

  if (error || !profile) {
    redirect('/auth/login?status=missing-profile')
  }

  if (profile.status === 'blocked') {
    redirect('/auth/login?status=blocked')
  }

  if (profile.status === 'deleted') {
    redirect('/auth/login?status=deleted')
  }

  const { data: permissionRows } = await supabase
    .from('user_permissions')
    .select('page_key, feature_key, access_granted')
    .eq('user_id', profile.id)

  const permissions = (permissionRows ?? []) as DashboardPermission[]
  const { sections, allowedPaths } = deriveAccessibleNavigation(profile.role, permissions)
  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() ||
    profile.username ||
    profile.email

  const fallbackPath = allowedPaths.includes('/dashboard') ? '/dashboard' : allowedPaths[0] ?? '/dashboard'

  return (
    <div className="min-h-screen bg-background-900 text-text-50">
      <DashboardRouteGuard allowedPaths={allowedPaths} fallbackPath={fallbackPath} />
      <SidebarProvider>
        <DashboardSidebar
          sections={sections}
          user={{
            name: displayName,
            email: profile.email,
            role: profile.role,
            status: profile.status,
          }}
        />
        <SidebarInset className="bg-background-900">
          <DashboardSidebarHeader sections={sections} role={profile.role} />
          <main className="flex-1 bg-background-900 px-6 py-8 text-text-50">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
