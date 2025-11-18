"use client"

import { useEffect, useState } from "react"
import { useHomepageAnimations } from "@/hooks/use-homepage-animations"
import { Button } from "@/components/ui/button";

interface ProductServicesHeroProps {
  heading?: string;
  subheading?: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
  };
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
  onSelect?: (section: "product" | "services") => void;
}

const ProductServicesHero = ({
  heading = "We strive for excellence",
  subheading = "Do our utmost to provide the best, and aim for success.",
  description = "We value excellence and integrity to deliver remarkable experiences to the guest with an emphasis on bringing innovation to the table. Putting our highest endeavor in executing ideas is our foundation to bring together the client’s visions.",
  buttons = {
    primary: {
      text: "Let's Talk",
      url: "#",
    },
    secondary: {
      text: "Read the docs",
      url: "#",
    },
  },
  image = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-7-tall.svg",
    alt: "Placeholder",
  },
  onSelect,
}: ProductServicesHeroProps) => {
  const [introStep, setIntroStep] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const { getClasses } = useHomepageAnimations()
  const animationClasses = getClasses()

  useEffect(() => {
    const timers: number[] = []
    timers.push(window.setTimeout(() => setIntroStep(1), 600))
    timers.push(window.setTimeout(() => setIntroStep(2), 850))
    return () => {
      timers.forEach((t) => clearTimeout(t))
    }
  }, [])

  const baseClasses = "rounded-2xl w-1/2 border border-border-700 bg-background transition-all duration-600 ease-out transform-gpu"
  const introClass = (index: number) => (introStep <= index ? "opacity-0 translate-y-10 blur-md" : "opacity-100 translate-y-0 blur-0")
  const introDone = introStep >= 2
  const getScaleClasses = (index: number) => {
    if (!introDone) return "scale-100 shadow-none"
    if (hovered === index) return "scale-110 z-10 shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
    if (hovered === null) return "scale-100 shadow-none"
    return "scale-90 opacity-80 shadow-none"
  }
  return (
    <section className="bg-background-900 min-h-full h-full w-full flex items-center">
      <div className="container flex flex-col items-center gap-10 lg:my-0 lg:flex-row">
        <div className="left-container w-full lg:w-3/5 flex flex-col gap-7">
          <h1 className={`font-heading font-semibold text-3xl md:text-5xl lg:text-7xl tracking-tighter text-text-200 transition-all duration-700 ease-out transform-gpu ${animationClasses.svg}`}>
            <span>{heading}</span>
            </h1>
          <p className={`font-subheading text-lg md:text-2xl md:mt-2 lg:text-3xl lg:mt-0 text-text-50 transition-all duration-700 ease-out ${animationClasses.text}`}>
            <span>{subheading}</span>
          </p>
          <p className={`font-body text-lg md:text-2xl md:mt-2 lg:text-[1.2rem] lg:mt-0 text-text-50 transition-all duration-700 ease-out ${animationClasses.text}`}>
            {description}
          </p>
          <div className="flex flex-wrap items-start gap-5 lg:gap-2">
            <Button
              asChild
              className={`font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10 transform-gpu ${animationClasses.button1}`}
            >
              <a href={buttons.primary?.url}>
                {buttons.primary?.text}
              </a>
            </Button>
          </div>
        </div>
        
        {/* Gambar*/}
        <div className="right-container w-full lg:w-2/5 relative z-10 flex items-center justify-center">
          <div className="flex w-full items-center justify-center gap-3 md:gap-4">
            <div
              aria-hidden="true"
              role="button"
              tabIndex={introDone ? 0 : -1}
              aria-label="Product visual"
              className={`${baseClasses} ${introClass(0)} ${getScaleClasses(0)} ${!introDone ? "pointer-events-none" : "cursor-pointer"} product-visual`}
              style={{ aspectRatio: "450 / 889" }}
              onMouseEnter={() => introDone && setHovered(0)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => introDone && onSelect?.("product")}
            />
            <div
              aria-hidden="true"
              role="button"
              tabIndex={introDone ? 0 : -1}
              aria-label="Services visual"
              className={`${baseClasses} ${introClass(1)} ${getScaleClasses(1)} ${!introDone ? "pointer-events-none" : "cursor-pointer"} services-visual`}
              style={{ aspectRatio: "450 / 889" }}
              onMouseEnter={() => introDone && setHovered(1)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => introDone && onSelect?.("services")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProductServicesHero };
