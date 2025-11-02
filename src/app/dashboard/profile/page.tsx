import { redirect } from 'next/navigation'
import { ProfilePanel } from '@/components/dashboard/profile/profile-panel'
import { createSupabaseRSCClient } from '@/lib/supabase/server'

type ProfileRecord = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  username: string | null
  username_changed: boolean
  status: 'active' | 'blocked' | 'deleted'
  role: 'user' | 'admin' | 'superadmin'
}

export default async function ProfilePage() {
  const supabase = await createSupabaseRSCClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, username, username_changed, status, role')
    .eq('id', user.id)
    .single<ProfileRecord>()

  if (error || !profile) {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-heading text-auth-text-primary">Profil Pengguna</h1>
        <p className="text-sm text-auth-text-muted">
          Perbarui informasi akun lo dan kelola identitas yang dipakai di semua modul JETT.
        </p>
      </div>
      <ProfilePanel
        profile={{
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name ?? '',
          lastName: profile.last_name ?? '',
          username: profile.username ?? '',
          usernameChanged: profile.username_changed,
          status: profile.status,
          role: profile.role,
        }}
      />
    </div>
  )
}
