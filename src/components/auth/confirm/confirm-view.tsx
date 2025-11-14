import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeaderLogo } from '@/components/layout/header/logo'

export default function ConfirmView({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="bg-background-800 md:bg-background-800 lg:bg-background-900 min-h-screen">
      <div className="lg:hidden min-h-screen flex flex-col px-4 py-6 px-6 md:px-8">
        <div className="h-10 flex items-center">
          <HeaderLogo size="lg" />
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-full mx-auto w-full space-y-8">
            {(title || subtitle) && (
              <div className="text-center mx-auto w-[90%] md:w-[60%]">
                {title && (
                  <h1 className="font-heading font-semibold text-2xl md:text-4xl tracking-tighter text-text-200">{title}</h1>
                )}
                {subtitle && (
                  <p className="mt-0 font-subheading text-md md:text-xl md:mt-2 text-text-50">{subtitle}</p>
                )}
              </div>
            )}
            <div className="flex justify-center">
              <Button asChild className="px-8 md:px-10 lg:px-8 font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10">
                <Link href="/auth/login">Kembali ke halaman login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-input-border-800 bg-background-800 lg:p-6">
          <div className="h-8 mb-4 flex items-center">
            <HeaderLogo size="sm" />
          </div>
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && (
                <h1 className="font-heading font-semibold lg:text-2xl tracking-tighter text-text-200">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-0 font-subheading lg:text-sm lg:mt-0 text-text-50">{subtitle}</p>
              )}
            </div>
          )}
          <div className="flex justify-center">
            <Button asChild className="px-8 md:px-10 lg:px-8 font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10">
              <Link href="/auth/login">Kembali ke halaman login</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}