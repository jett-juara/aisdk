import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Minimal 8 karakter')
  .regex(/[a-z]/, 'Harus mengandung huruf kecil')
  .regex(/[A-Z]/, 'Harus mengandung huruf besar')
  .regex(/[0-9]/, 'Harus mengandung angka')

export function validatePasswordServer(pw: string) {
  const res = passwordSchema.safeParse(pw)
  if (!res.success) {
    const msg = res.error.issues[0]?.message || 'Kata sandi tidak valid'
    return { ok: false, message: msg }
  }
  return { ok: true }
}

export const LOCK_MAX_ATTEMPTS = 5
export const LOCK_DURATION_MIN = 15

