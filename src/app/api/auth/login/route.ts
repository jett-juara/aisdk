import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { signIn } from '@/lib/auth'
import { rateLimitOk } from '@/lib/rate-limit'
import { toIndonesianError } from '@/lib/errors'
import { LOCK_DURATION_MIN, LOCK_MAX_ATTEMPTS } from '@/lib/security'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }
  const { email, password } = body as { email?: string; password?: string }
  if (!email || !password) {
    return NextResponse.json({ error: 'Field wajib: email, password' }, { status: 400 })
  }
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'ip:unknown').toString()
  const rl = rateLimitOk(`login:${ip}`, 60, 60_000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan login. Coba lagi nanti.' }, { status: 429 })
  }

  const admin = createSupabaseAdminClient()
  // Cek lockout
  const { data: userRow } = await admin.from('users').select('id,failed_attempts,locked_until').eq('email', email).maybeSingle()
  const now = new Date()
  if (userRow?.locked_until && new Date(userRow.locked_until) > now) {
    return NextResponse.json({ error: 'Akun kamu terkunci sementara. Coba lagi beberapa menit.' }, { status: 423 })
  }

  const server = await createSupabaseServerClient()
  const { session, error } = await signIn(server, email, password)
  if (error) {
    // Increment gagal
    if (userRow?.id) {
      const nextAttempts = (userRow.failed_attempts ?? 0) + 1
      const payload: any = { failed_attempts: nextAttempts }
      if (nextAttempts >= LOCK_MAX_ATTEMPTS) {
        const lockedUntil = new Date(now.getTime() + LOCK_DURATION_MIN * 60_000)
        payload.locked_until = lockedUntil.toISOString()
      }
      await admin.from('users').update(payload).eq('id', userRow.id)
    }
    return NextResponse.json({ error: toIndonesianError(error.message) }, { status: 401 })
  }

  // Reset gagal jika sukses
  if (userRow?.id) {
    await admin.from('users').update({ failed_attempts: 0, locked_until: null }).eq('id', userRow.id)
  }

  return NextResponse.json({ session })
}
