// Placeholder UI tests (React Testing Library) – not executed here
import { render, screen, fireEvent } from '@testing-library/react'
import LoginForm from '@/components/auth/login-form'

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    render(<LoginForm />)
    fireEvent.click(screen.getByRole('button', { name: /masuk/i }))
    expect(await screen.findByText(/email tidak valid/i)).toBeTruthy()
  })
})

