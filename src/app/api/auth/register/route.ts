import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { signUp } from '@/lib/auth'
import { validatePasswordServer } from '@/lib/security'
import { rateLimitOk } from '@/lib/rate-limit'
import { toIndonesianError } from '@/lib/errors'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }
  const { email, password, firstName, lastName } = body as {
    email?: string
    password?: string
    firstName?: string
    lastName?: string
  }
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: 'Field wajib: email, password, firstName, lastName' }, { status: 400 })
  }

  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'ip:unknown').toString()
  const rl = rateLimitOk(`register:${ip}`, 20, 60_000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 })
  }

  const pwCheck = validatePasswordServer(password)
  if (!pwCheck.ok) {
    return NextResponse.json({ error: pwCheck.message }, { status: 400 })
  }

  const server = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`
  const { userId, error } = await signUp(server, admin, { email, password, firstName, lastName, redirectTo })
  if (error) {
    return NextResponse.json({ error: toIndonesianError(error.message) }, { status: 400 })
  }
  return NextResponse.json({ userId })
}
