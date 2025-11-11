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
      {/* Mobile & Tablet Layout */}
      <div className="lg:hidden flex items-center">
        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-[50%] sm:max-w-[60%] md:max-w-[55%] justify-end py-8">
          {/* SVG Title */}
          <div className="flex justify-end">
            <img
              src={heading.src}
              alt={heading.alt || ""}
              className={`h-auto object-contain w-[160px] sm:w-[180px] md:w-[380px] transition-all duration-700 ease-out transform-gpu ${animationClasses.svg}`}
            />
          </div>

          {/* Subheading & Buttons - dalam 1 container */}
          <div className="flex justify-end">
            <div className="flex flex-col gap-3 sm:gap-4 max-w-[70%] sm:max-w-[70%] md:max-w-[80%] md:px-4 md:py-2 items-center">
              <p className={`text-text-info-500 text-lg sm:text-lg md:text-2xl md:pb-4 text-center transition-all font-manrope uppercase duration-700 ease-out ${animationClasses.text}`}>
                {subheading}
              </p>
              <div className="flex flex-wrap items-start gap-4 sm:gap-3 md:gap-6 justify-center">
                <Button
                  asChild
                  className={`font-heading text-md sm:text-md md:text-xl bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50 font-semibold tracking-wide px-3 sm:px-3 md:px-4 py-0 sm:py-2 rounded-lg whitespace-nowrap transition-all duration-500 ease-out transform-gpu ${animationClasses.button1}`}
                >
                  <a href={buttons.primary?.url}>
                    {buttons.primary?.text}
                  </a>
                </Button>
                <Button
                  asChild
                  className={`font-heading text-md sm:text-md md:text-xl bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-text-50 font-semibold tracking-wide px-3 sm:px-3 md:px-4 py-0 sm:py-2 rounded-lg whitespace-nowrap transition-all duration-500 ease-out transform-gpu ${animationClasses.button2}`}
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

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center min-h-[calc(100dvh-10rem)]">
        <div className="flex flex-col gap-4 w-full max-w-[50%] justify-center py-8">
          {/* SVG Title */}
          <div className="flex justify-end">
            <img
              src={heading.src}
              alt={heading.alt || ""}
              className={`h-auto w-[350px] object-contain transition-all duration-700 ease-out transform-gpu ${animationClasses.svg}`}
            />
          </div>

          {/* Subheading & Buttons - dalam 1 container */}
          <div className="flex justify-end">
            <div className="flex flex-col gap-4 max-w-[60%] items-center">
              <p className={`text-text-info-500 text-xl font-manrope uppercase text-right transition-all duration-700 ease-out ${animationClasses.text}`}>
                {subheading}
              </p>
              <div className="flex flex-wrap items-start gap-4 justify-center">
                <Button
                  asChild
                  className={`font-heading text-lg bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide px-6 rounded-lg transition-all duration-500 ease-out transform-gpu ${animationClasses.button1}`}
                >
                  <a href={buttons.primary?.url}>
                    {buttons.primary?.text}
                  </a>
                </Button>
                <Button
                  asChild
                  className={`font-heading text-lg bg-button-primary text-text-50 hover:bg-button-primary-hover active:bg-button-primary-active font-semibold tracking-wide px-6 rounded-lg transition-all duration-500 ease-out transform-gpu ${animationClasses.button2}`}
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
