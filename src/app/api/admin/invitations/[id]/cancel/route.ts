import { NextResponse } from 'next/server'
import { z } from 'zod'
import { appendDeliveryToMetadata, getSuperadminContext, recordAuditLog } from '../../utils'
import type { InvitationMetadata } from '@/lib/dashboard/invitations-types'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const paramsSchema = z.object({
  id: z.string().uuid('ID undangan nggak valid.'),
})

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const parseParams = paramsSchema.safeParse(params)
  if (!parseParams.success) {
    return NextResponse.json({ error: { message: parseParams.error.issues[0]?.message ?? 'Parameter nggak valid.' } }, { status: 400 })
  }

  const { id } = parseParams.data

  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const contextResult = await getSuperadminContext(server)
  if ('error' in contextResult) {
    return NextResponse.json({ error: { message: contextResult.error.message } }, { status: contextResult.error.status })
  }

  const { profile } = contextResult.data

  const { data: invitation, error: fetchError } = await admin
    .from('admin_invitations')
    .select('id, email, first_name, last_name, role, status, metadata, invited_user_id, expires_at, sent_at, last_sent_at, responded_at, created_at, updated_at')
    .eq('id', id)
    .maybeSingle<{
      id: string
      email: string
      first_name: string | null
      last_name: string | null
      role: 'admin' | 'superadmin' | 'user'
      status: 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled'
      metadata: InvitationMetadata | null
      invited_user_id: string | null
      expires_at: string | null
      sent_at: string | null
      last_sent_at: string | null
      responded_at: string | null
      created_at: string | null
      updated_at: string | null
    }>()

  if (fetchError || !invitation) {
    return NextResponse.json({ error: { message: 'Undangan nggak ditemukan.' } }, { status: 404 })
  }

  if (invitation.status === 'accepted') {
    return NextResponse.json({ error: { message: 'Undangan ini sudah diterima, nggak bisa dibatalkan.' } }, { status: 409 })
  }

  if (invitation.status === 'cancelled') {
    return NextResponse.json({ error: { message: 'Undangan ini sudah dibatalkan sebelumnya.' } }, { status: 409 })
  }

  const nowIso = new Date().toISOString()
  const metadata = appendDeliveryToMetadata(invitation.metadata, { provider: 'supabase_auth', sentAt: nowIso, status: 'cancelled' })

  const { data: updatedInvitation, error: updateError } = await admin
    .from('admin_invitations')
    .update({
      status: 'cancelled',
      invite_link: null,
      responded_at: nowIso,
      metadata,
    })
    .eq('id', invitation.id)
    .select(
      'id, email, first_name, last_name, role, status, inviter_id, invited_user_id, invite_link, expires_at, sent_at, last_sent_at, responded_at, created_at, updated_at, metadata'
    )
    .single()

  if (updateError || !updatedInvitation) {
    return NextResponse.json({ error: { message: updateError?.message ?? 'Gagal membatalkan undangan.' } }, { status: 400 })
  }

  if (invitation.invited_user_id) {
    await admin
      .from('users')
      .update({ invitation_token: null, invitation_expires_at: null })
      .eq('id', invitation.invited_user_id)
  }

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null
  const userAgent = request.headers.get('user-agent') ?? null

  await recordAuditLog(admin, {
    userId: profile.id,
    action: 'admin_invitation.cancelled',
    resourceType: 'admin_invitation',
    resourceId: invitation.id,
    oldValues: { status: invitation.status },
    newValues: { status: 'cancelled' },
    ipAddress,
    userAgent,
  })

  return NextResponse.json({ invitation: updatedInvitation })
}
