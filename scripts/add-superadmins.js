import { createClient } from '@supabase/supabase-js'

async function ensureSuperadmin(supabase, { email, password, firstName, lastName }) {
  const existing = await supabase.auth.admin.getUserByEmail(email)
  let userId = existing.data?.user?.id || null
  if (!userId) {
    const created = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, role: 'superadmin' },
    })
    if (created.error) throw created.error
    userId = created.data.user.id
  } else {
    const updated = await supabase.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { first_name: firstName, last_name: lastName, role: 'superadmin' },
    })
    if (updated.error) throw updated.error
  }

  const upsert = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'superadmin',
        status: 'active',
      },
      { onConflict: 'id' }
    )
  if (upsert.error) throw upsert.error

  return { id: userId, email, role: 'superadmin' }
}

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!url || !key) {
    console.error(JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE' }))
    process.exit(1)
  }
  const supabase = createClient(url, key)

  const accounts = [
    { email: 'admin@juaraevent.id', password: 'Ju4r42025', firstName: 'Admin', lastName: 'Juara' },
    { email: 'contact@juaraevent.id', password: 'Ju4r42025', firstName: 'Contact', lastName: 'Juara' },
  ]

  const results = []
  for (const acc of accounts) {
    try {
      const r = await ensureSuperadmin(supabase, acc)
      results.push({ ok: true, ...r })
    } catch (e) {
      results.push({ ok: false, email: acc.email, error: e?.message || String(e) })
    }
  }

  console.log(JSON.stringify({ results }, null, 2))
}

main().catch((e) => {
  console.error(JSON.stringify({ error: e?.message || String(e) }))
  process.exit(1)
})

