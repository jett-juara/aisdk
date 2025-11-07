import { describe, expect, test, vi, beforeEach } from 'vitest'

// Mock modules before imports
const mockRateLimitOk = vi.fn()
const mockCreateSupabaseServerClient = vi.fn()
const mockCreateSupabaseAdminClient = vi.fn()
const mockSignUp = vi.fn()

vi.mock('@/lib/rate-limit', () => ({
  rateLimitOk: mockRateLimitOk
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient
}))

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: mockCreateSupabaseAdminClient
}))

vi.mock('@/lib/auth', () => ({
  signUp: mockSignUp
}))

const { POST } = await import('@/app/api/auth/register/route')

describe('Register Route - Policy & Rate Limit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('rejects weak password with 400', async () => {
    mockRateLimitOk.mockReturnValue({ ok: true })
    mockCreateSupabaseServerClient.mockResolvedValue({})
    const mockFrom = vi.fn()
    mockFrom.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null })
    })
    mockCreateSupabaseAdminClient.mockReturnValue({
      from: mockFrom
    })
    mockSignUp.mockResolvedValue({ userId: null, error: null })

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'a@b.com',
        password: 'weak',
        firstName: 'A',
        lastName: 'B'
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(String(json.error).toLowerCase()).toContain('minimal')
  })

  test('rate limit returns 429 for register', async () => {
    mockRateLimitOk.mockReturnValue({ ok: false })

    const req = new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'a@b.com',
        password: 'Password1',
        firstName: 'A',
        lastName: 'B'
      })
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })
})

