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
        <Image
          src="/images/hero_03.webp"
          alt="JUARA Off The Grid"
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, (max-width: 1920px) 100vw, 100vw"
          quality={90}
          placeholder="empty"
          className="object-cover"
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
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center gap-8 py-16">
          {/* Main Headline */}
          <h1 className="font-heading text-4xl font-bold tracking-[0.18em] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-5xl sm:tracking-[0.22em] md:text-6xl md:tracking-[0.26em] lg:text-7xl lg:tracking-[0.3em]">
            <span className="block leading-tight">OFF THE GRID</span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl font-body text-lg leading-relaxed text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-xl md:text-2xl">
            Extraordinary events beyond boundaries.
          </p>

          {/* Call to Action */}
          <div className="pt-8">
            <Link href="/about">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-lg font-semibold tracking-wide transition-all"
              >
                Getting Started
              </Button>
            </Link>
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
