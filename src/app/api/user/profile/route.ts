import { NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
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
  }, {
    headers: {
      // Next.js 16 Cache headers
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'CDN-Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
      'Vary': 'Cookie, Authorization',
      // Add cache tag metadata for client reference
      'X-Cache-Tags': `user-profile, user-${profile.id}`
    }
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

  // Next.js 16: Revalidate cache tags after successful update
  // This will trigger stale-while-revalidate for cached user profiles
  try {
    revalidateTag('user-profile', 'max') // stale-while-revalidate behavior
    revalidateTag(`user-${updatedProfile.id}`, 'max') // user-specific cache
  } catch (revalidateError) {
    // Log revalidation error but don't fail the request
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
  }, {
    headers: {
      // Disable caching for PUT responses to ensure fresh data
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Indicate successful cache revalidation
      'X-Cache-Revalidated': 'user-profile, user-' + updatedProfile.id
    }
  })
}