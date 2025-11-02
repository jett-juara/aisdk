import { describe, expect, test } from 'vitest'

describe('Confirm Page', () => {
  test('has link to login', async () => {
    const Confirm = (await import('@/app/auth/confirm/page')).default
    const { render, screen } = await import('@testing-library/react')
    render(<Confirm />)
    const link = screen.getByText(/kembali ke halaman login/i).closest('a')
    expect(link?.getAttribute('href')).toBe('/auth/login')
  })
})

