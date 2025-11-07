import { describe, expect, test, vi, beforeEach } from 'vitest'

// Mock modules before imports
const mockRateLimitOk = vi.fn()
const mockCreateSupabaseServerClient = vi.fn()
const mockResetPassword = vi.fn()

vi.mock('@/lib/rate-limit', () => ({
  rateLimitOk: mockRateLimitOk
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient
}))

vi.mock('@/lib/auth', () => ({
  resetPassword: mockResetPassword
}))

const { POST } = await import('@/app/api/auth/reset-password/route')

describe('Reset Password Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('rate limited returns 429', async () => {
    mockRateLimitOk.mockReturnValue({ ok: false })

    const req = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com' })
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  test('invalid provider error mapped to Indonesian', async () => {
    mockRateLimitOk.mockReturnValue({ ok: true })
    mockCreateSupabaseServerClient.mockResolvedValue({})
    mockResetPassword.mockResolvedValue({ error: { message: 'rate limit' } })

    const req = new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com' })
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(String(json.error).toLowerCase()).toContain('terlalu banyak')
  })
})

