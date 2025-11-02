import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  PERMISSION_DEFINITIONS,
  PERMISSION_TEMPLATES,
  type PermissionItem,
  definitionToPermissionItem,
  resolveTemplatePermissions,
} from '@/lib/dashboard/permissions'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const permissionItemSchema = z.object({
  pageKey: z.string().nullable().optional(),
  featureKey: z.string().min(1, 'featureKey wajib diisi'),
  accessGranted: z.boolean(),
})

const updatePermissionsSchema = z.object({
  permissions: z.array(permissionItemSchema).max(50).optional(),
  template: z.string().optional(),
  reason: z
    .string()
    .max(200, 'Alasan maksimal 200 karakter')
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : null)),
})

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { message: 'Lo harus login dulu.' } }, { status: 401 })
  }

  const { data: actorProfile, error: actorError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (
    actorError ||
    !actorProfile ||
    (actorProfile.role !== 'admin' && actorProfile.role !== 'superadmin')
  ) {
    return NextResponse.json(
      { error: { message: 'Lo nggak punya akses buat ubah izin.' } },
      { status: 403 }
    )
  }

  const targetUserId = id

  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('id, role, email, first_name, last_name, username')
    .eq('id', targetUserId)
    .single()

  if (targetError || !targetUser) {
    return NextResponse.json({ error: { message: 'User nggak ditemukan.' } }, { status: 404 })
  }

  if (targetUser.role === 'superadmin' && actorProfile.role !== 'superadmin') {
    return NextResponse.json(
      { error: { message: 'Hanya superadmin yang boleh ubah izin superadmin lain.' } },
      { status: 403 }
    )
  }

  const { data: permissions, error: permissionError } = await supabase
    .from('user_permissions')
    .select('page_key, feature_key, access_granted')
    .eq('user_id', targetUserId)
    .order('feature_key', { ascending: true })

  if (permissionError) {
    return NextResponse.json({ error: { message: permissionError.message } }, { status: 400 })
  }

  return NextResponse.json({
    user: {
      id: targetUser.id,
      role: targetUser.role,
      email: targetUser.email,
      firstName: targetUser.first_name ?? '',
      lastName: targetUser.last_name ?? '',
      username: targetUser.username ?? '',
    },
    permissions: (permissions ?? []).map((row) => ({
      pageKey: row.page_key,
      featureKey: row.feature_key,
      accessGranted: row.access_granted,
    })),
    availablePermissions: PERMISSION_DEFINITIONS,
    templates: PERMISSION_TEMPLATES,
  })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { message: 'Lo harus login dulu.' } }, { status: 401 })
  }

  const { data: actorProfile, error: actorError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (
    actorError ||
    !actorProfile ||
    (actorProfile.role !== 'admin' && actorProfile.role !== 'superadmin')
  ) {
    return NextResponse.json(
      { error: { message: 'Lo nggak punya akses buat ubah izin.' } },
      { status: 403 }
    )
  }

  const payload = await request.json().catch(() => null)
  const parsed = updatePermissionsSchema.safeParse(payload)

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ')
    return NextResponse.json({ error: { message } }, { status: 400 })
  }

  const { permissions = [], template, reason } = parsed.data
  const targetUserId = id

  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', targetUserId)
    .single()

  if (targetError || !targetUser) {
    return NextResponse.json({ error: { message: 'User nggak ditemukan.' } }, { status: 404 })
  }

  if (targetUser.role === 'superadmin' && actorProfile.role !== 'superadmin') {
    return NextResponse.json(
      { error: { message: 'Hanya superadmin yang boleh ubah izin superadmin lain.' } },
      { status: 403 }
    )
  }

  const templatePermissions = template ? resolveTemplatePermissions(template) : []

  const customPermissions = permissions.map((item) => ({
    pageKey: item.pageKey ?? null,
    featureKey: item.featureKey,
    accessGranted: item.accessGranted,
  }))

  const merged = mergePermissions([...templatePermissions, ...customPermissions])

  const { data: updatedPermissions, error: updateError } = await supabase.rpc(
    'replace_user_permissions',
    {
      target_user: targetUserId,
      permission_items: merged,
      change_reason: reason ?? template ?? null,
    }
  )

  if (updateError) {
    return NextResponse.json({ error: { message: updateError.message } }, { status: 400 })
  }

  return NextResponse.json({
    userId: targetUserId,
    permissions: (updatedPermissions ?? []).map((row: any) =>
      definitionToPermissionItemByKeys(row.page_key, row.feature_key, row.access_granted)
    ),
  })
}

function mergePermissions(items: PermissionItem[]): PermissionItem[] {
  const map = new Map<string, PermissionItem>()

  items.forEach((item) => {
    const key = `${item.pageKey ?? ''}:${item.featureKey}`
    if (!map.has(key)) {
      map.set(key, {
        pageKey: item.pageKey ?? null,
        featureKey: item.featureKey,
        accessGranted: item.accessGranted,
      })
    } else {
      // Override access flag if duplicate appears later (custom overrides template)
      const stored = map.get(key)!
      stored.accessGranted = item.accessGranted
    }
  })

  return Array.from(map.values())
}

function definitionToPermissionItemByKeys(
  pageKey: string | null,
  featureKey: string,
  accessGranted: boolean
): PermissionItem {
  const definition = PERMISSION_DEFINITIONS.find(
    (entry) => entry.pageKey === pageKey && entry.featureKey === featureKey
  )
  if (definition) {
    return definitionToPermissionItem(definition, accessGranted)
  }
  return {
    pageKey,
    featureKey,
    accessGranted,
  }
}
