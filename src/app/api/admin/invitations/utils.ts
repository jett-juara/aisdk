import type { SupabaseClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { InvitationDeliveryEntry, InvitationMetadata } from '@/lib/dashboard/invitations-types'

type SuperadminProfile = {
  id: string
  role: 'superadmin'
  first_name: string | null
  last_name: string | null
  email: string
}

export type SuperadminContext = {
  user: User
  profile: SuperadminProfile
}

export type SuperadminContextResult =
  | { data: SuperadminContext }
  | { error: { status: number; message: string } }

export async function getSuperadminContext(server: SupabaseClient): Promise<SuperadminContextResult> {
  const {
    data: { user },
  } = await server.auth.getUser()

  if (!user) {
    return { error: { status: 401, message: 'Lo harus login dulu.' } }
  }

  const { data: profile } = await server
    .from('users')
    .select('id, role, first_name, last_name, email')
    .eq('id', user.id)
    .single<SuperadminProfile>()

  if (!profile || profile.role !== 'superadmin') {
    return { error: { status: 403, message: 'Lo nggak punya akses buat fitur ini.' } }
  }

  return { data: { user, profile } }
}

export function buildInvitationMetadata(args: {
  firstName: string
  lastName?: string | null
  email: string
  inviter: { id: string; name: string | null; email: string | null }
  expiresInDays: number
  sentAt: string
}): InvitationMetadata {
  const displayName = buildDisplayName(args.firstName, args.lastName ?? null, args.email)
  const inviterName = args.inviter.name ?? args.inviter.email ?? 'Tim JUARA'

  return {
    templateVersion: 'admin-invitation-v1',
    subject: `Undangan Admin JUARA untuk ${displayName}`,
    previewText: `Hai ${displayName}, ${inviterName} ngundang lo jadi admin JUARA. Link undangan bakal kedaluwarsa dalam ${args.expiresInDays} hari.`,
    expiresInDays: args.expiresInDays,
    inviter: args.inviter,
    deliveries: [
      {
        provider: 'supabase_auth',
        sentAt: args.sentAt,
        status: 'sent',
      },
    ],
  }
}

export function appendDeliveryToMetadata(
  metadata: InvitationMetadata | null | undefined,
  entry: InvitationDeliveryEntry,
  overrides?: Partial<Omit<InvitationMetadata, 'deliveries'>>
): InvitationMetadata {
  const base: InvitationMetadata =
    metadata ?? {
      templateVersion: overrides?.templateVersion ?? 'admin-invitation-v1',
      subject: overrides?.subject ?? 'Undangan Admin JUARA',
      previewText: overrides?.previewText ?? '',
      expiresInDays: overrides?.expiresInDays ?? 7,
      inviter: overrides?.inviter ?? { id: '', name: null, email: null },
      deliveries: [],
    }

  return {
    ...base,
    ...overrides,
    deliveries: [...base.deliveries, entry],
  }
}

export function buildDisplayName(firstName: string | null, lastName: string | null, fallback: string): string {
  const parts = [firstName ?? '', lastName ?? ''].map((value) => value.trim()).filter(Boolean)
  if (parts.length === 0) return fallback
  return parts.join(' ')
}

export type AuditLogPayload = {
  userId: string | null
  action: string
  resourceType: string
  resourceId?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  ipAddress?: string | null
  userAgent?: string | null
}

export async function recordAuditLog(admin: SupabaseClient, payload: AuditLogPayload) {
  await admin.from('audit_logs').insert({
    user_id: payload.userId,
    action: payload.action,
    resource_type: payload.resourceType,
    resource_id: payload.resourceId ?? null,
    old_values: payload.oldValues ?? null,
    new_values: payload.newValues ?? null,
    ip_address: payload.ipAddress ?? null,
    user_agent: payload.userAgent ?? null,
  })
}

export function extractInviteToken(inviteLink: string | null): string | null {
  if (!inviteLink) return null
  try {
    const url = new URL(inviteLink)
    return url.searchParams.get('token')
  } catch {
    return null
  }
}
