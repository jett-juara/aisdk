import { describe, expect, test, vi } from 'vitest'

async function importRegisterRoute() {
  return await import('@/app/api/auth/register/route')
}

describe('Register Route - Policy & Rate Limit', () => {
  test('rejects weak password with 400', async () => {
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: true }) }))
    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(async () => ({})) }))
    vi.doMock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: vi.fn(() => ({ from: () => ({ upsert: async () => ({ error: null }) }) })) }))
    vi.doMock('@/lib/auth', () => ({ signUp: vi.fn(async () => ({ userId: null, error: null })) }))

    const { POST } = await importRegisterRoute()
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'weak', firstName: 'A', lastName: 'B' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(String(json.error).toLowerCase()).toContain('minimal')
  })

  test('rate limit returns 429 for register', async () => {
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: false }) }))
    const { POST } = await importRegisterRoute()
    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'Password1', firstName: 'A', lastName: 'B' })
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })
})

