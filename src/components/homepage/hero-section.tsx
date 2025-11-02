import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { HeroMetric, HeroSectionProps } from "./types";

const DEFAULT_METRICS: HeroMetric[] = [
  { value: "500+", label: "Events Created" },
  { value: "50K+", label: "Happy Guests" },
  { value: "100+", label: "Partner Venues" },
];

const HeroSection = ({ metrics = DEFAULT_METRICS }: HeroSectionProps) => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero_03.png"
          alt="JUARA Off The Grid"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 100vw"
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 py-16 text-center sm:px-6 md:items-start md:py-20 md:text-left lg:px-8">
        <div className="flex flex-col items-center gap-8 md:items-start">
          {/* Main Headline */}
          <h1 className="font-heading text-3xl font-bold tracking-[0.18em] text-auth-text-primary drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-4xl sm:tracking-[0.22em] md:text-5xl md:tracking-[0.26em] lg:text-6xl lg:tracking-[0.3em] xl:text-7xl">
            <span className="block leading-tight">OFF THE GRID</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-auth-text-primary drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-lg md:mx-0 md:text-xl">
            Extraordinary events beyond boundaries. JUARA creates unforgettable experiences
            where creativity meets technology in the most unexpected places.
          </p>

          {/* Call to Action */}
          <div className="flex flex-col items-center gap-4 pt-6 md:flex-row md:items-center md:justify-start md:pt-8">
            <Link href="/about">
              <Button
                size="lg"
                className="min-h-[48px] rounded-lg bg-[color:var(--color-auth-button-brand)] px-7 py-4 font-heading text-base font-semibold text-auth-text-primary transition-transform duration-300 hover:scale-105 hover:shadow-xl focus-visible:scale-105 focus-visible:shadow-xl md:text-lg"
              >
                Getting Started
              </Button>
            </Link>
          </div>

          {/* Additional Trust Indicators */}
          <div className="mx-auto grid w-full max-w-2xl gap-6 pt-12 sm:grid-cols-2 md:mx-0 lg:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-white/10 bg-black/25 px-4 py-5 text-center backdrop-blur-sm"
              >
                <div className="mb-2 font-heading text-2xl font-bold text-auth-text-primary sm:text-3xl md:text-4xl">
                  {metric.value}
                </div>
                <div className="font-body text-xs uppercase tracking-[0.22em] text-auth-text-muted sm:text-sm">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 transform md:bottom-8">
        <div className="flex h-12 w-8 animate-bounce justify-center rounded-full border-2 border-auth-text-primary">
          <div className="mt-2 h-3 w-1 animate-pulse rounded-full bg-auth-text-primary" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
