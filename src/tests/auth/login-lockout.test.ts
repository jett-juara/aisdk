import { describe, expect, test, vi } from 'vitest'

async function importLoginRoute() {
  return await import('@/app/api/auth/login/route')
}

describe('Login Route - Lockout', () => {
  test('returns 423 when account locked', async () => {
    const future = new Date(Date.now() + 10 * 60_000).toISOString()
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: true }) }))
    vi.doMock('@/lib/supabase/admin', () => ({
      createSupabaseAdminClient: vi.fn(() => ({
        from: () => ({
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'u1', failed_attempts: 4, locked_until: future } }) }) }),
          update: () => ({ eq: () => ({ error: null }) })
        })
      }))
    }))
    const { POST } = await importLoginRoute()
    const req = new Request('http://localhost/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@b.com', password: 'x' }) })
    const res = await POST(req)
    expect(res.status).toBe(423)
  })

  test('increments failed attempts on wrong password', async () => {
    const updates: any[] = []
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: true }) }))
    vi.doMock('@/lib/supabase/admin', () => ({
      createSupabaseAdminClient: vi.fn(() => ({
        from: () => ({
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'u1', failed_attempts: 0, locked_until: null } }) }) }),
          update: (payload: any) => ({ eq: () => { updates.push(payload); return ({ error: null }) } })
        })
      }))
    }))
    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(async () => ({})) }))
    vi.doMock('@/lib/auth', () => ({ signIn: vi.fn(async () => ({ session: null, error: { message: 'invalid credentials' } })) }))

    const { POST } = await importLoginRoute()
    const req = new Request('http://localhost/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@b.com', password: 'wrong' }) })
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(updates[0]?.failed_attempts).toBe(1)
  })
})

