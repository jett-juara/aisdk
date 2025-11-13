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
        <div className="bg-background-800 w-full lg:w-2/6 flex flex-col justify-between">
          {/* Header-aligned logo */}
          <div className="mx-auto flex h-20 md:h-18 lg:h-20 items-center justify-between px-4 md:px-6 lg:px-8 w-full">
            <HeaderLogo />
          </div>

          {/* Form Section */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="px-4 md:px-6 lg:px-8">
              <div className="mx-auto w-[80%] md:w-[60%] lg:w-full lg:max-w-[640px]">
                {(title || subtitle) && (
                  <div className="mb-6">
                    {title && (
                      <h1 className="font-heading font-semibold text-3xl md:text-5xl lg:text-5xl tracking-tighter text-text-200">{title}</h1>
                    )}
                    {subtitle && (
                      <p className="mt-0 font-subheading text-lg md:text-2xl md:mt-2 lg:text-[1.2rem] lg:mt-0 text-text-50">{subtitle}</p>
                    )}
                  </div>
                )}
                {left}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-1 font-body text-xs mb-4 lg:text-xs md:text-lg text-text-200 px-4 sm:px-6 lg:px-8">
            <p>
              Dengan melanjutkan, Anda setuju dengan seluruh{' '}
              <a href="#" className="text-text-200 hover:text-text-50 underline transition-colors">
                kebijakan layanan & privasi
              </a>{' '}
              dari Juara, serta menerima email pembaharuan berkala
            </p>
          </div>
        </div>

        {/* Right: Testimonial (hanya tampil di desktop/lg) */}
        <div className="hidden lg:flex w-4/6 flex-col justify-between pb-16 bg-background-900">
          {/* Top bar on testimonial side, align with header spacing like logo */}
          <div className="flex h-16 lg:h-20 items-center justify-end lg:px-8">
            <Button className="gap-2 font-button font-medium text-sm bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Company Profile
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center px-8">
            {right}
          </div>
        </div>
      </div>
    </section>
  );
}
