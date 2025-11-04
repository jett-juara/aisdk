"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomepageSection = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <section className="absolute inset-0 flex items-center justify-center overflow-hidden bg-auth-bg-form">
      {/* Background Images for 3 Breakpoints */}
      <div className="absolute inset-0 bg-auth-bg-form">
        {/* Mobile: < 768px */}
        <Image
          src="/images/hero_03-mobile.webp"
          alt="JUARA Off The Grid"
          fill
          priority
          sizes="100vw"
          quality={90}
          placeholder="empty"
          className="object-cover block md:hidden"
          style={{
            objectPosition: 'center',
            objectFit: 'cover'
          }}
          onLoad={() => setIsReady(true)}
        />

        {/* Tablet: 768px - 1024px */}
        <Image
          src="/images/hero_03-tablet.webp"
          alt="JUARA Off The Grid"
          fill
          priority
          sizes="100vw"
          quality={90}
          placeholder="empty"
          className="hidden md:block lg:hidden object-cover"
          style={{
            objectPosition: 'center',
            objectFit: 'cover'
          }}
          onLoad={() => setIsReady(true)}
        />

        {/* Desktop: > 1024px */}
        <Image
          src="/images/hero_03-xlarge.webp"
          alt="JUARA Off The Grid"
          fill
          priority
          sizes="100vw"
          quality={90}
          placeholder="empty"
          className="hidden lg:block object-cover"
          style={{
            objectPosition: 'center',
            objectFit: 'cover'
          }}
          onLoad={() => setIsReady(true)}
        />

        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Content - Mobile Layout (< 768px) */}
      {isReady && (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="flex w-full flex-col gap-3 md:hidden">
            <div className="pointer-events-none flex self-start translate-y-2">
              <img
                src="/images/off-the-grid.svg"
                alt=""
                aria-hidden="true"
                className="h-auto w-[50vw] max-w-[80vw] select-none"
              />
            </div>

            <div className="flex flex-col items-center space-y-3 px-4">
              <p className="text-center font-body text-white/90 text-base sm:text-lg">
                Extraordinary events beyond boundaries.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link href="#">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-sm font-semibold tracking-wide transition-all h-10 px-6 w-full sm:w-auto"
                  >
                    Chat with JETT
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-sm font-semibold tracking-wide transition-all h-10 px-6 w-full sm:w-auto"
                  >
                    Getting Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Tablet Layout (768px - 1024px) */}
          <div className="hidden md:flex lg:hidden w-full flex-col items-center">
            <div className="pointer-events-none flex w-[50vw] self-start -translate-y-2">
              <img
                src="/images/off-the-grid.svg"
                alt=""
                aria-hidden="true"
                className="h-auto w-full max-w-[90vw] select-none"
              />
            </div>

            <div className="flex flex-col items-center space-y-4 px-4 -mt-4">
              <p className="text-center font-body text-white/90 text-xl">
                Extraordinary events beyond boundaries.
              </p>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <Link href="#">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-base font-semibold tracking-wide transition-all h-11 px-7 w-full md:w-auto"
                  >
                    Chat with JETT
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-base font-semibold tracking-wide transition-all h-11 px-7 w-full md:w-auto"
                  >
                    Getting Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Layout (> 1024px) */}
          <div className="hidden lg:flex w-full flex-col items-center">
            <div className="pointer-events-none flex w-[43vw] justify-end self-start translate-y-2">
              <img
                src="/images/off-the-grid.svg"
                alt=""
                aria-hidden="true"
                className="h-auto w-full max-w-[380px] select-none"
              />
            </div>

            <div className="flex flex-col items-center space-y-6 px-4 -mt-6">
              <p className="text-center font-body text-white/90 text-2xl">
                Extraordinary events beyond boundaries.
              </p>
              <div className="flex flex-row items-center gap-6">
                <Link href="#">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-lg font-semibold tracking-wide transition-all h-12 px-8"
                  >
                    Chat with JETT
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-lg font-semibold tracking-wide transition-all h-12 px-8"
                  >
                    Getting Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading UI (full overlay until image is ready) */}
      {!isReady && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-auth-bg-form">
          <div className="flex items-center gap-3 text-auth-text-secondary" aria-busy>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-body tracking-wide uppercase text-sm">Loading</span>
          </div>
        </div>
      )}

      </section>
  );
};

export default HomepageSection;