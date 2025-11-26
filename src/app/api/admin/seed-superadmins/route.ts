import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

async function ensure(admin: ReturnType<typeof createSupabaseAdminClient>, acc: { email: string; password: string; firstName: string; lastName: string }) {
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (listError) throw listError
  const foundUser = users.find(u => u.email === acc.email)
  let id = foundUser?.id || null
  if (!id) {
    const created = await admin.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { first_name: acc.firstName, last_name: acc.lastName, role: 'superadmin' },
    })
    if (created.error) throw created.error
    id = created.data.user.id
  } else {
    const updated = await admin.auth.admin.updateUserById(id, {
      password: acc.password,
      user_metadata: { first_name: acc.firstName, last_name: acc.lastName, role: 'superadmin' },
    })
    if (updated.error) throw updated.error
  }

  const upsert = await admin
    .from('users')
    .upsert(
      {
        id,
        email: acc.email,
        first_name: acc.firstName,
        last_name: acc.lastName,
        role: 'superadmin',
        status: 'active',
      },
      { onConflict: 'id' }
    )
  if (upsert.error) throw upsert.error

  return { id, email: acc.email, role: 'superadmin' }
}

export async function POST() {
  const admin = createSupabaseAdminClient()
  const accounts = [
    { email: 'admin@juaraevent.id', password: 'Ju4r42025', firstName: 'Admin', lastName: 'Juara' },
    { email: 'contact@juaraevent.id', password: 'Ju4r42025', firstName: 'Contact', lastName: 'Juara' },
  ]
  const results: any[] = []
  for (const acc of accounts) {
    try {
      const r = await ensure(admin, acc)
      results.push({ ok: true, ...r })
    } catch (e) {
      results.push({ ok: false, email: acc.email, error: e instanceof Error ? e.message : String(e) })
    }
  }
  return NextResponse.json({ results })
}

