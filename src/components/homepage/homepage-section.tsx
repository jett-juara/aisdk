"use client";

import { Button } from "@/components/ui/button";
import { useHomepageAnimations } from "@/hooks/use-homepage-animations";
import Image from "next/image";

interface Hero47Props {
  heading?: {
    src: string;
    alt?: string;
  };
  subheading?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
}

const Hero47 = ({
  heading = {
    src: "/images/home-hero/off-the-grid.svg",
    alt: "Off The Grid",
  },
  subheading = "Extraordinary events beyond boundaries",
  buttons = {
    primary: {
      text: "Chat with JETT",
      url: "#",
    },
    secondary: {
      text: "Getting Started",
      url: "/about",
    },
  },
}: Hero47Props) => {
  // Initialize homepage animations
  const { getClasses } = useHomepageAnimations()
  const animationClasses = getClasses()

  return (
    <section className="relative w-full">
      {/* Single responsive container: mobile → md (tablet) → lg (desktop) */}
      <div className="flex items-center lg:min-h-[calc(100dvh-10rem)]">
        <div className="flex flex-col gap-3 md:gap-4 w-full max-w-[50%] md:max-w-[50%] lg:max-w-[50%] justify-end lg:justify-center py-2">
          {/* SVG Title */}
          <div className="flex justify-end">
            <Image
              src={heading.src}
              alt={heading.alt || ""}
              width={350}
              height={120}
              sizes="(min-width:1024px) 330px, (min-width:768px) 350px, 160px"
              className={`h-auto object-contain w-[160px] md:w-[350px] lg:w-[330px] transition-all duration-700 ease-out transform-gpu ${animationClasses.svg}`}
            />
          </div>

          {/* Subheading & Buttons CTA - dalam 1 container */}
          <div className="flex justify-end md:justify-end lg:justify-end">
            <div className="flex flex-col gap-3 md:gap-4 max-w-[70%] md:max-w-[80%] lg:max-w-[65%] md:px-4 md:py-2 lg:px-0 items-center">
              <p className={`text-text-info-500 text-md md:text-2xl lg:text-sm font-heading uppercase text-center  transition-all duration-700 ease-out ${animationClasses.text}`}>
                {subheading}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-6 md:gap-8 lg:gap-6 justify-center">
                <Button
                  asChild
                  className={`font-button font-medium text-xs md:text-lg lg:text-sm bg-transparent text-text-100 border border-outline-text hover:bg-brand-50 hover:text-text-900 tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10 transform-gpu ${animationClasses.button1}`}
                >
                  <a href={buttons.primary?.url}>
                    {buttons.primary?.text}
                  </a>
                </Button>
                <Button
                  asChild
                  className={`font-button font-medium text-xs md:text-lg lg:text-sm bg-transparent text-text-100 border border-outline-text hover:bg-brand-50 hover:text-text-900 tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10 transform-gpu ${animationClasses.button2}`}
                >
                  <a href={buttons.secondary?.url}>
                    {buttons.secondary?.text}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero47 };
