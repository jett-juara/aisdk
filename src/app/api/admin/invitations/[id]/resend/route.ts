import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  appendDeliveryToMetadata,
  buildDisplayName,
  buildInvitationMetadata,
  extractInviteToken,
  getSuperadminContext,
  recordAuditLog,
} from '../../utils'
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
    .select('id, email, first_name, last_name, role, status, metadata, inviter_id, invited_user_id, sent_at, responded_at, expires_at, created_at, updated_at, last_sent_at')
    .eq('id', id)
    .maybeSingle<{
      id: string
      email: string
      first_name: string | null
      last_name: string | null
      role: 'admin' | 'superadmin' | 'user'
      status: 'pending' | 'sent' | 'accepted' | 'expired' | 'cancelled'
      metadata: InvitationMetadata | null
      inviter_id: string | null
      invited_user_id: string | null
      sent_at: string | null
      responded_at: string | null
      expires_at: string | null
      created_at: string | null
      updated_at: string | null
      last_sent_at: string | null
    }>()

  if (fetchError || !invitation) {
    return NextResponse.json({ error: { message: 'Undangan nggak ditemukan.' } }, { status: 404 })
  }

  if (invitation.status === 'accepted') {
    return NextResponse.json({ error: { message: 'Undangan ini sudah diterima, nggak bisa dikirim ulang.' } }, { status: 409 })
  }

  if (invitation.status === 'cancelled') {
    return NextResponse.json({ error: { message: 'Undangan ini sudah dibatalkan jadi nggak bisa dikirim ulang.' } }, { status: 409 })
  }

  const expiresInDays = invitation.metadata?.expiresInDays ?? 7
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?invited=true`
  const inviteResponse = await admin.auth.admin.inviteUserByEmail(invitation.email, {
    redirectTo,
    data: {
      firstName: invitation.first_name ?? '',
      lastName: invitation.last_name ?? '',
      role: invitation.role,
      inviterId: profile.id,
      inviterEmail: profile.email,
    },
  })

  if (inviteResponse.error) {
    return NextResponse.json({ error: { message: inviteResponse.error.message } }, { status: 400 })
  }

  const inviteLink = (inviteResponse.data as any)?.action_link ?? null
  const inviteToken = extractInviteToken(inviteLink)
  const nowIso = new Date().toISOString()

  if (invitation.invited_user_id || inviteToken) {
    await admin.from('users').upsert(
      {
        id: invitation.invited_user_id ?? undefined,
        email: invitation.email,
        first_name: invitation.first_name ?? undefined,
        last_name: invitation.last_name ?? undefined,
        role: invitation.role,
        invitation_token: inviteToken,
        invitation_expires_at: expiresAt.toISOString(),
      },
      { onConflict: 'email' }
    )
  }

  const inviterName = buildDisplayName(profile.first_name, profile.last_name, profile.email)
  const baseMetadata = buildInvitationMetadata({
    firstName: invitation.first_name ?? '',
    lastName: invitation.last_name ?? '',
    email: invitation.email,
    inviter: { id: profile.id, name: inviterName, email: profile.email },
    expiresInDays,
    sentAt: nowIso,
  })

  const metadata = appendDeliveryToMetadata(invitation.metadata, { provider: 'supabase_auth', sentAt: nowIso, status: 'sent' }, {
    subject: baseMetadata.subject,
    previewText: baseMetadata.previewText,
    expiresInDays: baseMetadata.expiresInDays,
    inviter: baseMetadata.inviter,
  })

  const { data: updatedInvitation, error: updateError } = await admin
    .from('admin_invitations')
    .update({
      status: 'sent',
      invite_link: inviteLink,
      expires_at: expiresAt.toISOString(),
      last_sent_at: nowIso,
      metadata,
    })
    .eq('id', invitation.id)
    .select(
      'id, email, first_name, last_name, role, status, inviter_id, invited_user_id, invite_link, expires_at, sent_at, last_sent_at, responded_at, created_at, updated_at, metadata'
    )
    .single()

  if (updateError || !updatedInvitation) {
    return NextResponse.json({ error: { message: updateError?.message ?? 'Gagal update undangan.' } }, { status: 400 })
  }

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null
  const userAgent = request.headers.get('user-agent') ?? null

  await recordAuditLog(admin, {
    userId: profile.id,
    action: 'admin_invitation.resent',
    resourceType: 'admin_invitation',
    resourceId: invitation.id,
    oldValues: { expires_at: invitation.expires_at, status: invitation.status },
    newValues: { expires_at: expiresAt.toISOString(), status: 'sent', delivery_count: metadata.deliveries.length },
    ipAddress,
    userAgent,
  })

  return NextResponse.json({ invitation: updatedInvitation })
}
