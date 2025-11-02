import { NextResponse } from 'next/server'
import { appendDeliveryToMetadata, recordAuditLog } from '../utils'
import type { InvitationMetadata } from '@/lib/dashboard/invitations-types'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const {
    data: { user },
  } = await server.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { message: 'Lo harus login dulu.' } }, { status: 401 })
  }

  const { data: invitation } = await admin
    .from('admin_invitations')
    .select('id, role, status, metadata, invited_user_id, email')
    .eq('invited_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{
      id: string
      role: 'admin' | 'superadmin' | 'user'
      status: 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled'
      metadata: InvitationMetadata | null
      invited_user_id: string | null
      email: string
    }>()

  if (!invitation) {
    const { data: byEmail } = await admin
      .from('admin_invitations')
      .select('id, role, status, metadata, invited_user_id, email')
      .eq('email', user.email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<{
        id: string
        role: 'admin' | 'superadmin' | 'user'
        status: 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled'
        metadata: InvitationMetadata | null
        invited_user_id: string | null
        email: string
      }>()
    if (!byEmail) {
      return NextResponse.json({ success: true })
    }
    await finalizeInvitation(admin, byEmail, user.id, request)
    return NextResponse.json({ success: true })
  }

  if (invitation.status === 'accepted') {
    return NextResponse.json({ success: true })
  }

  await finalizeInvitation(admin, invitation, user.id, request)
  return NextResponse.json({ success: true })
}

async function finalizeInvitation(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  invitation: {
    id: string
    role: 'admin' | 'superadmin' | 'user'
    status: 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled'
    metadata: InvitationMetadata | null
    invited_user_id: string | null
    email: string
  },
  userId: string,
  request: Request
) {
  const now = new Date().toISOString()
  const updatedMetadata = appendDeliveryToMetadata(invitation.metadata, { provider: 'supabase_auth', sentAt: now, status: 'accepted' })

  await admin
    .from('admin_invitations')
    .update({ status: 'accepted', invited_user_id: userId, responded_at: now, metadata: updatedMetadata })
    .eq('id', invitation.id)

  await admin
    .from('users')
    .update({ role: invitation.role, invitation_token: null, invitation_expires_at: null })
    .eq('id', userId)

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null
  const userAgent = request.headers.get('user-agent') ?? null

  await recordAuditLog(admin, {
    userId,
    action: 'admin_invitation.accepted',
    resourceType: 'admin_invitation',
    resourceId: invitation.id,
    oldValues: { status: invitation.status },
    newValues: { status: 'accepted' },
    ipAddress,
    userAgent,
  })
}
