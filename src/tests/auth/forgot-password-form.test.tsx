import { render, screen, fireEvent } from '@testing-library/react'
import ForgotPasswordForm from '@/components/auth/forgot-password-form'

describe('ForgotPasswordForm', () => {
  it('renders email input', () => {
    render(<ForgotPasswordForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    render(<ForgotPasswordForm />)
    fireEvent.click(screen.getByRole('button', { name: /^kirim$/i }))
    expect(await screen.findByText(/email tidak valid/i)).toBeTruthy()
  })
})

