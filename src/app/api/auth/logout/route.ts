import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/auth'

export async function POST() {
  const server = createSupabaseServerClient()
  const { error } = await signOut(server)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}

