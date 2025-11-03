import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  }),
}))

// Simple fetch mock for profile + logout
const fetchMock = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
  const u = String(url)
  if (u.includes('/api/user/profile')) {
    return new Response(
      JSON.stringify({ id: 'u1', email: 'erik@juara', firstName: 'Erik', lastName: 'Supit', role: 'superadmin' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
  if (u.includes('/api/auth/logout')) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response('{}', { status: 200 })
})

describe('Header – auth integration & interactions', () => {
  beforeEach(() => {
    global.fetch = fetchMock
  })
  afterEach(() => {
    fetchMock.mockClear()
  })

  test('renders profile name when session exists and can logout', async () => {
    vi.doMock('next/navigation', async () => {
      const actual = await vi.importActual<any>('next/navigation')
      return { ...actual, useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }
    })
    const { Header } = await import('@/components/layout/header')
    render(<Header />)

    // Profile fetched → show display name
    await waitFor(() => expect(screen.getByText(/Erik Supit/i)).toBeInTheDocument())

    // Open dropdown by clicking on profile container (has name visible)
    fireEvent.click(screen.getByText(/Erik Supit/i))
    // Click Logout
    await waitFor(() => expect(screen.getByText(/Logout/i)).toBeInTheDocument())
    fireEvent.click(screen.getByText(/Logout/i))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', expect.anything()))
  })
})
