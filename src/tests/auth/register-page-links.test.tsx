import { describe, expect, test } from 'vitest'

describe('Register Page links', () => {
  test('has link back to login', async () => {
    const RegisterPage = (await import('@/app/auth/register/page')).default
    const { render, screen } = await import('@testing-library/react')
    render(<RegisterPage />)
    const link = screen.getByText(/sudah punya akun/i).parentElement?.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/auth')
  })
})

