"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CalendarCheck, UsersRound, Cpu, ChartBarBig } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ABOUT_RESET_EVENT } from "@/lib/constants/events"
import { Event as EventContent, Community as CommunityContent, Tech as TechContent, Analytic as AnalyticContent } from "@/components/about"

const layoutConfigs = {
  1: { desktopTextOrder: "lg:order-1", desktopImageOrder: "lg:order-2", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  2: { desktopTextOrder: "lg:order-2", desktopImageOrder: "lg:order-1", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  3: { desktopTextOrder: "lg:order-1", desktopImageOrder: "lg:order-2", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  4: { desktopTextOrder: "lg:order-2", desktopImageOrder: "lg:order-1", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
} as const

const Hero = () => {
  const router = useRouter()
  const items: { id: number; slug: string; label: string; icon: LucideIcon; imagePosition: "left" | "right" }[] = [
    { id: 1, slug: "event", label: "Events", icon: CalendarCheck, imagePosition: "left" },
    { id: 2, slug: "community", label: "Community", icon: UsersRound, imagePosition: "right" },
    { id: 3, slug: "tech", label: "Tech", icon: Cpu, imagePosition: "left" },
    { id: 4, slug: "analytic", label: "Analytics", icon: ChartBarBig, imagePosition: "right" },
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
  const renderDetailContent = () => {
    const slug = selectedItem?.slug
    const imagePosition = selectedItem?.imagePosition
    if (!slug) return null
    if (slug === "event") return <EventContent stage={detailStage} onClose={handleCloseDetail} />
    if (slug === "community") return <CommunityContent stage={detailStage} onClose={handleCloseDetail} />
    if (slug === "tech") return <TechContent stage={detailStage} onClose={handleCloseDetail} />
    if (slug === "analytic") return <AnalyticContent stage={detailStage} onClose={handleCloseDetail} />
    return null
  }

  return (
    <section className="relative flex-1 min-h-0 w-full flex items-center overflow-visible">
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedId && (
          <div className="flex flex-col lg:flex-row lg:items-center w-full gap-12 lg:gap-20">
            {/* Hero Text Section */}
            <div className="lg:flex-1 flex flex-col justify-center">
              <div className={`w-full transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"}`}>
                {introStep > 0 && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <h1 className="font-headingSecondary font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-premium-gradient leading-[1.08] pb-[0.08em]">
                        Kreativitas<br />
                        <span className="text-text-50/20">×</span> Teknologi
                      </h1>
                    </div>
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-500 to-transparent rounded-full" />
                      <p className="font-light text-lg md:text-xl text-50/60 leading-relaxed max-w-2xl">
                        Kami menggabungkan kreativitas, teknologi, dan eksekusi presisi untuk menghadirkan pengalaman acara yang imersif. Berbasis data dan inovasi, setiap momen dirancang untuk melampaui ekspektasi.
                      </p>
                    </div>
                    <div className="flex items-center gap-6 pt-4">
                      <Button
                        className="h-12 px-8 rounded-full bg-button-primary text-text-50 hover:bg-button-primary-hover font-medium tracking-wide transition-all duration-300 hover:scale-105"
                        onClick={() => router.push("/contact")}
                      >
                        Start Project
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Grid Section */}
            <div className="w-full lg:max-w-[35vw]">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {items.map((item, index) => {
                  const isStateOne = selectedId === null
                  const isIntroActive = introStep <= index
                  const introClass = isIntroActive ? "opacity-0 translate-y-12 blur-lg" : "opacity-100 translate-y-0 blur-0"
                  const scaleClass = !isStateOne || introStep < totalIntroSteps ? "scale-100" : hoveredId === item.id ? "scale-[1.02]" : hoveredId === null ? "scale-100" : "scale-95 opacity-60 blur-[1px]"

                  return (
                    <div key={item.id}
                      className={`transition-all duration-700 ease-premium transform-gpu w-full aspect-square ${introClass} ${scaleClass} ${introStep < totalIntroSteps ? "pointer-events-none" : ""}`}
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
        )}

        {selectedId && (
          <>
            {/* Detail View Grid (Top) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8 lg:mb-12">
              {items.map((item) => {
                const isSelected = selectedId === item.id
                const cascadeActive = detailStage !== "idle"
                const cardScaleClass = !cascadeActive ? (isSelected ? "scale-100 opacity-100" : "scale-100 opacity-80") : (isSelected ? "scale-105 opacity-100 ring-1 ring-ring-50/20" : "scale-90 opacity-30 blur-[2px]")

                return (
                  <div key={item.id}
                    className={`transition-all duration-700 ease-premium transform-gpu aspect-square ${cardScaleClass} focus:outline-none focus-visible:outline-none`}
                    tabIndex={-1}>
                    {(() => {
                      const Icon = item.icon as LucideIcon
                      return (
                        <div className="group relative rounded-xl overflow-hidden cursor-pointer h-full glass-panel transition-all duration-300 hover:bg-glass-bg-hover focus:outline-none focus-visible:outline-none" onClick={() => handleCardClick(item.id)} tabIndex={-1}>
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center">
                            <Icon className={`h-5 w-5 ${isSelected ? "text-text-50" : "text-text-200"} transition-colors`} strokeWidth={1.5} />
                            <span className={`text-[10px] font-medium ${isSelected ? "text-text-50" : "text-text-200"} leading-tight tracking-wide`}>
                              {item.label}
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>

            {/* Detail Content Area */}
            <div className="w-full min-h-[50vh]">
              {renderDetailContent()}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Hero
