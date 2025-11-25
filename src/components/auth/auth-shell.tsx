import { HeaderLogo } from "@/components/layout/header/logo";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { TestimonialGridBackground } from "@/components/auth/testimonial-grid-background";
import type React from "react";

interface AuthShellProps {
  title?: string;
  subtitle?: string;
  stepIndicator?: string;
  left: React.ReactNode; // form content
  right: React.ReactNode; // testimonial/content
}

export function AuthShell({ title, subtitle, stepIndicator, left, right }: AuthShellProps) {
  return (
    <section className="bg-background-900 min-h-screen">
      <div className="flex min-h-screen">
        {/* Left: Form */}
        <div className="bg-background-800 w-full lg:w-2/6 flex flex-col justify-between">
          {/* Header-aligned logo */}
          <div className="mx-auto flex h-20 items-center justify-between px-4 w-full">
            <HeaderLogo size="sm" className="md:hidden" />
            <HeaderLogo size="md" className="hidden md:flex lg:hidden" />
            <HeaderLogo size="lg" className="hidden lg:flex" />
          </div>

          {/* Form Section */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="px-0 md:px-6 lg:px-8">
              <div className="mx-auto w-[90%] md:w-[60%] lg:w-full lg:max-w-[640px]">
                {(title || subtitle) && (
                  <div className="mb-6">
                    {title && (
                      <div className="flex items-center justify-between gap-4">
                        <h1 className="font-headingSecondary font-bold text-3xl md:text-5xl lg:text-5xl tracking-tighter text-premium-gradient leading-[1.1] pb-[0.1em]">
                          {title}
                        </h1>
                      </div>
                    )}
                    {subtitle && (
                      <p className="mt-0 font-subheading text-lg md:text-2xl md:mt-2 lg:text-[1.2rem] lg:mt-2 text-text-50">{subtitle}</p>
                    )}
                    {stepIndicator && (
                      <div className="mt-4 flex justify-end justify-end">
                        <span className="text-text-200 text-sm md:text-base lg:text-sm font-medium px-3 py-1 rounded-full bg-glass-bg border border-glass-border backdrop-blur-md whitespace-nowrap">
                          {stepIndicator}
                        </span>
                      </div>
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
        <div className="hidden lg:flex w-4/6 flex-col justify-between pb-16 bg-background-900 relative overflow-hidden">
          <TestimonialGridBackground />
          {/* Top bar on testimonial side, align with header spacing like logo */}
          <div className="flex h-16 lg:h-24 items-center justify-end lg:px-4 relative z-10">
            <Button className="gap-2 w-[220px] font-button font-medium text-sm bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50 rounded-full h-11 hover:scale-105 transition-all duration-300">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Partnership Guide
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center px-8 relative z-10">
            {right}
          </div>
        </div>
      </div>
    </section>
  );
}
