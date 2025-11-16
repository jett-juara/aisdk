import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(_request: Request) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { message: 'Anda harus login terlebih dahulu.' } }, { status: 401 })
  }

  const { data: actorProfile, error: actorError } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (actorError || !actorProfile || (actorProfile.role !== 'admin' && actorProfile.role !== 'superadmin')) {
    return NextResponse.json({ error: { message: 'Anda tidak memiliki akses untuk melihat daftar pengguna.' } }, { status: 403 })
  }

  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, username, role, status, deleted_at, created_at, updated_at')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 400 })
  }

  return NextResponse.json({
    users: (users ?? []).map((row) => ({
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
    })),
  })
}
