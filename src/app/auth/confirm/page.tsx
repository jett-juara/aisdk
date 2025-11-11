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
    <section className="bg-auth-bg-form min-h-screen">
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="font-heading text-[24px] text-[var(--color-auth-text-primary)]">Email terverifikasi</h1>
          <p className="font-body text-[16px] text-[var(--color-auth-text-muted)]">Akun kamu sudah aktif. Silakan login.</p>
          <a href="/auth/login" className="underline transition-colors text-[var(--color-auth-text-secondary)] hover:text-[var(--color-auth-text-primary)]">
            Kembali ke halaman login
          </a>
        </div>
      </div>
    </section>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <section className="bg-auth-bg-form min-h-screen">
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="w-full max-w-md space-y-4 text-center">
            <h1 className="font-heading text-[24px] text-[var(--color-auth-text-primary)]">Memverifikasi...</h1>
          </div>
        </div>
      </section>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
