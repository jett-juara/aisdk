"use client";

import { useState } from "react";
import { useHomepageAnimations } from "@/hooks/use-homepage-animations";
import Image from "next/image";
import Link from "next/link";
import { Users, Handshake, MessageSquare } from "lucide-react";

const Hero47 = () => {
  // Initialize homepage animations
  const { getClasses } = useHomepageAnimations()
  const animationClasses = getClasses()
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const ctaItems = [
    {
      id: 1,
      label: "Who We Are",
      href: "/about",
      icon: Users,
    },
    {
      id: 2,
      label: "Collaborate",
      href: "#",
      icon: Handshake,
    },
    {
      id: 3,
      label: "Chat JETT",
      href: "#",
      icon: MessageSquare,
    },
  ];

  return (
    <section className="relative w-full h-full flex items-start lg:items-center justify-center">
      <div className="w-full max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-8 flex flex-col lg:flex-row items-start lg:items-stretch h-full gap-8 lg:gap-16">

        {/* Left Section (50%) - SVG Headline */}
        <div className="lg:w-1/2 flex justify-start lg:justify-end items-center lg:pr-12 lg:items-center pt-0 md:pt-0 lg:pt-0">
          <div className={`w-[45vh] min-[375px]:w-[35vh] min-[360px]:w-[35vh] md:w-[40vh] px-4 relative lg:w-[55vh] flex-shrink-0 transition-all duration-700 ease-out transform-gpu ${animationClasses.svg}`}>
            {/* Spacer Image - Invisible but sets the size correctly */}
            <Image
              src="/images/home-hero/off-the-grid-headline.svg"
              alt="Off The Grid"
              width={500}
              height={200}
              className="w-full h-auto opacity-0 pointer-events-none"
              priority
            />

            {/* Creative Gradient Mask Layer - Absolutely positioned over the spacer */}
            <div className="absolute inset-0 hero-headline-creative" role="img" aria-label="Off The Grid" />
          </div>
        </div>

        {/* Right Section (50%) - Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start lg:justify-center text-left gap-10 lg:gap-10 px-4 lg:px-0 pt-2 md:pt-2 pb-0 lg:pb-0 lg:pt-0">

          {/* Combined Content Block */}
          <div className={`flex flex-col gap-10 lg:gap-8 w-full lg:pl-32 lg:w-[90%] transition-all duration-700 ease-out delay-100 ${animationClasses.text}`}>
            <div className="flex flex-col gap-2 md:w-[60%] lg:w-full">
              {/* Mobile & Tablet Text (Shortened) */}
              <div className="block lg:hidden">
                <h2 className="font-subheading font-medium text-text-100 text-lg md:text-2xl leading-tight mb-0">
                  We are forged by challenges to reach the highest peaks.
                </h2>
              </div>

              {/* Desktop Text (Full) */}
              <div className="hidden lg:block lg:w-[100%]">
                <h2 className="font-subheading font-medium text-text-100 text-lg md:text-lg lg:text-md lg:mb-4 leading-tight ">
                  We are forged by challenges and struggles for a long period of time to become a skilled and trained team to reach the highest peaks.
                </h2>
                <p className="font-body font-medium text-text-100 text-lg md:text-lg lg:text-sm leading-tight">
                  Meet JETT, our AI agent that complements our technology and is ready to discuss everything about Juara. Be part of our ecosystem by joining our network of excellence—we invite vendors and talents to collaborate by creating an account.
                </p>
              </div>
            </div>

            {/* Card CTAs */}
            <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-4 md:gap-4 w-full">
              {ctaItems.map((item) => {
                const isHovered = hoveredId === item.id
                const isAnyHovered = hoveredId !== null
                const scaleClass = isHovered
                  ? "scale-[1.09] opacity-100 z-10"
                  : isAnyHovered
                    ? "scale-95 opacity-60 blur-[1px]"
                    : "scale-100 opacity-100"

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`group relative rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer h-16 min-[380px]:h-24 md:h-28 lg:h-32 glass-card shadow-xl focus:outline-none focus-visible:outline-none transition-all duration-500 ease-out transform-gpu ${scaleClass}`}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={(e) => {
                      if (item.href === "#") {
                        e.preventDefault()
                      }
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-glass-bg-hover to-transparent" />

                    <div className="absolute inset-0 flex flex-col justify-between p-3 lg:p-2">
                      <div className="flex justify-end">
                        <div className="p-1 lg:p-2 rounded-full bg-glass-bg border border-glass-border group-hover:bg-glass-bg-hover transition-colors duration-300">
                          <item.icon className="h-4 w-4 lg:h-8 lg:w-8 md:h-8 md:w-8 text-text-50 opacity-80 group-hover:text-text-50 group-hover:opacity-100 transition-colors duration-300" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm md:text-xl lg:text-base font-medium text-text-50 tracking-wide group-hover:text-text-50 transition-colors duration-300 leading-tight">
                          {item.label}
                        </h3>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export { Hero47 };
