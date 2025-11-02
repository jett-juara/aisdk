import { redirect } from 'next/navigation'
import { UserManagementTable } from '@/components/dashboard/users/user-management-table'
import { createSupabaseRSCClient } from '@/lib/supabase/server'

export default async function UsersPage() {
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
    .select('id, email, first_name, last_name, username, role, status, deleted_at, created_at, updated_at')
    .order('created_at', { ascending: true })

  return (
    <UserManagementTable
      currentUserId={actorProfile.id}
      currentUserRole={actorProfile.role}
      initialUsers={(users ?? []).map((row) => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name ?? '',
        lastName: row.last_name ?? '',
        username: row.username ?? '',
        role: row.role,
        status: row.status,
        deletedAt: row.deleted_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))}
    />
  )
}
