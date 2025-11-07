import { describe, expect, test, vi, beforeEach } from 'vitest'
import { setMockRedirects, getMockRedirects, setCustomRedirectHandler } from './setup'

// Create proper mock for supabase
const mockCreateSupabaseServerClient = vi.fn()

describe('App Router Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setMockRedirects([])
    setCustomRedirectHandler(null)
    mockCreateSupabaseServerClient.mockReset()
  })

  test('login form provides navigation links', async () => {
    const { render, screen } = await import('@testing-library/react')
    const LoginForm = (await import('@/components/auth/login-form')).default
    render(<LoginForm />)
    // Update text to match actual component: "Register sekarang" instead of "daftar"
    expect(screen.getByText(/register sekarang/i).closest('a')?.getAttribute('href')).toBe('/auth/register')
    expect(screen.getByText(/lupa password/i).closest('a')?.getAttribute('href')).toBe('/auth/forgot-password')
  })
})

