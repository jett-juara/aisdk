import type { SupabaseClient } from '@supabase/supabase-js'

export interface SignUpInput {
  email: string
  password: string
  firstName: string
  lastName: string
  redirectTo?: string
}

export async function signUp(
  server: SupabaseClient,
  admin: SupabaseClient,
  input: SignUpInput
) {
  const { email, password, firstName, lastName, redirectTo } = input

  const { data, error } = await server.auth.signUp({
    email,
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  })
  if (error) return { userId: null, error }

  const userId = data.user?.id ?? null
  if (userId) {
    await admin.from('users').upsert(
      {
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
      },
      { onConflict: 'id' }
    )
  }

  return { userId, error: null }
}

export async function signIn(server: SupabaseClient, email: string, password: string) {
  const { data, error } = await server.auth.signInWithPassword({ email, password })
  return { session: data.session, error }
}

export async function signOut(server: SupabaseClient) {
  const { error } = await server.auth.signOut()
  return { error }
}

export async function resetPassword(server: SupabaseClient, email: string, redirectTo?: string) {
  const { data, error } = await server.auth.resetPasswordForEmail(email, {
    redirectTo,
  })
  return { data, error }
}

export async function getUserProfile(server: SupabaseClient) {
  const { data: authData } = await server.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return { profile: null, error: new Error('Unauthorized') }
  const { data, error } = await server.from('users').select('*').eq('id', userId).single()
  return { profile: data ?? null, error }
}

export async function updateUserProfile(
  server: SupabaseClient,
  updates: Partial<{ first_name: string; last_name: string }>
) {
  const { data: authData } = await server.auth.getUser()
  const userId = authData.user?.id
  if (!userId) return { error: new Error('Unauthorized') }
  const { error } = await server.from('users').update(updates).eq('id', userId)
  return { error }
}

export async function deleteUser(admin: SupabaseClient, userId: string) {
  const { error } = await admin.from('users').delete().eq('id', userId)
  return { error }
}

