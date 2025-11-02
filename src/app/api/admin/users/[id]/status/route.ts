import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const updateStatusSchema = z.object({
  status: z.enum(['active', 'blocked', 'deleted']),
  reason: z
    .string()
    .max(200, 'Alasan maksimal 200 karakter')
    .optional()
    .transform((value) => (value && value.trim().length > 0 ? value.trim() : null)),
})

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

  if (actorError || !actorProfile) {
    return NextResponse.json({ error: { message: 'Profil admin nggak ditemukan.' } }, { status: 403 })
  }

  if (actorProfile.role !== 'admin' && actorProfile.role !== 'superadmin') {
    return NextResponse.json({ error: { message: 'Lo nggak punya akses buat ubah status user.' } }, { status: 403 })
  }

  const payload = await request.json().catch(() => null)
  const parsed = updateStatusSchema.safeParse(payload)

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ')
    return NextResponse.json({ error: { message } }, { status: 400 })
  }

  const { status, reason } = parsed.data
  const targetId = id

  const { data: targetUser, error: targetError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', targetId)
    .single()

  if (targetError || !targetUser) {
    return NextResponse.json({ error: { message: 'User nggak ditemukan.' } }, { status: 404 })
  }

  if (targetUser.role === 'superadmin' && actorProfile.role !== 'superadmin') {
    return NextResponse.json(
      { error: { message: 'Hanya superadmin yang boleh ubah status superadmin lain.' } },
      { status: 403 }
    )
  }

  const { data: updated, error: updateError } = await supabase.rpc('update_user_status', {
    target_user: targetId,
    new_status: status,
    change_reason: reason,
  })

  if (updateError) {
    return NextResponse.json({ error: { message: updateError.message } }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    userId: targetId,
    status: updated?.[0]?.status ?? status,
    deletedAt: updated?.[0]?.deleted_at ?? null,
    updatedAt: updated?.[0]?.updated_at ?? new Date().toISOString(),
  })
}
