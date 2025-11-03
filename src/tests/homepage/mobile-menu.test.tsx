import { describe, expect, test } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileMenu } from '@/components/layout/header/mobile-menu'

const ITEMS = [
  { label: 'Services', href: '#services', children: [{ label: 'Design', href: '#design' }] },
  { label: 'About', href: '/about' },
]

describe('MobileMenu – sheet interactions & touch targets', () => {
  test('opens sheet and shows items with min touch size', async () => {
    render(<MobileMenu items={ITEMS as any} profile={null} />)

    // Open sheet
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    // Links visible
    expect(await screen.findByText('Services')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()

    // Check min-h applied on wrapper (asChild makes Link the clickable element)
    const servicesEl = screen.getByText('Services')
    const wrapper = servicesEl.parentElement
    expect(wrapper?.className || '').toContain('min-h-[44px]')
  })
})
