"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomepageSection = () => {
  const [isReady, setIsReady] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-auth-bg-form">
      {/* Background Image */}
      <div className="absolute inset-0 bg-auth-bg-form">
        {/* Mobile background image */}
        <Image
          src="/images/hero_03-mobile.webp"
          alt="JUARA Off The Grid"
          fill
          priority
          sizes="100vw"
          quality={90}
          placeholder="empty"
          className="object-cover md:hidden"
          style={{
            objectPosition: 'center',
            objectFit: 'cover'
          }}
          onLoadingComplete={() => setIsReady(true)}
        />
        {/* Desktop/Tablet background image */}
        <Image
          src="/images/hero_03-xlarge.webp"
          alt="JUARA Off The Grid"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1920px) 100vw, 100vw"
          quality={90}
          placeholder="empty"
          className="hidden md:block object-cover"
          style={{
            objectPosition: 'center',
            objectFit: 'cover'
          }}
          onLoadingComplete={() => setIsReady(true)}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Main Content (render only when ready) */}
      {isReady && (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid container untuk menyusun teks di kiri */}
          <div className="grid grid-cols-12 items-start md:items-center">
            <div className="col-span-12 md:col-span-6 pt-0 pb-16 relative min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh]">
              {/* SVG Overlay saja sesuai permintaan */}
              <div className="pointer-events-none absolute top-0 z-20 flex w-full left-0 justify-start md:left-auto md:right-0 md:justify-end">
                <img
                  src="/images/off-the-grid.svg"
                  alt=""
                  aria-hidden="true"
                  className="w-full max-w-[30vh] md:max-w-[45vh] h-auto select-none"
                />
              </div>
            </div>
            {/* Subheading + CTA di atas footer, center */}
            <div className="col-span-12 absolute left-0 right-0 bottom-6 md:bottom-10 lg:bottom-12 flex flex-col items-center px-4">
              <p className="text-center font-body text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] text-base sm:text-lg md:text-xl">
                Extraordinary events beyond boundaries.
              </p>
              <div className="mt-3 sm:mt-4 flex items-center gap-3">
                <Link href="#">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-sm md:text-lg font-semibold tracking-wide transition-all h-10 px-6 md:h-11 md:px-8"
                  >
                    Chat with JETT
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-sm md:text-lg font-semibold tracking-wide transition-all h-10 px-6 md:h-11 md:px-8"
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
