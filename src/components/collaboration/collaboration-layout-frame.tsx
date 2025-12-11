"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header/header";
import Footer from "@/components/layout/footer";

export function CollaborationLayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard =
    pathname === "/collaboration/dashboard" ||
    pathname?.startsWith("/collaboration/dashboard/");

  if (isDashboard) {
    // Untuk dashboard kolaborasi, biarkan shell admin (CollaborationShell/SettingShell)
    // mengatur layout penuh tanpa header/footer marketing collaboration.
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-900 lg:bg-background-deep relative overflow-hidden">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-noise-overlay z-0" />

      {/* Ambient Glows */}
      <div className="hidden lg:block absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-glow-primary rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="hidden lg:block absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-glow-secondary rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Spotlight Stage Overlay */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_-20%,rgba(135,19,155,0.25)_0%,rgba(135,19,155,0.12)_30%,transparent_60%)]" />
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_0%,rgba(249,142,95,0.18)_0%,rgba(249,142,95,0.08)_35%,transparent_55%)]" />
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_100%,rgba(171,30,126,0.15)_0%,transparent_40%)]" />

      {/* Subtle particles overlay */}
      <div
        className="hidden lg:block absolute inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Grid Pattern Overlay - Collaboration Theme (Brand Burgundy & Orange) */}
      <svg
        className="hidden lg:block absolute inset-0 z-0 w-full h-full opacity-[0.20] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="collaboration-grid-pattern"
            width="300"
            height="300"
            patternUnits="userSpaceOnUse"
          >
            {/* Row 1 - Brand Dominant */}
            <rect x="0" y="0" width="100" height="100" fill="#87139b" opacity="0.4" />
            <rect x="100" y="0" width="100" height="100" fill="#ab1e7e" opacity="0.35" />
            <rect x="200" y="0" width="100" height="100" fill="#f98e5f" opacity="0.3" />

            {/* Row 2 - Deep Tones with Blue Accent */}
            <rect x="0" y="100" width="100" height="100" fill="#5a2a5a" opacity="0.35" />
            <rect x="100" y="100" width="100" height="100" fill="#1e3a8a" opacity="0.3" />
            <rect x="200" y="100" width="100" height="100" fill="#87139b" opacity="0.3" />

            {/* Row 3 - Vibrant Mix */}
            <rect x="0" y="200" width="100" height="100" fill="#ab1e7e" opacity="0.3" />
            <rect x="100" y="200" width="100" height="100" fill="#f98e5f" opacity="0.35" />
            <rect x="200" y="200" width="100" height="100" fill="#87139b" opacity="0.4" />

            {/* Grid lines */}
            <path
              d="M100,0 L100,300 M200,0 L200,300 M0,100 L300,100 M0,200 L300,200"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </pattern>

          {/* Vertical Fade Mask */}
          <mask id="collaboration-vertical-fade-mask">
            <linearGradient
              id="collaboration-vertical-fade-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="black" />
              <stop offset="15%" stopColor="white" stopOpacity="0.3" />
              <stop offset="35%" stopColor="white" />
              <stop offset="65%" stopColor="white" />
              <stop offset="85%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="black" />
            </linearGradient>
            <rect width="100%" height="100%" fill="url(#collaboration-vertical-fade-gradient)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#collaboration-grid-pattern)"
          mask="url(#collaboration-vertical-fade-mask)"
        />
      </svg>

      <Header />
      <main className="flex-1 relative z-10 py-4 md:py-12 lg:py-12 flex flex-col">
        <div className="container mx-auto px-4">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
