"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useHomepageAnimations } from "@/hooks/use-homepage-animations";

const HomepageSection = () => {
  const { getClasses, prefersReducedMotion } = useHomepageAnimations();
  const classes = getClasses();

  // SVG hover handler
  const [svgHovered, setSvgHovered] = useState(false);

  return (
    <section className="relative w-full">
      {/* Main Content - Mobile Layout (< 768px) */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex w-full flex-col md:hidden">
          {/* SVG - Animation: Scale-in + Blur Clear + Hover Effects */}
          <div className="pointer-events-none flex self-start">
            <Image
              src="/images/home-hero/off-the-grid.svg"
              alt=""
              aria-hidden="true"
              width={960}
              height={540}
              priority
              sizes="(max-width: 768px) 70vw, 50vw"
              className={`homepage-svg-animation ${classes.svg} h-auto w-[50vw] max-w-[70vw] select-none ${!prefersReducedMotion && svgHovered ? 'homepage-svg-hover' : ''}`}
              onMouseEnter={() => !prefersReducedMotion && setSvgHovered(true)}
              onMouseLeave={() => !prefersReducedMotion && setSvgHovered(false)}
            />
          </div>

          <div className="flex flex-col items-center space-y-3 px-4 pb-8">
            <p className={`homepage-text-animation ${classes.text} text-center font-body text-white/90 text-base sm:text-lg`}>
              Extraordinary events beyond boundaries.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href="#">
                <Button
                  size="lg"
                  className={`homepage-button-animation ${classes.button1} bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-sm font-semibold tracking-wide h-10 px-6 w-full sm:w-auto`}
                >
                  Chat with JETT
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  className={`homepage-button-animation ${classes.button2} bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-sm font-semibold tracking-wide h-10 px-6 w-full sm:w-auto`}
                >
                  Getting Started
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tablet Layout (768px - 1024px) */}
        <div className="hidden md:flex lg:hidden w-full flex-col items-center">
          {/* SVG - Animation: Scale-in + Blur Clear + Hover Effects */}
          <div className="pointer-events-none flex w-[50vw] self-start">
            <Image
              src="/images/home-hero/off-the-grid.svg"
              alt=""
              aria-hidden="true"
              width={960}
              height={540}
              sizes="(max-width: 1024px) 90vw"
              className={`homepage-svg-animation ${classes.svg} h-auto w-full max-w-[90vw] select-none ${!prefersReducedMotion && svgHovered ? 'homepage-svg-hover' : ''}`}
              onMouseEnter={() => !prefersReducedMotion && setSvgHovered(true)}
              onMouseLeave={() => !prefersReducedMotion && setSvgHovered(false)}
            />
          </div>

          <div className="flex flex-col items-center space-y-4 px-4 pb-8">
            <p className={`homepage-text-animation ${classes.text} text-center font-body text-white/90 text-xl`}>
              Extraordinary events beyond boundaries.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Link href="#">
                <Button
                  size="lg"
                  className={`homepage-button-animation ${classes.button1} bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-base font-semibold tracking-wide h-11 px-7 w-full md:w-auto`}
                >
                  Chat with JETT
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  className={`homepage-button-animation ${classes.button2} bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-base font-semibold tracking-wide h-11 px-7 w-full md:w-auto`}
                >
                  Getting Started
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Layout (> 1024px) */}
        <div className="hidden lg:flex w-full flex-col items-center">
          {/* SVG - Animation: Scale-in + Blur Clear + Hover Effects */}
          <div className="pointer-events-none flex w-[43vw] justify-end self-start">
            <Image
              src="/images/home-hero/off-the-grid.svg"
              alt=""
              aria-hidden="true"
              width={960}
              height={540}
              sizes="(min-width: 1024px) 24vw"
              className={`homepage-svg-animation ${classes.svg} h-auto w-full max-w-[24vw] select-none ${!prefersReducedMotion && svgHovered ? 'homepage-svg-hover' : ''}`}
              onMouseEnter={() => !prefersReducedMotion && setSvgHovered(true)}
              onMouseLeave={() => !prefersReducedMotion && setSvgHovered(false)}
            />
          </div>

          <div className="flex flex-col items-center space-y-6 px-4 pb-8">
            <p className={`homepage-text-animation ${classes.text} text-center font-body text-white/90 text-2xl`}>
              Extraordinary events beyond boundaries.
            </p>
            <div className="flex flex-row items-center gap-6">
              <Link href="#">
                <Button
                  size="lg"
                  className={`homepage-button-animation ${classes.button1} bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-lg font-semibold tracking-wide h-12 px-8`}
                >
                  Chat with JETT
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  className={`homepage-button-animation ${classes.button2} bg-white text-black hover:bg-white/90 focus:bg-white/90 font-heading text-lg font-semibold tracking-wide h-12 px-8`}
                >
                  Getting Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageSection;
