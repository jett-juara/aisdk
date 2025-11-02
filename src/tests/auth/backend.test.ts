import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

// Helper to dynamically import route with fresh mocks
async function importRegisterRoute() {
  const mod = await import('@/app/api/auth/register/route')
  return mod
}
async function importLoginRoute() {
  const mod = await import('@/app/api/auth/login/route')
  return mod
}
async function importLogoutRoute() {
  const mod = await import('@/app/api/auth/logout/route')
  return mod
}
async function importResetRoute() {
  const mod = await import('@/app/api/auth/reset-password/route')
  return mod
}

beforeEach(() => {
  vi.resetModules()
})
afterEach(() => {
  vi.clearAllMocks()
})

describe('Backend - Auth Routes', () => {
  test('register returns 200 with userId', async () => {
    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(() => ({})) }))
    vi.doMock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: vi.fn(() => ({ from: () => ({ upsert: async () => ({ error: null }) }) })) }))
    vi.doMock('@/lib/auth', () => ({ signUp: vi.fn(async () => ({ userId: 'user-123', error: null })) }))
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: true }) }))

    const { POST } = await importRegisterRoute()
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': 'test-ip' },
      body: JSON.stringify({ email: 'a@b.com', password: 'Password1', firstName: 'A', lastName: 'B' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.userId).toBe('user-123')
  })

  test('login returns 200 with session', async () => {
    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(() => ({})) }))
    vi.doMock('@/lib/supabase/admin', () => ({
      createSupabaseAdminClient: vi.fn(() => ({
        from: () => ({
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'u1', failed_attempts: 0, locked_until: null } }) }) }),
          update: () => ({ eq: () => ({ error: null }) }),
        }),
      })),
    }))
    vi.doMock('@/lib/auth', () => ({ signIn: vi.fn(async () => ({ session: { id: 'sess' }, error: null })) }))
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: true }) }))

    const { POST } = await importLoginRoute()
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': 'ip' },
      body: JSON.stringify({ email: 'a@b.com', password: 'Password1' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.session.id).toBe('sess')
  })

  test('rate limiting returns 429 on login when exceeded', async () => {
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: false, remaining: 0, resetAt: Date.now() + 1000 }) }))
    // Mock others minimally
    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(() => ({})) }))
    const { POST } = await importLoginRoute()
    const req = new Request('http://localhost/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@b.com', password: 'Password1' }) })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  test('reset-password returns 200', async () => {
    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(() => ({})) }))
    vi.doMock('@/lib/auth', () => ({ resetPassword: vi.fn(async () => ({ error: null })) }))
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: true }) }))
    const { POST } = await importResetRoute()
    const req = new Request('http://localhost/api/auth/reset-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@b.com' }) })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  test('logout returns 200', async () => {
    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(() => ({})) }))
    vi.doMock('@/lib/auth', () => ({ signOut: vi.fn(async () => ({ error: null })) }))
    const { POST } = await importLogoutRoute()
    const res = await POST()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
  })
})
