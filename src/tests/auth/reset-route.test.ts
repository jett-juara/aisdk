import { describe, expect, test, vi } from 'vitest'

async function importResetRoute() {
  return await import('@/app/api/auth/reset-password/route')
}

describe('Reset Password Route', () => {
  test('rate limited returns 429', async () => {
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: false }) }))
    const { POST } = await importResetRoute()
    const req = new Request('http://localhost/api/auth/reset-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@b.com' }) })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  test('invalid provider error mapped to Indonesian', async () => {
    vi.doMock('@/lib/rate-limit', () => ({ rateLimitOk: () => ({ ok: true }) }))
    vi.doMock('@/lib/supabase/server', () => ({ createSupabaseServerClient: vi.fn(async () => ({})) }))
    vi.doMock('@/lib/auth', () => ({ resetPassword: vi.fn(async () => ({ error: { message: 'rate limit' } })) }))
    const { POST } = await importResetRoute()
    const req = new Request('http://localhost/api/auth/reset-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'a@b.com' }) })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(String(json.error).toLowerCase()).toContain('terlalu banyak')
  })
})

