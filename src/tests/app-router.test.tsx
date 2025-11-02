import { describe, expect, test, vi } from 'vitest'

describe('App Router Integration', () => {
  test('home redirects to /dashboard when authenticated', async () => {
    vi.doMock('@/lib/supabase/server', () => ({
      createSupabaseServerClient: () => ({ auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) } })
    }))
    const redirects: string[] = []
    vi.doMock('next/navigation', async () => {
      const actual = await vi.importActual<any>('next/navigation')
      return { ...actual, redirect: (href: string) => { redirects.push(href); throw new Error('REDIRECT') } }
    })
    const mod = await import('@/app/page')
    try { await mod.default() } catch (e: any) {
      expect(e.message).toBe('REDIRECT')
    }
    expect(redirects[0]).toBe('/dashboard')
  })

  test('dashboard layout redirects when unauthenticated', async () => {
    vi.doMock('@/lib/supabase/server', () => ({
      createSupabaseServerClient: () => ({ auth: { getUser: async () => ({ data: { user: null } }) } })
    }))
    const redirects: string[] = []
    vi.doMock('next/navigation', async () => {
      const actual = await vi.importActual<any>('next/navigation')
      return { ...actual, redirect: (href: string) => { redirects.push(href); throw new Error('REDIRECT') } }
    })
    const mod = await import('@/app/dashboard/layout')
    try { await mod.default({ children: null as any }) } catch (e: any) {
      expect(e.message).toBe('REDIRECT')
    }
    expect(redirects[0]).toBe('/')
  })

  test('login form provides navigation links', async () => {
    const { render, screen } = await import('@testing-library/react')
    const LoginForm = (await import('@/components/auth/login-form')).default
    render(<LoginForm />)
    expect(screen.getByText(/daftar/i).closest('a')?.getAttribute('href')).toBe('/auth/register')
    expect(screen.getByText(/lupa password/i).closest('a')?.getAttribute('href')).toBe('/auth/forgot-password')
  })
})

