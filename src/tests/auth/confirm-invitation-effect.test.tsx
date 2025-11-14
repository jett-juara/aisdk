import { describe, expect, test, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'

import InvitationEffect from '@/components/auth/confirm/invitation-effect'

describe('InvitationEffect', () => {
  test('calls fetch when invited is true', async () => {
    const spy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true } as any)
    render(<InvitationEffect invited={true} />)
    // allow effect to run
    await new Promise((r) => setTimeout(r, 0))
    expect(spy).toHaveBeenCalledWith('/api/admin/invitations/accept', { method: 'POST' })
    spy.mockRestore()
  })

  test('does not call fetch when invited is false', async () => {
    const spy = vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true } as any)
    render(<InvitationEffect invited={false} />)
    await new Promise((r) => setTimeout(r, 0))
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})