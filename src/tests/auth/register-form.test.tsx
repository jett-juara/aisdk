import { render, screen, fireEvent } from '@testing-library/react'
import RegisterForm from '@/components/auth/register-form'

describe('RegisterForm', () => {
  it('renders required inputs', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/nama depan/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nama belakang/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^konfirmasi password$/i)).toBeInTheDocument()
  })

  it('validates password confirmation mismatch', async () => {
    render(<RegisterForm />)
    fireEvent.change(screen.getByLabelText(/nama depan/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/nama belakang/i), { target: { value: 'B' } })
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password1' } })
    fireEvent.change(screen.getByLabelText(/^konfirmasi password$/i), { target: { value: 'Password2' } })
    fireEvent.click(screen.getByRole('button', { name: /daftar/i }))
    expect(await screen.findByText(/konfirmasi password tidak cocok/i)).toBeTruthy()
  })
})
