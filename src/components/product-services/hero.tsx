import { ArrowUpRight } from "lucide-react";

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
}

const ProductServicesHero = ({
  heading = "Epic Blocks",
  subheading = " built with shadcn/ui & Tailwind",
  description = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  buttons = {
    primary: {
      text: "Get Started",
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
}: ProductServicesHeroProps) => {
  return (
    <section className="bg-background min-h-[calc(100dvh-5rem)] flex items-center">
      <div className="container flex flex-col items-center gap-10 lg:my-0 lg:flex-row">
        <div className="flex flex-col gap-7 lg:w-2/3">
          <h2 className="text-foreground text-5xl font-semibold md:text-5xl lg:text-8xl">
            <span>{heading}</span>
            <span className="text-muted-foreground">{subheading}</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg lg:text-xl">
            {description}
          </p>
          <div className="flex flex-wrap items-start gap-5 lg:gap-7">
            <Button asChild>
              <a href={buttons.primary?.url}>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="size-4" />
                </div>
                <span className="whitespace-nowrap pl-4 pr-6 text-sm lg:pl-6 lg:pr-8 lg:text-base">
                  {buttons.primary?.text}
                </span>
              </a>
            </Button>
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-center">
          <div
            aria-hidden="true"
            className="rounded-[35px] w-full"
            style={{
              height: 'min(80vh, calc(100dvh - 5rem))',
              aspectRatio: '450 / 889',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border-700)'
            }}
          />
        </div>
      </div>
    </section>
  );
};

export { ProductServicesHero };
