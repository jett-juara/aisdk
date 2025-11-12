import { HeaderLogo } from "@/components/layout/header/logo";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import type React from "react";

interface AuthShellProps {
  title?: string;
  subtitle?: string;
  left: React.ReactNode; // form content
  right: React.ReactNode; // testimonial/content
}

export function AuthShell({ title, subtitle, left, right }: AuthShellProps) {
  return (
    <section className="bg-background-900 min-h-screen">
      <div className="flex min-h-screen">
        {/* Left: Form */}
        <div className="bg-background-900 w-full md:w-2/5 flex flex-col justify-between px-4 lg:px-6 md:px-16 pb-8 md:pb-16">
          {/* Header-aligned logo */}
          <div className="flex h-16 items-center px-4 sm:px-6 md:px-16">
            <HeaderLogo />
          </div>

          {/* Form Section */}
          <div className="flex-1 flex flex-col justify-center">
            {(title || subtitle) && (
              <div className="mb-8 px-4 md:px-16">
                {title && (<h1 className="font-heading font-bold text-3xl md:text-5xl text-text-200">{title}</h1>)}
                {subtitle && (<p className="font-body text-lg md:text-xl text-text-50">{subtitle}</p>)}
              </div>
            )}
            <div className="px-4 sm:px-6 md:px-16">
              {left}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1 font-body text-sm sm:text-base md:text-lg text-text-200 px-4 sm:px-6 md:px-16">
            <p>
              Dengan melanjutkan, Anda setuju dengan seluruh{' '}
              <a href="#" className="text-text-200 hover:text-text-50 underline transition-colors">
                kebijakan layanan & privasi
              </a>{' '}
              dari Juara, serta menerima email pembaharuan berkala
            </p>
          </div>
        </div>

        {/* Right: Testimonial */}
        <div className="hidden md:flex w-3/5 flex-col justify-between pb-16 bg-background-800">
          {/* Top bar on testimonial side, align with header spacing like logo */}
          <div className="flex h-16 items-center justify-end px-16">
            <Button className="gap-2 font-body text-lg bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Company Profile
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center px-16">
            {right}
          </div>
        </div>
      </div>
    </section>
  );
}
