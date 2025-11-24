import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeaderLogo } from '@/components/layout/header/logo'
import { AuthGridBackground } from '@/components/auth/auth-grid-background'

export default function ConfirmView({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="bg-background-800 md:bg-background-800 lg:bg-background-900 min-h-screen">
      <div className="lg:hidden min-h-screen flex flex-col px-0 py-0">
        <div className="h-20 flex items-center px-4">
          <HeaderLogo size="sm" className="md:hidden" />
          <HeaderLogo size="md" className="hidden md:flex" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-full mx-auto w-full space-y-8">
            {(title || subtitle) && (
              <div className="text-center mx-auto w-[90%] md:w-[60%]">
                {title && (
                  <h1 className="font-headingSecondary font-bold text-2xl md:text-4xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">{title}</h1>
                )}
                {subtitle && (
                  <p className="mt-0 font-subheading text-md md:text-xl md:mt-2 text-text-50">{subtitle}</p>
                )}
              </div>
            )}
            <div className="flex justify-center w-[90%] md:w-[60%] mx-auto">
              <Button asChild className="w-full font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105">
                <Link href="/auth/login">Kembali ke halaman login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex min-h-screen items-center justify-center px-4 relative overflow-hidden">
        <AuthGridBackground />
        <div className="w-full max-w-md glass-card-premium lg:p-8 z-10">
          <div className="h-8 mb-4 flex items-center justify-center">
            <HeaderLogo size="lg" />
          </div>
          {(title || subtitle) && (
            <div className="mb-8 text-center">
              {title && (
                <h1 className="font-headingSecondary font-bold lg:text-3xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-2 font-subheading lg:text-md text-text-50">{subtitle}</p>
              )}
            </div>
          )}
          <div className="flex justify-center">
            <Button asChild className="w-full font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-12 rounded-full hover:scale-105">
              <Link href="/auth/login">Kembali ke halaman login</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}