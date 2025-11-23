"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { CalendarCheck, UsersRound, Cpu, ChartBarBig, Sparkles, Users, BarChart3 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation"
import { ABOUT_RESET_EVENT } from "@/lib/constants/events"
import { Event as EventContent, Community as CommunityContent, Tech as TechContent, Analytic as AnalyticContent, AboutStats } from "@/components/about"

const layoutConfigs = {
  1: { desktopTextOrder: "lg:order-1", desktopImageOrder: "lg:order-2", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  2: { desktopTextOrder: "lg:order-2", desktopImageOrder: "lg:order-1", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  3: { desktopTextOrder: "lg:order-1", desktopImageOrder: "lg:order-2", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  4: { desktopTextOrder: "lg:order-2", desktopImageOrder: "lg:order-1", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
} as const

const Hero = () => {
  const router = useRouter()
  const items: { id: number; slug: string; label: string; labelLine1: string; labelLine2: string; icon: LucideIcon; imagePosition: "left" | "right" }[] = [
    { id: 1, slug: "event", label: "Events", labelLine1: "Premium Event", labelLine2: "Experiences", icon: Sparkles, imagePosition: "left" },
    { id: 2, slug: "community", label: "Community", labelLine1: "Community-driven", labelLine2: "Innovation", icon: Users, imagePosition: "right" },
    { id: 3, slug: "tech", label: "Tech", labelLine1: "Cutting-edge", labelLine2: "Technology", icon: Cpu, imagePosition: "left" },
    { id: 4, slug: "analytic", label: "Analytics", labelLine1: "Data-driven", labelLine2: "Insights", icon: BarChart3, imagePosition: "right" },
  ]

  const logos = [
    "abc", "angkasapura", "axa", "belfoods", "bintangtoedjoe", "bkkbn", "bukalapak", "cocacola", "danone",
    "djarum", "duakelinci", "dunhill", "gudanggaram", "haan", "honda", "indosat", "injourney", "kemenag",
    "kemnaker", "kimbo", "komdigi", "mayora", "mgpa", "nugreentea", "pwc", "sariroti", "telkom", "umc"
  ]

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [introStep, setIntroStep] = useState(0)
  const [introReady, setIntroReady] = useState(false)
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")
  const totalIntroSteps = items.length + 1
  const introDone = introStep >= totalIntroSteps
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const frameRef = useRef<number | null>(null)
  const detailTimerRef = useRef<NodeJS.Timeout | null>(null)
  const introStartTimerRef = useRef<NodeJS.Timeout | null>(null)

  const resetIntroTimers = useCallback(() => {
    if (frameRef.current !== null) { cancelAnimationFrame(frameRef.current); frameRef.current = null }
    if (timeoutsRef.current.length) { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = [] }
  }, [])

  useEffect(() => {
    const handleReset = () => {
      setSelectedId(null); setIntroStep(0); setDetailStage("idle"); setIntroReady(false)
      if (introStartTimerRef.current) { clearTimeout(introStartTimerRef.current); introStartTimerRef.current = null }
      introStartTimerRef.current = setTimeout(() => { setIntroReady(true) }, 600)
    }
    if (typeof window !== "undefined") { window.addEventListener(ABOUT_RESET_EVENT, handleReset) }
    return () => { if (typeof window !== "undefined") { window.removeEventListener(ABOUT_RESET_EVENT, handleReset) } }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => { setIntroReady(true) }, 100)
    return () => { clearTimeout(timer); if (introStartTimerRef.current) { clearTimeout(introStartTimerRef.current) } }
  }, [])

  useEffect(() => { return () => resetIntroTimers() }, [resetIntroTimers])

  useEffect(() => {
    if (selectedId !== null) { return }
    if (!introReady) { return }
    resetIntroTimers()
    const timer = setTimeout(() => { setIntroStep(0) }, 0)
    const run = (index: number) => {
      const timeoutId = setTimeout(() => {
        setIntroStep(index + 1)
        if (index < totalIntroSteps - 1) { frameRef.current = requestAnimationFrame(() => run(index + 1)) }
      }, index === 0 ? 160 : 240)
      timeoutsRef.current.push(timeoutId)
    }
    frameRef.current = requestAnimationFrame(() => run(0))
    return () => { clearTimeout(timer); resetIntroTimers() }
  }, [resetIntroTimers, selectedId, totalIntroSteps, introReady])

  useEffect(() => { if (selectedId !== null) { const t = setTimeout(() => setHoveredId(null), 0); return () => clearTimeout(t) } }, [selectedId])

  useEffect(() => {
    if (detailTimerRef.current) { clearTimeout(detailTimerRef.current); detailTimerRef.current = null }
    if (selectedId === null) { const t = setTimeout(() => setDetailStage("idle"), 0); return () => clearTimeout(t) }
    const t = setTimeout(() => {
      setDetailStage("cards")
      detailTimerRef.current = setTimeout(() => { setDetailStage("content"); detailTimerRef.current = null }, 400) // Increased delay for smoother feel
    }, 0)
    return () => { clearTimeout(t); if (detailTimerRef.current) { clearTimeout(detailTimerRef.current); detailTimerRef.current = null } }
  }, [selectedId])

  const handleCardClick = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null); setHoveredId(null); setIntroStep(0); setDetailStage("idle"); resetIntroTimers(); setIntroReady(false)
      if (introStartTimerRef.current) { clearTimeout(introStartTimerRef.current) }
      introStartTimerRef.current = setTimeout(() => { setIntroReady(true) }, 600)
    } else { setSelectedId(id) }
  }

  const selectedItem = items.find((i) => i.id === selectedId)
  const handleCloseDetail = () => { if (!selectedId) return; handleCardClick(selectedId) }

  return (
    <section className={`relative flex-1 min-h-screen w-full flex flex-col items-center justify-start -mt-8 lg:mt-0 ${selectedId ? "pt-0 lg:pt-8" : "pt-0 lg:pt-8"} overflow-visible transition-all duration-500`}>
      {!selectedId && (
        <div className="w-full flex flex-col items-center">
          <div className={`relative z-10 flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto lg:px-8`}>
            <div className="flex flex-col-reverse lg:flex-row lg:items-start w-full gap-12 lg:gap-20">
              {/* Hero Text Section */}
              <div className="lg:flex-1 flex flex-col justify-start">
                <div className={`w-full transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"}`}>
                  {introStep > 0 && (
                    <>
                      {/* Desktop View */}
                      <div className="hidden lg:flex flex-col gap-8">
                        <div>
                          <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl lg:text-5xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em]">
                            Who We Are
                          </h1>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                          <p className="font-light text-lg md:text-xl text-50/60 leading-relaxed max-w-2xl">
                            Juara is a full-service event organizer with more than 15 years of experience based in Indonesia. Led by passionate and talented individuals who have mastered the art of providing top-notch event services from planning to completion. We take a thoughtful approach in understanding client’s objectives before meticulously bringing the ideas into life.
                          </p>
                        </div>
                        <div>
                          <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl lg:text-5xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em]">
                            What We Value
                          </h1>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                          <p className="font-light text-lg md:text-xl text-50/60 leading-relaxed max-w-2xl">
                            We strive for excellence, do our utmost to provide the best, and aim for success. We value excellence and integrity to deliver remarkable experiences to the guest with an emphasis on bringing innovation to the table. Putting our highest endeavor in executing ideas is our foundation to bring together the client’s visions.
                          </p>
                        </div>

                        <div className="pt-8 flex justify-start w-full">
                          <Button
                            className="h-12 w-[200px] rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105"
                            onClick={() => window.open("/documents/company-profile.pdf", "_blank")}
                          >
                            Company Profile
                          </Button>
                        </div>
                      </div>

                      {/* Mobile/Tablet View (Accordion) */}
                      <div className="lg:hidden w-full">
                        <Accordion type="single" collapsible className="w-full flex flex-col gap-4">
                          <AccordionItem value="who-we-are" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2">
                              <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em] text-left">
                                Who We Are
                              </h1>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="relative pl-6 mt-2">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                                <p className="font-light text-lg text-50/60 leading-relaxed">
                                  Juara is a full-service event organizer with more than 15 years of experience based in Indonesia. Led by passionate and talented individuals who have mastered the art of providing top-notch event services from planning to completion. We take a thoughtful approach in understanding client’s objectives before meticulously bringing the ideas into life.
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="what-we-value" className="border-none">
                            <AccordionTrigger className="hover:no-underline py-2">
                              <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em] text-left">
                                What We Value
                              </h1>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="relative pl-6 mt-2 flex flex-col gap-6">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                                <p className="font-light text-lg text-50/60 leading-relaxed">
                                  We strive for excellence, do our utmost to provide the best, and aim for success. We value excellence and integrity to deliver remarkable experiences to the guest with an emphasis on bringing innovation to the table. Putting our highest endeavor in executing ideas is our foundation to bring together the client’s visions.
                                </p>
                                <div className="flex justify-center w-full pt-2">
                                  <Button
                                    className="h-12 w-[200px] rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105"
                                    onClick={() => window.open("/documents/company-profile.pdf", "_blank")}
                                  >
                                    Company Profile
                                  </Button>
                                </div>
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
              <div className="w-full lg:max-w-[30vw]">
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 md:gap-4 auto-rows-[minmax(100px,auto)]">
                  {items.map((item, index) => {
                    const isStateOne = selectedId === null
                    const isIntroActive = introStep <= index
                    const introClass = isIntroActive ? "opacity-0 translate-y-12 blur-lg" : "opacity-100 translate-y-0 blur-0"
                    const scaleClass = !isStateOne || introStep < totalIntroSteps ? "scale-100" : hoveredId === item.id ? "scale-[1.09]" : hoveredId === null ? "scale-100" : "scale-95 opacity-60 blur-[1px]"

                    // Bento Grid Classes
                    let bentoClass = ""
                    if (index === 0) bentoClass = "col-span-2 aspect-[2/1] lg:col-span-2 lg:row-span-1"
                    else if (index === 1) bentoClass = "col-span-1 aspect-square lg:col-span-1 lg:row-span-1"
                    else if (index === 2) bentoClass = "col-span-1 aspect-[1/2] lg:col-span-1 lg:row-span-2"
                    else if (index === 3) bentoClass = "col-span-2 aspect-square lg:col-span-1 lg:row-span-1"

                    return (
                      <div key={item.id}
                        className={`transition-all duration-700 ease-premium transform-gpu w-full ${bentoClass} ${introClass} ${scaleClass} ${introStep < totalIntroSteps ? "pointer-events-none" : ""}`}
                        onMouseEnter={() => introDone && setHoveredId(item.id)}
                        onMouseLeave={() => introDone && setHoveredId(null)}>
                        {(() => {
                          const Icon = item.icon as LucideIcon
                          return (
                            <div
                              className="group relative rounded-3xl overflow-hidden cursor-pointer h-full glass-card shadow-2xl focus:outline-none focus-visible:outline-none"
                              onClick={() => handleCardClick(item.id)}
                              tabIndex={-1}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-glass-bg-hover to-transparent" />

                              <div className="absolute inset-0 flex flex-col justify-between p-6">
                                <div className="flex justify-end">
                                  <div className="p-3 rounded-full bg-glass-bg border border-glass-border group-hover:bg-glass-bg-hover transition-colors duration-300">
                                    <Icon className="h-6 w-6 text-text-50 opacity-80 group-hover:text-text-50 group-hover:opacity-100 transition-colors duration-300" strokeWidth={1.5} />
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-lg font-medium text-text-50 tracking-wide group-hover:text-text-50 transition-colors duration-300 leading-tight">{item.label}</h3>
                                </div>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`w-full mt-20 mb-12 py-16 bg-white/5 backdrop-blur-sm rounded-3xl transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"}`}>
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6">
                <h2 className="text-3xl md:text-4xl font-headingSecondary font-bold text-premium-gradient">
                  Growing with Impact
                </h2>
                <p className="text-text-200 text-lg font-light leading-relaxed">
                  We take pride in our journey of continuous growth and the meaningful connections we&apos;ve built along the way.
                </p>
              </div>
              <div className="w-full flex justify-center">
                <AboutStats />
              </div>
            </div>
          </div>

          {/* Client Logo Section */}
          <div className={`w-full mt-8 py-8 bg-transparent transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"}`}>
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center text-center mb-12 px-4">
                <h2 className="text-3xl md:text-4xl font-headingSecondary font-bold text-premium-gradient mb-6">
                  Trusted by Leading Brands
                </h2>
                <p className="text-text-200 max-w-3xl leading-relaxed text-lg font-light">
                  Trust is the foundation of every exceptional work. We are proud to be a strategic partner to leading institutions and brands, delivering creative solutions that not only address challenges but also set new standards.
                </p>
                <div className="mt-8 flex flex-col lg:flex-row gap-4 justify-center items-center">
                  <Button
                    className="h-12 w-[200px] rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => router.push("/contact")}
                  >
                    Contact Us
                  </Button>
                  <Button
                    className="h-12 w-[200px] rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105 shadow-lg"
                    onClick={() => window.open("https://wa.me/6281234567890", "_blank")} // Placeholder link, update if known
                  >
                    Chat Jett
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-12 overflow-hidden group/logos py-8 w-full [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
              {/* Row 1: Left to Right */}
              <div className="flex gap-12 w-max animate-marquee-right group-hover/logos:[animation-play-state:paused]">
                {[...logos.slice(0, 9), ...logos.slice(0, 9)].map((logo, idx) => (
                  <div key={`row1-${idx}`} className="group relative w-32 h-16 flex items-center justify-center transition-transform duration-300 hover:scale-125">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300" />
                    <Image src={`/client-logo/gray/${logo}-gray.png`} alt={logo} fill sizes="128px" className="object-contain p-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                    <Image src={`/client-logo/color/${logo}-color.png`} alt={logo} fill sizes="128px" className="object-contain p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>

              {/* Row 2: Right to Left */}
              <div className="flex gap-12 w-max animate-marquee-left group-hover/logos:[animation-play-state:paused]">
                {[...logos.slice(9, 18), ...logos.slice(9, 18)].map((logo, idx) => (
                  <div key={`row2-${idx}`} className="group relative w-32 h-16 flex items-center justify-center transition-transform duration-300 hover:scale-125">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300" />
                    <Image src={`/client-logo/gray/${logo}-gray.png`} alt={logo} fill sizes="128px" className="object-contain p-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                    <Image src={`/client-logo/color/${logo}-color.png`} alt={logo} fill sizes="128px" className="object-contain p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>

              {/* Row 3: Left to Right */}
              <div className="flex gap-12 w-max animate-marquee-right group-hover/logos:[animation-play-state:paused]">
                {[...logos.slice(18, 28), ...logos.slice(18, 28)].map((logo, idx) => (
                  <div key={`row3-${idx}`} className="group relative w-32 h-16 flex items-center justify-center transition-transform duration-300 hover:scale-125">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300" />
                    <Image src={`/client-logo/gray/${logo}-gray.png`} alt={logo} fill sizes="128px" className="object-contain p-3 opacity-100 group-hover:opacity-0 transition-opacity duration-300" />
                    <Image src={`/client-logo/color/${logo}-color.png`} alt={logo} fill sizes="128px" className="object-contain p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div >)
      }

      {
        selectedId && (
          <div className={`relative z-10 flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8`}>
            {/* Detail Content Area */}
            <div className="w-full min-h-[50vh]">
              {(() => {
                const slug = selectedItem?.slug
                const imagePosition = selectedItem?.imagePosition
                if (!slug) return null

                const commonProps = {
                  stage: detailStage,
                  onClose: handleCloseDetail,
                  navigationItems: items,
                  currentId: selectedId,
                  onNavigate: handleCardClick
                }

                if (slug === "event") return <EventContent {...commonProps} />
                if (slug === "community") return <CommunityContent {...commonProps} />
                if (slug === "tech") return <TechContent {...commonProps} />
                if (slug === "analytic") return <AnalyticContent {...commonProps} />
                return null
              })()}
            </div>
          </div>
        )
      }
    </section >
  )
}

export default Hero
