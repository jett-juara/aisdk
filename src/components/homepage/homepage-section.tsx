import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const HomepageSection = () => {
  const SOCIAL_LINKS = [
    { icon: Facebook, label: "Facebook", href: "https://facebook.com/juara" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com/juara" },
    { icon: Twitter, label: "Twitter", href: "https://x.com/juara" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/juara" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero_03.png"
          alt="JUARA Off The Grid"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main Content */}
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
                className="min-h-[56px] rounded-lg bg-white text-black px-8 py-4 font-heading text-lg font-semibold transition-all duration-200 hover:scale-[1.02] focus-visible:scale-[1.02]"
              >
                Getting Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Overlay - Di atas background */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-t border-white/20 pt-8">
            <div className="flex items-center justify-between text-white">
              {/* Copyright */}
              <div className="text-sm text-white/70">
                © {new Date().getFullYear()} JUARA Events. All rights reserved.
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white/90 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageSection;