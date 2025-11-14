import { describe, expect, test } from 'vitest'

describe('Confirm Page', () => {
  test('has link to login', async () => {
    const Confirm = (await import('@/app/auth/confirm/page')).default
    const { render, screen } = await import('@testing-library/react')
    const element = await Confirm({})
    render(element as any)
    const link = screen.getAllByText(/kembali ke halaman login/i)[0].closest('a')
    expect(link?.getAttribute('href')).toBe('/auth/login')
  })
})

