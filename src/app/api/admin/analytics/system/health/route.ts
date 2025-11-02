import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const {
    data: { user },
  } = await server.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { message: 'Lo harus login dulu.' } }, { status: 401 })
  }

  const { data: profile } = await server
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
    return NextResponse.json({ error: { message: 'Lo nggak punya akses ke system health.' } }, { status: 403 })
  }

  const { data, error } = await admin.rpc('get_system_health')

  if (error) {
    return NextResponse.json({ error: { message: error.message } }, { status: 400 })
  }

  return NextResponse.json({ health: data })
}
