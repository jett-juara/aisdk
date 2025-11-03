import { describe, expect, test } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/footer'

describe('Footer – content & links', () => {
  test('renders contact info and social links', () => {
    render(<Footer />)

    // email ada sebagai sr-only dan link; cukup cek link-nya
    expect(screen.getByRole('link', { name: /info@juara-events.com/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Jakarta, Indonesia/i).length).toBeGreaterThan(0)

    // Social labels are aria-label on anchors
    expect(screen.getByLabelText(/Instagram/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument()
  })
})
