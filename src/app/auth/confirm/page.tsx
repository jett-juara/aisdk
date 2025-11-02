'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ConfirmContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('invited') !== null) {
      fetch('/api/admin/invitations/accept', { method: 'POST' }).catch(() => {
        /* silently ignore */
      })
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-heading">Email terverifikasi</h1>
        <p className="text-body">Akun kamu sudah aktif. Silakan login.</p>
        <a
          href="/auth/login"
          className="text-auth-text-secondary underline transition-colors duration-fast hover:text-auth-text-primary"
        >
          Kembali ke halaman login
        </a>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-heading">Memverifikasi...</h1>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
