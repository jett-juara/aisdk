import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'

// Mock modules before imports
const mockRateLimitOk = vi.fn()
const mockCreateSupabaseAdminClient = vi.fn()
const mockCreateSupabaseServerClient = vi.fn()
const mockSignIn = vi.fn()

vi.mock('@/lib/rate-limit', () => ({
  rateLimitOk: mockRateLimitOk
}))

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: mockCreateSupabaseAdminClient
}))

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: mockCreateSupabaseServerClient
}))

vi.mock('@/lib/auth', () => ({
  signIn: mockSignIn
}))

const { POST } = await import('@/app/api/auth/login/route')

describe('Login Route - Lockout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns 423 when account locked', async () => {
    const future = new Date(Date.now() + 10 * 60_000).toISOString()

    mockRateLimitOk.mockReturnValue({ ok: true })
    const mockFrom = vi.fn()
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'u1', failed_attempts: 4, locked_until: future }
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
    mockCreateSupabaseAdminClient.mockReturnValue({
      from: mockFrom
    })

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'x' })
    })
    const res = await POST(req)
    expect(res.status).toBe(423)
  })

  test('increments failed attempts on wrong password', async () => {
    const updates: any[] = []

    mockRateLimitOk.mockReturnValue({ ok: true })
    const mockFrom2 = vi.fn()
    mockFrom2.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'u1', failed_attempts: 0, locked_until: null }
          })
        })
      }),
      update: vi.fn().mockImplementation((payload) => {
        updates.push(payload)
        return {
          eq: vi.fn().mockResolvedValue({ error: null })
        }
      })
    })
    mockCreateSupabaseAdminClient.mockReturnValue({
      from: mockFrom2
    })
    mockCreateSupabaseServerClient.mockResolvedValue({})
    mockSignIn.mockResolvedValue({ session: null, error: { message: 'invalid credentials' } })

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'wrong' })
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect(updates[0]?.failed_attempts).toBe(1)
  })
})

