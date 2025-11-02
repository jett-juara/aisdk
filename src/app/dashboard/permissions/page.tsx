import { redirect } from 'next/navigation'
import {
  PERMISSION_DEFINITIONS,
  PERMISSION_TEMPLATES,
  type PermissionDefinition,
  type PermissionTemplate,
} from '@/lib/dashboard/permissions'
import { createSupabaseRSCClient } from '@/lib/supabase/server'
import { PermissionManagementPanel } from '@/components/dashboard/permissions/permission-management-panel'

type DashboardUserSummary = {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: 'user' | 'admin' | 'superadmin'
}

export default async function PermissionsPage() {
  const supabase = await createSupabaseRSCClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: actorProfile } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!actorProfile || (actorProfile.role !== 'admin' && actorProfile.role !== 'superadmin')) {
    redirect('/dashboard')
  }

  const { data: users } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, username, role')
    .order('created_at', { ascending: true })

  return (
    <PermissionManagementPanel
      currentUserId={actorProfile.id}
      currentUserRole={actorProfile.role}
      users={(users ?? []).map(mapUser)}
      templates={PERMISSION_TEMPLATES}
      definitions={PERMISSION_DEFINITIONS}
    />
  )
}

function mapUser(row: any): DashboardUserSummary {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name ?? '',
    lastName: row.last_name ?? '',
    username: row.username ?? '',
    role: row.role,
  }
}

export type { DashboardUserSummary, PermissionDefinition, PermissionTemplate }
