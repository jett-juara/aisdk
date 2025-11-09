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
      <div className="flex w-full flex-col sm:hidden md:hidden">
        {/* Kiri - SVG & Content Container */}
        <div className="w-[55vw] xxs:w-[60vw] xs:w-[65vw] flex flex-col justify-center h-full max-h-[calc(100vh-88px)]">
          {/* SVG - Animation: Scale-in + Blur Clear + Hover Effects */}
          <div className="pointer-events-none mb-2 flex justify-end">
            <Image
              src="/images/home-hero/off-the-grid.svg"
              alt=""
              aria-hidden="true"
              width={960}
              height={540}
              priority
              sizes="(max-width: 768px) 50vw"
              className={`homepage-svg-animation ${classes.svg} h-auto select-none ${!prefersReducedMotion && svgHovered ? 'homepage-svg-hover' : ''}`}
              style={{ width: '50vw', height: 'auto' }}
              onMouseEnter={() => !prefersReducedMotion && setSvgHovered(true)}
              onMouseLeave={() => !prefersReducedMotion && setSvgHovered(false)}
            />
          </div>

          {/* Subheading & CTA */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-end">
              <div className="w-full max-w-[50vw] xxs:max-w-[60vw] xs:max-w-[65vw]">
                <p className={`homepage-text-animation ${classes.text} text-right font-body text-white/90 text-lg leading-relaxed`}>
                  Extraordinary events beyond boundaries.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="flex flex-col space-x-0 space-y-4 w-full max-w-[50vw] xxs:max-w-[60vw] xs:max-w-[65vw]">
                <Link href="#">
                  <Button
                                        className={`homepage-button-animation ${classes.button1} bg-transparent text-white border border-button-border hover:bg-button-border focus:bg-button-border font-heading text-sm font-semibold tracking-wide px-6 w-full rounded-lg`}
                    style={{ height: 'var(--size-home-button-md)' }}
                  >
                    Chat with JETT
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                                        className={`homepage-button-animation ${classes.button2} bg-transparent text-white border border-button-border hover:bg-button-border focus:bg-button-border font-heading text-sm font-semibold tracking-wide px-6 w-full rounded-lg`}
                    style={{ height: 'var(--size-home-button-md)' }}
                  >
                    Getting Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Kanan - Empty Space */}
        <div className="flex-1 h-full">
          {/* Empty luxury space */}
        </div>
      </div>

      {/* Tablet Layout (768px - 1024px) */}
      <div className="hidden sm:flex md:flex lg:hidden w-full h-full">
        {/* Kiri - SVG & Content Container */}
        <div className="w-[55vw] sm:w-[50vw] flex flex-col justify-center h-full max-h-[calc(100vh-88px)]">
          {/* SVG - Animation: Scale-in + Blur Clear + Hover Effects */}
          <div className="pointer-events-none mb-4 flex justify-end">
            <Image
              src="/images/home-hero/off-the-grid.svg"
              alt=""
              aria-hidden="true"
              width={960}
              height={540}
              sizes="(max-width: 1024px) 45vw"
              className={`homepage-svg-animation ${classes.svg} h-auto select-none ${!prefersReducedMotion && svgHovered ? 'homepage-svg-hover' : ''}`}
              style={{ width: '45vw', height: 'auto' }}
              onMouseEnter={() => !prefersReducedMotion && setSvgHovered(true)}
              onMouseLeave={() => !prefersReducedMotion && setSvgHovered(false)}
            />
          </div>

          {/* Subheading & CTA */}
          <div className="flex flex-col space-y-4">
            <div className="flex justify-end">
              <div className="w-full max-w-[45vw] sm:max-w-[50vw]">
                <p className={`homepage-text-animation ${classes.text} text-right font-body text-white/90 text-xl leading-relaxed`}>
                  Extraordinary events beyond boundaries.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col space-x-0 space-y-4 w-full max-w-[45vw] sm:max-w-[50vw]">
                <Link href="#">
                  <Button
                                        className={`homepage-button-animation ${classes.button1} bg-transparent text-white border border-button-border hover:bg-button-border focus:bg-button-border font-heading text-sm font-semibold tracking-wide px-6 w-full rounded-lg`}
                    style={{ height: 'var(--size-home-button-md)' }}
                  >
                    Chat with JETT
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                                        className={`homepage-button-animation ${classes.button2} bg-transparent text-white border border-button-border hover:bg-button-border focus:bg-button-border font-heading text-sm font-semibold tracking-wide px-6 w-full rounded-lg`}
                    style={{ height: 'var(--size-home-button-md)' }}
                  >
                    Getting Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Kanan - Empty Space */}
        <div className="flex-1 h-full">
          {/* Empty luxury space */}
        </div>
      </div>

      {/* Desktop Layout (> 1024px) */}
      <div className="hidden lg:flex w-full h-full">
        {/* Kiri - SVG & Content Container */}
        <div className="w-[50vw] flex flex-col justify-center h-full max-h-[calc(100vh-88px)]">
          {/* SVG - Animation: Scale-in + Blur Clear + Hover Effects */}
          <div className="pointer-events-none mb-2 flex justify-end">
            <Image
              src="/images/home-hero/off-the-grid.svg"
              alt=""
              aria-hidden="true"
              width={1920}
              height={1080}
              sizes="(min-width: 1024px) 24vw"
              className={`homepage-svg-animation ${classes.svg} h-auto select-none ${!prefersReducedMotion && svgHovered ? 'homepage-svg-hover' : ''}`}
              style={{ width: '24vw', height: 'auto' }}
              onMouseEnter={() => !prefersReducedMotion && setSvgHovered(true)}
              onMouseLeave={() => !prefersReducedMotion && setSvgHovered(false)}
            />
          </div>

          {/* Subheading & CTA */}
          <div className="flex flex-col space-y-2">
            <div className="flex justify-end">
              <div className="w-full max-w-[24vw]">
                <p className={`homepage-text-animation ${classes.text} text-right font-body text-white/90 text-xl leading-relaxed`}>
                  Extraordinary events beyond boundaries.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="w-full max-w-[24vw]">
                <div className="flex flex-row space-x-3 justify-end">
                  <Link href="#">
                    <Button
                      className={`homepage-button-animation ${classes.button1} bg-transparent text-white border border-button-border hover:bg-button-border focus:bg-button-border font-heading text-sm font-semibold tracking-wide px-6 flex-1 rounded-lg`}
                    >
                      Chat with JETT
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      className={`homepage-button-animation ${classes.button2} bg-transparent text-white border border-button-border hover:bg-button-border focus:bg-button-border font-heading text-sm font-semibold tracking-wide px-6 flex-1 rounded-lg`}
                    >
                      Getting Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kanan - Empty Space */}
        <div className="flex-1 h-full">
          {/* Empty luxury space */}
        </div>
      </div>
    </section>
  );
};

export default HomepageSection;