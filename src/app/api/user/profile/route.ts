import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Nama depan minimal 2 karakter')
    .max(60, 'Nama depan maksimal 60 karakter')
    .trim(),
  lastName: z
    .string()
    .optional()
    .transform((value) => (value ?? '').trim()),
  email: z.string().email('Format email nggak valid').trim(),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(24, 'Username maksimal 24 karakter')
    .regex(/^[a-z0-9._-]+$/, 'Pakai huruf kecil, angka, titik, atau strip')
    .transform((value) => value.toLowerCase().trim()),
})

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { message: 'Lo harus login dulu.' } }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, username, username_changed, status, role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: { message: 'Profil nggak ditemukan.' } }, { status: 404 })
  }

  return NextResponse.json({
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    username: profile.username ?? '',
    usernameChanged: profile.username_changed,
    status: profile.status,
    role: profile.role,
  })
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: { message: 'Lo harus login dulu.' } }, { status: 401 })
  }

  const payload = await request.json().catch(() => null)
  const parsed = profileUpdateSchema.safeParse(payload)

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(', ')
    return NextResponse.json({ error: { message } }, { status: 400 })
  }

  const { firstName, lastName, email, username } = parsed.data

  const { data: currentProfile, error: fetchError } = await supabase
    .from('users')
    .select('email')
    .eq('id', user.id)
    .single()

  if (fetchError || !currentProfile) {
    return NextResponse.json({ error: { message: 'Profil nggak ditemukan.' } }, { status: 404 })
  }

  if (currentProfile.email !== email) {
    const { error: emailUpdateError } = await supabase.auth.updateUser({ email })
    if (emailUpdateError) {
      return NextResponse.json({ error: { message: emailUpdateError.message } }, { status: 400 })
    }
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      username,
    })
    .eq('id', user.id)
    .select('id, email, first_name, last_name, username, username_changed, status, role')
    .single()

  if (updateError || !updatedProfile) {
    const message =
      updateError?.message ??
      'Gagal memperbarui profil. Pastikan data lo valid dan coba lagi.'
    return NextResponse.json({ error: { message } }, { status: 400 })
  }

  return NextResponse.json({
    id: updatedProfile.id,
    email: updatedProfile.email,
    firstName: updatedProfile.first_name ?? '',
    lastName: updatedProfile.last_name ?? '',
    username: updatedProfile.username ?? '',
    usernameChanged: updatedProfile.username_changed,
    status: updatedProfile.status,
    role: updatedProfile.role,
  })
}
