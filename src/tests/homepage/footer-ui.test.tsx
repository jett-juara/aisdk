import { describe, expect, test } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/footer'

describe('Footer – content & links', () => {
  test('renders copyright and social links', () => {
    render(<Footer />)

    // Check copyright text (using regex to handle dynamic year)
    expect(screen.getByText(/© \d+ JUARA Events\. All rights reserved\./i)).toBeInTheDocument()

    // Social labels are aria-label on anchors
    expect(screen.getByLabelText(/Facebook/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Instagram/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Twitter/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument()

    // Check that all social links are present
    expect(screen.getAllByRole('link').length).toBe(4)
  })
})
