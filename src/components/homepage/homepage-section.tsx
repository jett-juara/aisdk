"use client";

import { Button } from "@/components/ui/button";
import { useHomepageAnimations } from "@/hooks/use-homepage-animations";

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
            <img
              src={heading.src}
              alt={heading.alt || ""}
              className={`h-auto object-contain w-[160px] md:w-[350px] lg:w-[330px] transition-all duration-700 ease-out transform-gpu ${animationClasses.svg}`}
            />
          </div>

          {/* Subheading & Buttons - dalam 1 container */}
          <div className="flex justify-end">
            <div className="flex flex-col gap-3 md:gap-4 max-w-[70%] md:max-w-[80%] lg:max-w-[65%] md:px-4 md:py-2 lg:px-0 items-end">
              <p className={`text-text-info-500 text-sm md:text-2xl lg:text-sm font-manrope uppercase text-center  lg:items-end transition-all duration-700 ease-out ${animationClasses.text}`}>
                {subheading}
              </p>
              <div className="flex flex-wrap items-start gap-4 md:gap-6 justify-center lg:justify-end">
                <Button
                  asChild
                  className={`font-heading text-md md:text-xl lg:text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide px-3 md:px-4 lg:px-6 py-0 md:py-2 rounded-lg whitespace-nowrap transition-all duration-500 ease-out transform-gpu ${animationClasses.button1}`}
                >
                  <a href={buttons.primary?.url}>
                    {buttons.primary?.text}
                  </a>
                </Button>
                <Button
                  asChild
                  className={`font-heading text-md md:text-xl lg:text-sm bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide px-3 md:px-4 lg:px-6 py-0 md:py-2 rounded-lg whitespace-nowrap transition-all duration-500 ease-out transform-gpu ${animationClasses.button2}`}
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
