"use client"

import { useEffect } from 'react'

export default function InvitationEffect({ invited }: { invited: boolean }) {
  useEffect(() => {
    if (!invited) return
    fetch('/api/admin/invitations/accept', { method: 'POST' }).catch(() => {})
  }, [invited])
  return null
}