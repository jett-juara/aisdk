"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles, Users, Cpu, BarChart3, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { ABOUT_RESET_EVENT } from "@/lib/constants/events";
import {
  Event as EventContent,
  Community as CommunityContent,
  Tech as TechContent,
  Analytic as AnalyticContent,
  AboutStats,
  AboutClientLogos,
} from "@/components/about";
import type { ImageGridItem, DetailBlock } from "@/lib/cms/marketing";

const layoutConfigs = {
  1: {
    desktopTextOrder: "lg:order-1",
    desktopImageOrder: "lg:order-2",
    textBasis: "lg:basis-[60%]",
    imageBasis: "lg:basis-[40%]",
  },
  2: {
    desktopTextOrder: "lg:order-2",
    desktopImageOrder: "lg:order-1",
    textBasis: "lg:basis-[60%]",
    imageBasis: "lg:basis-[40%]",
  },
  3: {
    desktopTextOrder: "lg:order-1",
    desktopImageOrder: "lg:order-2",
    textBasis: "lg:basis-[60%]",
    imageBasis: "lg:basis-[40%]",
  },
  4: {
    desktopTextOrder: "lg:order-2",
    desktopImageOrder: "lg:order-1",
    textBasis: "lg:basis-[60%]",
    imageBasis: "lg:basis-[40%]",
  },
} as const;

interface AboutHeroProps {
  whoWeAreHeading?: string;
  whoWeAreBody?: string;
  whatWeValueHeading?: string;
  whatWeValueBody?: string;
  imageGridItems?: ImageGridItem[];
  detailBlocks?: Record<string, DetailBlock>;
}

const Hero = ({
  whoWeAreHeading = "Who We Are",
  whoWeAreBody = "Juara is a full-service event organizer with more than 15 years of experience based in Indonesia. Led by passionate and talented individuals who have mastered the art of providing top-notch event services from planning to completion. We take a thoughtful approach in understanding client's objectives before meticulously bringing the ideas into life.",
  whatWeValueHeading = "What We Value",
  whatWeValueBody = "We strive for excellence, do our utmost to provide the best, and aim for success. We value excellence and integrity to deliver remarkable experiences to the guest with an emphasis on bringing innovation to the table. Putting our highest endeavor in executing ideas is our foundation to bring together the client's visions.",
  imageGridItems = [],
  detailBlocks = {},
}: AboutHeroProps = {}) => {
  const router = useRouter();

  // Minimal  // Fallback items  when CMS is empty (for development/testing)
  const fallbackItems: {
    id: string | number;
    slug: string;
    label: string;
    labelLine1: string;
    labelLine2: string;
    imagePosition: "left" | "right";
    imageUrl?: string;
    altText?: string;
    icon: LucideIcon;
  }[] = [
      {
        id: 1,
        slug: "event",
        label: "Events",
        labelLine1: "Premium Event",
        labelLine2: "Experiences",
        imagePosition: "left",
        icon: Sparkles,
      },
      {
        id: 2,
        slug: "community",
        label: "Community",
        labelLine1: "Building Connections",
        labelLine2: "Together",
        imagePosition: "right",
        icon: Users,
      },
      {
        id: 3,
        slug: "tech",
        label: "Tech",
        labelLine1: "Innovation",
        labelLine2: "Driven",
        imagePosition: "left",
        icon: Cpu,
      },
      {
        id: 4,
        slug: "analytic",
        label: "Analytics",
        labelLine1: "Data",
        labelLine2: "Insights",
        imagePosition: "right",
        icon: BarChart3,
      },
    ];

  const normalizeSlug = (slug: string) => {
    const normalized = slug.toLowerCase();
    const remap: Record<string, string> = {
      events: "event",
      analytics: "analytic",
    };
    return remap[normalized] || normalized;
  };

  const getIconBySlug = (slug: string): LucideIcon => {
    const map: Record<string, LucideIcon> = {
      event: Sparkles,
      community: Users,
      tech: Cpu,
      analytic: BarChart3,
    };
    return map[slug] || Sparkles;
  };

  const allowedSlugs = fallbackItems.map((i) => i.slug);

  // Primary: Use CMS image grid. Fallback: show gradient placeholder
  const useCMSImages = imageGridItems && imageGridItems.length > 0;
  const desiredCount = fallbackItems.length;
  let items = useCMSImages
    ? imageGridItems.map((item) => {
      const slug = normalizeSlug(item.slug);
      const mappedSlug = allowedSlugs.includes(slug)
        ? slug
        : fallbackItems[Number(item.position) - 1]?.slug || slug;
      return {
        id: item.id,
        slug: mappedSlug,
        label: item.label,
        labelLine1: item.labelLine1 || "",
        labelLine2: item.labelLine2 || "",
        imagePosition: item.imagePosition || "left",
        imageUrl: item.imageUrl ?? undefined,
        altText: item.altText ?? undefined,
        icon: getIconBySlug(mappedSlug),
      };
    })
    : fallbackItems;

  if (useCMSImages && items.length < desiredCount) {
    const existingSlugs = new Set(items.map((i) => i.slug));
    const padded = [...items];
    for (const fb of fallbackItems) {
      if (padded.length >= desiredCount) break;
      if (existingSlugs.has(fb.slug)) continue;
      padded.push({ ...fb, id: `fallback-${fb.slug}` });
    }
    items = padded;
  }

  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [introStep, setIntroStep] = useState(0);
  const [introReady, setIntroReady] = useState(false);
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">(
    "idle",
  );
  const totalIntroSteps = items.length + 1;
  const introDone = introStep >= totalIntroSteps;
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const frameRef = useRef<number | null>(null);
  const detailTimerRef = useRef<NodeJS.Timeout | null>(null);
  const introStartTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIntroTimers = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (timeoutsRef.current.length) {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    }
  }, []);

  useEffect(() => {
    const handleReset = () => {
      setSelectedId(null);
      setIntroStep(0);
      setDetailStage("idle");
      setIntroReady(false);
      if (introStartTimerRef.current) {
        clearTimeout(introStartTimerRef.current);
        introStartTimerRef.current = null;
      }
      introStartTimerRef.current = setTimeout(() => {
        setIntroReady(true);
      }, 600);
    };
    if (typeof window !== "undefined") {
      window.addEventListener(ABOUT_RESET_EVENT, handleReset);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(ABOUT_RESET_EVENT, handleReset);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroReady(true);
    }, 100);
    return () => {
      clearTimeout(timer);
      if (introStartTimerRef.current) {
        clearTimeout(introStartTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => resetIntroTimers();
  }, [resetIntroTimers]);

  useEffect(() => {
    if (selectedId !== null) {
      return;
    }
    if (!introReady) {
      return;
    }
    resetIntroTimers();
    const timer = setTimeout(() => {
      setIntroStep(0);
    }, 0);
    const run = (index: number) => {
      const timeoutId = setTimeout(
        () => {
          setIntroStep(index + 1);
          if (index < totalIntroSteps - 1) {
            frameRef.current = requestAnimationFrame(() => run(index + 1));
          }
        },
        index === 0 ? 160 : 240,
      );
      timeoutsRef.current.push(timeoutId);
    };
    frameRef.current = requestAnimationFrame(() => run(0));
    return () => {
      clearTimeout(timer);
      resetIntroTimers();
    };
  }, [resetIntroTimers, selectedId, totalIntroSteps, introReady]);

  useEffect(() => {
    if (selectedId !== null) {
      const t = setTimeout(() => setHoveredId(null), 0);
      return () => clearTimeout(t);
    }
  }, [selectedId]);

  useEffect(() => {
    if (detailTimerRef.current) {
      clearTimeout(detailTimerRef.current);
      detailTimerRef.current = null;
    }
    if (selectedId === null) {
      const t = setTimeout(() => setDetailStage("idle"), 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setDetailStage("cards");
      detailTimerRef.current = setTimeout(() => {
        setDetailStage("content");
        detailTimerRef.current = null;
      }, 400); // Increased delay for smoother feel
    }, 0);
    return () => {
      clearTimeout(t);
      if (detailTimerRef.current) {
        clearTimeout(detailTimerRef.current);
        detailTimerRef.current = null;
      }
    };
  }, [selectedId]);

  const handleCardClick = (id: string | number) => {
    if (selectedId === id) {
      setSelectedId(null);
      setHoveredId(null);
      setIntroStep(0);
      setDetailStage("idle");
      resetIntroTimers();
      setIntroReady(false);
      if (introStartTimerRef.current) {
        clearTimeout(introStartTimerRef.current);
      }
      introStartTimerRef.current = setTimeout(() => {
        setIntroReady(true);
      }, 600);
    } else {
      setSelectedId(id);
    }
  };

  const selectedItem = items.find((i) => i.id === selectedId);
  const handleCloseDetail = () => {
    if (!selectedId) return;
    handleCardClick(selectedId);
  };

  return (
    <section
      className={`relative flex-1 min-h-0 w-full flex flex-col items-start -mt-8 lg:mt-0 ${selectedId ? "pt-0 lg:pt-8" : "pt-0 lg:pt-8"} overflow-visible transition-all duration-500`}
    >
      {!selectedId && (
        <div className="w-full flex flex-col items-center">
          <div className="relative z-10 flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-start w-full gap-12 lg:gap-20">
              {/* Hero Text Section */}
              <div className="lg:flex-1 flex flex-col justify-start">
                <div
                  className={`w-full transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"} `}
                >
                  {introStep > 0 && (
                    <>
                      {/* Desktop View */}
                      <div className="hidden lg:flex flex-col gap-8">
                        <div>
                          <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl lg:text-5xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em]">
                            {whoWeAreHeading}
                          </h1>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                          <p className="font-light text-lg md:text-xl text-50/60 leading-relaxed max-w-2xl">
                            {whoWeAreBody}
                          </p>
                        </div>
                        <div>
                          <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl lg:text-5xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em]">
                            {whatWeValueHeading}
                          </h1>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                          <p className="font-light text-lg md:text-xl text-50/60 leading-relaxed max-w-2xl">
                            {whatWeValueBody}
                          </p>
                        </div>
                      </div>

                      {/* Mobile/Tablet View (Accordion) */}
                      <div className="lg:hidden w-full">
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full flex flex-col gap-4"
                        >
                          <AccordionItem
                            value="who-we-are"
                            className="border-none"
                          >
                            <AccordionTrigger className="hover:no-underline py-2">
                              <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em] text-left">
                                {whoWeAreHeading}
                              </h1>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="relative pl-6 mt-2">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                                <p className="font-light text-lg text-50/60 leading-relaxed">
                                  {whoWeAreBody}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem
                            value="what-we-value"
                            className="border-none"
                          >
                            <AccordionTrigger className="hover:no-underline py-2">
                              <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em] text-left">
                                {whatWeValueHeading}
                              </h1>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="relative pl-6 mt-2 flex flex-col gap-6">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                                <p className="font-light text-lg text-50/60 leading-relaxed">
                                  {whatWeValueBody}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Grid Section */}
              <div className="w-full lg:max-w-[35vw]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-4 auto-rows-[minmax(100px,auto)]">
                  {items.map((item, index) => {
                    const isStateOne = selectedId === null;
                    const isIntroActive = introStep <= index;
                    const introClass = isIntroActive
                      ? "opacity-0 translate-y-12 blur-lg"
                      : "opacity-100 translate-y-0 blur-0";
                    const scaleClass =
                      !isStateOne || introStep < totalIntroSteps
                        ? "scale-100"
                        : hoveredId === item.id
                          ? "scale-[1.09]"
                          : hoveredId === null
                            ? "scale-100"
                            : "scale-95 opacity-60 blur-[1px]";

                    // Bento Grid Classes - Mobile, Tablet (md), Desktop (lg) memiliki susunan berbeda
                    let bentoClass = "";
                    // Mobile: Events square (baris 1 kiri), Community square (baris 2 kiri), Tech portrait (baris 1-2 kanan), Analytics rectangle (baris 3 full)
                    // Desktop lg: Events 2x2 (baris 1-2, col 1-2), Community portrait 1x2 (baris 1-2, col 3), Tech square (baris 3, col 1), Analytics 2x1 (baris 3, col 2-3)
                    if (index === 0)
                      bentoClass =
                        "col-span-1 row-start-1 col-start-1 aspect-square md:col-span-2 md:aspect-[2/1] md:row-start-1 md:col-start-1 lg:col-span-2 lg:row-span-2 lg:row-start-1 lg:col-start-1 lg:aspect-square";
                    else if (index === 1)
                      bentoClass =
                        "col-span-1 row-start-2 col-start-1 aspect-square md:col-span-1 md:row-start-1 md:col-start-3 lg:col-span-1 lg:row-span-2 lg:row-start-1 lg:col-start-3 lg:aspect-[1/2] lg:h-full";
                    else if (index === 2)
                      bentoClass =
                        "col-span-1 row-span-2 row-start-1 col-start-2 h-full md:col-span-1 md:row-start-2 md:col-start-1 md:aspect-square md:row-span-1 md:h-auto lg:col-span-1 lg:row-span-1 lg:row-start-3 lg:col-start-1 lg:aspect-square lg:h-full";
                    else if (index === 3)
                      bentoClass =
                        "col-span-2 row-start-3 aspect-[2/1] md:col-span-2 md:row-start-2 md:col-start-2 md:aspect-[2/1] lg:col-span-2 lg:row-start-3 lg:col-start-2 lg:aspect-[2/1]";

                    return (
                      <div
                        key={item.id}
                        className={`transition-all duration-700 ease-premium transform-gpu w-full ${bentoClass} ${introClass} ${scaleClass} ${introStep < totalIntroSteps ? "pointer-events-none" : ""}`}
                        onMouseEnter={() => introDone && setHoveredId(item.id)}
                        onMouseLeave={() => introDone && setHoveredId(null)}
                      >
                        <div
                          className="group relative rounded-3xl overflow-hidden cursor-pointer h-full glass-card shadow-2xl focus:outline-none focus-visible:outline-none"
                          onClick={() => handleCardClick(item.id)}
                          tabIndex={-1}
                        >
                          {/* Background gradient for hover effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-glass-bg-hover to-transparent" />

                          {/* CMS Image (Primary) */}
                          {useCMSImages && item.imageUrl ? (
                            <div className="absolute inset-0">
                              <Image
                                src={item.imageUrl}
                                alt={item.altText || item.label || 'JUARA Events'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                priority={false}
                              />
                              {/* Dark overlay for text readability */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                            </div>
                          ) : (
                            /* Emergency fallback: gradient background without icon */
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-background-900/60 to-background-950/80" />
                          )}

                          {/* Label overlay */}
                          <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <div>
                              <h3 className="text-lg font-medium tracking-wide text-white group-hover:text-text-50 transition-colors duration-300 leading-tight">
                                {item.label}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div
            className={`w-full mt-20 mb-12 py-16 bg-white/5 backdrop-blur-sm rounded-3xl transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"} `}
          >
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
                <h2 className="text-3xl md:text-4xl font-headingSecondary font-bold text-premium-gradient">
                  Growing with Impact
                </h2>
                <p className="text-text-200 text-lg font-light leading-relaxed">
                  We take pride in our journey of continuous growth and the
                  meaningful connections we&apos;ve built along the way.
                </p>
              </div>
              <div className="w-full flex flex-col items-center gap-8">
                <AboutStats />
                <Button
                  className="h-12 w-auto px-8 rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105"
                  onClick={() =>
                    window.open("/documents/company-profile.pdf", "_blank")
                  }
                >
                  Download Our Company Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Client Logo Section */}
          <div
            className={`w-full mt-8 py-8 bg-transparent transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"} `}
          >
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center text-center mb-12 lg:mt-10 px-4">
                <h2 className="text-3xl md:text-4xl font-headingSecondary font-bold text-premium-gradient mb-6">
                  Trusted by Leading Brands
                </h2>
                <p className="text-text-200 max-w-3xl leading-relaxed text-lg font-light">
                  Trust is the foundation of every exceptional work. We are
                  proud to be a strategic partner to leading institutions and
                  brands, delivering creative solutions that not only address
                  challenges but also set new standards.
                </p>
                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
                  <Button
                    className="h-12 w-[200px] rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => router.push("/contact")}
                  >
                    Contact Us
                  </Button>
                  <Button
                    className="h-12 w-[200px] rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() =>
                      window.open("https://wa.me/6281234567890", "_blank")
                    }
                  >
                    Chat Jett
                  </Button>
                </div>
              </div>
            </div>
            <AboutClientLogos />
          </div>
        </div>
      )}

      {selectedId && (
        <div className="relative z-10 flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto lg:px-8">
          {/* Detail Content Area */}
          <div className="w-full min-h-[50vh]">
            {(() => {
              const slug = selectedItem?.slug;
              const imagePosition = selectedItem?.imagePosition;
              if (!slug) return null;

              const commonProps = {
                stage: detailStage,
                onClose: handleCloseDetail,
                navigationItems: items,
                currentId: selectedId,
                onNavigate: handleCardClick,
                detailBlock: detailBlocks[slug],
                imagePosition,
              };

              if (slug === "event") return <EventContent {...commonProps} />;
              if (slug === "community")
                return <CommunityContent {...commonProps} />;
              if (slug === "tech") return <TechContent {...commonProps} />;
              if (slug === "analytic")
                return <AnalyticContent {...commonProps} />;
              return null;
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
