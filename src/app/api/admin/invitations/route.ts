import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  appendDeliveryToMetadata,
  buildDisplayName,
  buildInvitationMetadata,
  extractInviteToken,
  getSuperadminContext,
  recordAuditLog,
} from './utils'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { InvitationMetadata } from '@/lib/dashboard/invitations-types'

const createInvitationSchema = z.object({
  email: z.string().email('Format email nggak valid').transform((value) => value.trim().toLowerCase()),
  firstName: z.string().min(2, 'Nama depan minimal 2 karakter').max(60, 'Nama depan maksimal 60 karakter'),
  lastName: z
    .string()
    .optional()
    .transform((value) => (value ?? '').trim()),
  role: z.enum(['admin', 'superadmin']).optional().default('admin'),
  expiresInDays: z.number().int().min(1).max(30).optional().default(7),
})

export async function GET() {
  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const contextResult = await getSuperadminContext(server)
  if ('error' in contextResult) {
    return NextResponse.json({ error: { message: contextResult.error.message } }, { status: contextResult.error.status })
  }

  const now = new Date().toISOString()
  await admin
    .from('admin_invitations')
    .update({ status: 'expired', responded_at: now })
    .is('responded_at', null)
    .eq('status', 'pending')
    .lt('expires_at', now)

  const { data: invitations, error } = await admin
    .from('admin_invitations')
    .select(
      'id, email, first_name, last_name, role, status, inviter_id, invited_user_id, invite_link, expires_at, sent_at, last_sent_at, responded_at, created_at, updated_at, metadata'
    )
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 400 })
  }

  return NextResponse.json({ invitations })
}

export async function POST(request: Request) {
  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const contextResult = await getSuperadminContext(server)
  if ('error' in contextResult) {
    return NextResponse.json({ error: { message: contextResult.error.message } }, { status: contextResult.error.status })
  }

  const { profile } = contextResult.data

  const payload = await request.json().catch(() => null)
  const parsed = createInvitationSchema.safeParse(payload)
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ')
    return NextResponse.json({ error: { message } }, { status: 400 })
  }

  const { email, firstName, lastName, role, expiresInDays } = parsed.data

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?invited=true`
  const inviteResponse = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      firstName,
      lastName,
      role,
      inviterId: profile.id,
      inviterEmail: profile.email,
    },
  })

  if (inviteResponse.error) {
    return NextResponse.json({ error: { message: inviteResponse.error.message } }, { status: 400 })
  }

  const inviteLink = (inviteResponse.data as any)?.action_link ?? null
  const invitedUserId = inviteResponse.data.user?.id ?? null
  const inviteToken = extractInviteToken(inviteLink)

  const nowIso = new Date().toISOString()

  if (invitedUserId || inviteToken) {
    await admin.from('users').upsert(
      {
        id: invitedUserId ?? undefined,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        invitation_token: inviteToken,
        invitation_expires_at: expiresAt.toISOString(),
      },
      { onConflict: 'email' }
    )
  }

  const { data: existingInvitation } = await admin
    .from('admin_invitations')
    .select('id, sent_at, responded_at, metadata')
    .eq('email', email)
    .maybeSingle<{
      id: string
      sent_at: string | null
      responded_at: string | null
      metadata: InvitationMetadata | null
    }>()

  const inviterName = buildDisplayName(profile.first_name, profile.last_name, profile.email)
  const baseMetadata = buildInvitationMetadata({
    firstName,
    lastName,
    email,
    inviter: { id: profile.id, name: inviterName, email: profile.email },
    expiresInDays,
    sentAt: nowIso,
  })

  const metadata = existingInvitation?.metadata
    ? appendDeliveryToMetadata(existingInvitation.metadata, { provider: 'supabase_auth', sentAt: nowIso, status: 'sent' }, {
        subject: baseMetadata.subject,
        previewText: baseMetadata.previewText,
        expiresInDays: baseMetadata.expiresInDays,
        inviter: baseMetadata.inviter,
      })
    : baseMetadata

  const { data: invitationRecord, error: insertError } = await admin
    .from('admin_invitations')
    .upsert(
      {
        id: existingInvitation?.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        status: 'sent',
        inviter_id: profile.id,
        invited_user_id: invitedUserId,
        invite_link: inviteLink,
        expires_at: expiresAt.toISOString(),
        sent_at: existingInvitation?.sent_at ?? nowIso,
        last_sent_at: nowIso,
        responded_at: existingInvitation?.responded_at ?? null,
        metadata,
      },
      {
        onConflict: 'email',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: { message: insertError.message } }, { status: 400 })
  }

  const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null
  const userAgent = request.headers.get('user-agent') ?? null

  await recordAuditLog(admin, {
    userId: profile.id,
    action: 'admin_invitation.sent',
    resourceType: 'admin_invitation',
    resourceId: invitationRecord.id,
    newValues: {
      email,
      role,
      invited_user_id: invitedUserId,
      expires_at: expiresAt.toISOString(),
    },
    ipAddress,
    userAgent,
  })

  return NextResponse.json({ invitation: invitationRecord })
}
