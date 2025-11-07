import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Global redirect capture for advanced mocking
let mockRedirects: string[] = []
let customRedirectHandler: ((href: string) => void) | null = null

// Export utilities for test files to use
export const setMockRedirects = (redirects: string[]) => {
  mockRedirects = redirects
}

export const getMockRedirects = () => mockRedirects

export const setCustomRedirectHandler = (handler: (href: string) => void) => {
  customRedirectHandler = handler
}

// Mock Next.js router first before any imports
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: vi.fn(),
  redirect: (href: string) => {
    mockRedirects.push(href)
    if (customRedirectHandler) {
      customRedirectHandler(href)
    } else {
      throw new Error('REDIRECT')
    }
  },
  useServerInsertedHTML: vi.fn(),
}))

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    auth: {
      getUser: vi.fn(),
    },
  }),
}))

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: () => new Map([
    ['host', 'localhost:3000'],
    ['user-agent', 'test-agent'],
  ]),
  cookies: () => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  }),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: function MockImage({
    src,
    alt,
    className,
    style
  }: any) {
    return React.createElement('img', { src, alt, className, style })
  },
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: function MockLink({
    href,
    children,
    className,
    ...props
  }: any) {
    return React.createElement('a', { href, className, ...props }, children)
  },
}))

// Mock Next.js dynamic imports
vi.mock('next/dynamic', () => ({
  default: (dynamicImportFn: () => Promise<any>, options?: any) => {
    // For test environment, return a simple mock that resolves synchronously
    try {
      const module = dynamicImportFn()
      const Component = (module as any).default || (module as any).MobileMenu
      return Component
    } catch {
      // Fallback: return a simple div
      return () => React.createElement('div', { 'data-testid': 'dynamic-mock' }, 'Dynamic Component')
    }
  },
}))

// Mock React cache function for Next.js 16
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    cache: (fn: any) => fn, // Simple pass-through mock for cache
  }
})

// Mock window APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})