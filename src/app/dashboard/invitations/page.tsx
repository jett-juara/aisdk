import { redirect } from 'next/navigation'
import { InvitationManagementPanel } from '@/components/dashboard/invitations/invitation-management-panel'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseRSCClient } from '@/lib/supabase/server'

export default async function InvitationsPage() {
  const supabase = await createSupabaseRSCClient()
  const admin = createSupabaseAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'superadmin') {
    redirect('/dashboard')
  }

  const { data: invitations } = await admin
    .from('admin_invitations')
    .select(
      'id, email, first_name, last_name, role, status, inviter_id, invited_user_id, invite_link, expires_at, sent_at, last_sent_at, responded_at, created_at, updated_at'
    )
    .order('created_at', { ascending: false })

  return (
    <InvitationManagementPanel
      currentUserId={profile.id}
      invitations={invitations ?? []}
    />
  )
}
