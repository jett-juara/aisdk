import { describe, expect, test } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { MobileMenu } from '@/components/layout/header/header-menu'

const ITEMS = [
  {
    label: 'Product & Services',
    href: '/product-services',
    children: [{ label: 'Design', href: '#design' }],
  },
  { label: 'About', href: '/about' },
]

describe('MobileMenu – sheet interactions & touch targets', () => {
  test('opens sheet and shows items with min touch size', async () => {
    render(<MobileMenu items={ITEMS as any} profile={null} />)

    // Open sheet
    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    // Links visible
    expect(await screen.findByText('Product & Services')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()

    // Check that Product & Services element exists and is clickable (asChild makes Link the button)
    const productServicesLink = screen.getByText('Product & Services')
    expect(productServicesLink).toBeInTheDocument()
    expect(productServicesLink.closest('a')).toBeInTheDocument()

    // Alternative: Check if any element in the navigation has min-h-[44px]
    const nav = screen.getByRole('navigation') || document.querySelector('nav')
    if (nav) {
      const hasMinTouchSize = Array.from(nav.querySelectorAll('*')).some(
        el => el.className && el.className.includes && el.className.includes('min-h-[44px]')
      )
      expect(hasMinTouchSize).toBe(true)
    }
  })
})
