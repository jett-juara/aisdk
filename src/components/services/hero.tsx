"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Wand2, Workflow, Ship, Landmark, Lightbulb, Settings, Truck, ShieldCheck } from "lucide-react"
import {
  CreativePlanDev as CreativePlanDevContent,
  ExecutionHandling as ExecutionHandlingContent,
  TalentLogMng as TalentLogMngContent,
  LocalAuthLiaison as LocalAuthLiaisonContent,
} from "@/components/services"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ServicesHeroProps {
  heading?: string
  subheading?: string
  description?: string
}

export function ServicesHero({
  heading = "End-to-End Services",
  subheading = "From planning to execution—measured, secure, and on time.",
  description = "We manage strategy, field execution, logistics, and authority liaison with clear SOPs. Our focus is on governance, compliance, and delivering a seamless audience experience.",
}: ServicesHeroProps) {
  const router = useRouter()
  const [introStep, setIntroStep] = useState(0)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")
  const [introReady, setIntroReady] = useState(false)

  const items: { id: number; slug: string; label: string; labelLine1: string; labelLine2: string; icon: LucideIcon; imagePosition: "left" | "right" }[] = [
    { id: 1, slug: "creative-and-plan-development", label: "Creative & Plan Development", labelLine1: "Creative & Plan", labelLine2: "Development", icon: Lightbulb, imagePosition: "left" },
    { id: 3, slug: "talent-and-logistic-management", label: "Talent & Logistic Management", labelLine1: "Talent & Logistic", labelLine2: "Management", icon: Truck, imagePosition: "left" },
    { id: 2, slug: "execution-handling", label: "Execution Handling", labelLine1: "Execution", labelLine2: "Handling", icon: Settings, imagePosition: "right" },
    { id: 4, slug: "local-authority-liaison", label: "Local Authority Liaison", labelLine1: "Local Authority", labelLine2: "Liaison", icon: ShieldCheck, imagePosition: "right" },
  ]

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
      detailTimerRef.current = setTimeout(() => { setDetailStage("content"); detailTimerRef.current = null }, 400)
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

  const handleCloseDetail = () => {
    if (!selectedId) return
    handleCardClick(selectedId)
  }

  const selectedItem = items.find((item) => item.id === selectedId)

  return (
    <section className={`relative flex-1 min-h-0 w-full flex items-start -mt-8 lg:mt-0 ${selectedId ? "pt-0 lg:pt-32" : "pt-0 lg:pt-32"} overflow-visible transition-all duration-500`}>
      <div className={`relative z-10 flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto lg:px-8`}>
        {!selectedId && (
          <div className="flex flex-col-reverse lg:flex-row lg:items-start w-full gap-12 lg:gap-20">
            {/* Hero Text Section */}
            <div className="lg:flex-1 flex flex-col justify-start">
              <div className={`w-full transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"}`}>
                {introStep > 0 && (
                  <div className="flex flex-col gap-8">
                    {/* Desktop View */}
                    <div className="hidden lg:flex flex-col gap-8">
                      <div>
                        <h1 className="font-headingSecondary font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em]">
                          {heading}
                        </h1>
                      </div>
                      <div className="relative pl-8">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                        <div className="space-y-4 max-w-2xl">
                          <p className="font-medium text-xl md:text-2xl text-text-50 leading-relaxed">
                            {subheading}
                          </p>
                          <p className="font-light text-lg text-text-200 leading-relaxed">
                            {description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pt-4">
                        <Button
                          className="h-12 px-8 rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105"
                          onClick={() => router.push("/contact")}
                        >
                          Let&apos;s Talk
                        </Button>
                      </div>
                    </div>

                    {/* Mobile/Tablet View (Accordion) */}
                    <div className="lg:hidden w-full">
                      <Accordion type="single" collapsible className="w-full flex flex-col gap-4">
                        <AccordionItem value="services" className="border-none">
                          <AccordionTrigger className="hover:no-underline py-2">
                            <h1 className="font-headingSecondary font-bold text-3xl md:text-4xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em] text-left">
                              {heading}
                            </h1>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="relative pl-6 mt-2 flex flex-col gap-6">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                              <p className="font-medium text-lg text-text-50 leading-relaxed">
                                {subheading}
                              </p>
                              <p className="font-light text-lg text-text-200 leading-relaxed">
                                {description}
                              </p>
                              <div className="flex justify-start w-full pt-2">
                                <Button
                                  className="h-12 px-8 rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105"
                                  onClick={() => router.push("/contact")}
                                >
                                  Let&apos;s Talk
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Grid Section */}
            <div className="w-full lg:max-w-[35vw]">
              <div className="grid grid-cols-2 gap-4 md:gap-4 auto-rows-[minmax(100px,auto)]">
                {items.map((item, index) => {
                  const isStateOne = selectedId === null
                  const isIntroActive = introStep <= index
                  const introClass = isIntroActive ? "opacity-0 translate-y-12 blur-lg" : "opacity-100 translate-y-0 blur-0"
                  const scaleClass = !isStateOne || introStep < totalIntroSteps ? "scale-100" : hoveredId === item.id ? "scale-[1.02]" : hoveredId === null ? "scale-100" : "scale-95 opacity-60 blur-[1px]"

                  // Bento Grid Classes
                  let bentoClass = ""
                  if (index === 0) bentoClass = "col-span-2 aspect-[2/1] md:col-span-2 md:row-span-1"
                  else if (index === 1) bentoClass = "col-span-1 row-span-2 h-full md:col-span-1 md:row-span-2 md:aspect-auto"
                  else if (index === 2) bentoClass = "col-span-1 aspect-square md:col-span-1 md:row-span-1"
                  else if (index === 3) bentoClass = "col-span-1 aspect-square md:col-span-1 md:row-span-1"

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
                            {/* Hover Glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-glass-bg-hover to-transparent" />

                            {/* Content */}
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
        )}

        {selectedId && (
          <>
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
                  onNavigate: handleCardClick,
                  imagePosition
                }

                if (slug === "creative-and-plan-development") return <CreativePlanDevContent {...commonProps} />
                if (slug === "execution-handling") return <ExecutionHandlingContent {...commonProps} />
                if (slug === "talent-and-logistic-management") return <TalentLogMngContent {...commonProps} />
                if (slug === "local-authority-liaison") return <LocalAuthLiaisonContent {...commonProps} />
                return null
              })()}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
