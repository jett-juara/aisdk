'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthShell } from '@/components/auth/auth-shell'
import { Button } from '@/components/ui/button'
import { HeaderLogo } from '@/components/layout/header/logo'

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
    <>
      {/* Mobile/Tablet: gunakan AuthShell agar konsisten dengan login */}
      <div className="lg:hidden">
        <AuthShell
          title="Email terverifikasi"
          subtitle="Akun And sudah aktif. Silakan login."
          left={
            <div className="space-y-6">
              <Button asChild className="w-full h-12 font-heading text-lg sm:text-xl bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide rounded-lg transition-all duration-500 ease-out">
                <Link href="/auth/login">Ke halaman login</Link>
              </Button>
            </div>
          }
          right={null}
        />
      </div>

      {/* Desktop: tampilkan sebagai card terpusat seperti forgot-password desktop */}
      <section className="hidden lg:block bg-background-800 min-h-screen">
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-xl border border-input-border-800 bg-background-900 p-6 md:p-8 shadow-xs">
            {/* Logo */}
            <div className="mb-6 h-10 flex items-center">
              <HeaderLogo />
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="font-heading font-bold text-2xl text-text-200">Email terverifikasi</h1>
              <p className="mt-2 font-body text-xl text-text-50">Akun lo sudah aktif. Silakan login.</p>
            </div>

            <div className="space-y-6">
              <Button asChild className="w-full h-12 font-heading text-lg bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide rounded-lg transition-all duration-500 ease-out">
                <Link href="/auth/login">Ke halaman login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <>
        <div className="lg:hidden">
          <AuthShell
            title="Memverifikasi..."
            subtitle="Mohon tunggu"
            left={<div />}
            right={null}
          />
        </div>
        <section className="hidden lg:block bg-background-800 min-h-screen">
          <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md rounded-xl border border-input-border-800 bg-background-900 p-6 md:p-8 shadow-xs">
              <div className="mb-2 h-10 flex items-center">
                <HeaderLogo />
              </div>
              <h1 className="font-heading font-bold text-2xl text-text-200">Memverifikasi...</h1>
            </div>
          </div>
        </section>
      </>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
