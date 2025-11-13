'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeaderLogo } from '@/components/layout/header/logo'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const title = "Email terverifikasi"
  const subtitle = "Akun Anda sudah aktif. Silakan login."

  useEffect(() => {
    if (searchParams.get('invited') !== null) {
      fetch('/api/admin/invitations/accept', { method: 'POST' }).catch(() => {
        /* silently ignore */
      })
    }
  }, [searchParams])

  return (
    <section className="bg-background-800 md:bg-background-800 lg:bg-background-900 min-h-screen">
      {/* Mobile & Tablet Layout - Tanpa Card */}
      <div className="lg:hidden min-h-screen flex flex-col px-4 py-6 px-6 md:px-8">
        {/* Logo untuk mobile & tablet */}
        <div className="h-10 flex items-center">
          <HeaderLogo />
        </div>

        {/* Header + Button dalam satu container untuk mobile & tablet */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-full mx-auto w-full space-y-8">
            {/* Header menggunakan auth-shell pattern */}
            {(title || subtitle) && (
              <div className="text-center mx-auto w-[90%] md:w-[60%]">
                {title && (
                  <h1 className="font-heading font-semibold text-3xl md:text-5xl tracking-tighter text-text-200">{title}</h1>
                )}
                {subtitle && (
                  <p className="mt-0 font-subheading text-lg md:text-2xl md:mt-2 text-text-50">{subtitle}</p>
                )}
              </div>
            )}

            {/* Button */}
            <div className="flex justify-center">
            <Button asChild className="px-8 md:px-10 lg:px-8 font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10">
              <Link href="/auth">Ke halaman login</Link>
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Card Design */}
      <div className="hidden lg:flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-input-border-800 bg-background-800 lg:p-6">
          {/* Logo */}
          <div className="mb-6 h-10 flex items-center">
            <HeaderLogo />
          </div>

          {/* Header menggunakan auth-shell pattern */}
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && (
                <h1 className="font-heading font-semibold lg:text-3xl tracking-tighter text-text-200">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-0 font-subheading lg:text-md lg:mt-0 text-text-50">{subtitle}</p>
              )}
            </div>
          )}

          {/* Button */}
          <div className="flex justify-center">
          <Button asChild className="px-8 md:px-10 lg:px-8 font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10">
            <Link href="/auth">Login</Link>
          </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <>
        <div className="lg:hidden">
          <section className="bg-background-900 min-h-screen flex flex-col px-4 py-6 px-6 md:px-8">
            <div className="h-10 flex items-center">
              <HeaderLogo />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="max-w-full mx-auto w-full space-y-8">
                <div className="text-left mx-auto w-[80%] md:w-[60%]">
                  <h1 className="font-heading font-semibold text-3xl md:text-5xl tracking-tighter text-text-200">Memverifikasi...</h1>
                  <p className="mt-0 font-subheading text-lg md:text-2xl md:mt-2 text-text-50">Mohon tunggu</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        <section className="hidden lg:block bg-background-800 min-h-screen">
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-input-border-800 bg-background-800 lg:p-6">
              <div className="mb-6 h-10 flex items-center">
                <HeaderLogo />
              </div>
              <h1 className="font-heading font-semibold lg:text-3xl tracking-tighter text-text-200">Memverifikasi...</h1>
            </div>
          </div>
        </section>
      </>
    }>
      <ConfirmContent />
    </Suspense>
  )
}