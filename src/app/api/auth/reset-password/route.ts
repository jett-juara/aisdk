import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { resetPassword } from '@/lib/auth'
import { rateLimitOk } from '@/lib/rate-limit'
import { toIndonesianError } from '@/lib/errors'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }
  const { email } = body as { email?: string }
  if (!email) {
    return NextResponse.json({ error: 'Field wajib: email' }, { status: 400 })
  }
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'ip:unknown').toString()
  const rl = rateLimitOk(`reset:${ip}`, 20, 60_000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Coba lagi nanti.' }, { status: 429 })
  }

  const server = createSupabaseServerClient()
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset`
  const { error } = await resetPassword(server, email, redirectTo)
  if (error) {
    return NextResponse.json({ error: toIndonesianError(error.message) }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
