"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useHomepageAnimations } from "@/hooks/use-homepage-animations"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Route, Rocket, PartyPopper, ClipboardList, Users } from "lucide-react"
import {
  AudienceFlowManagement as AudienceFlowManagementContent,
  CreativeAgency as CreativeAgencyContent,
  MusicConcertManagement as MusicConcertManagementContent,
  SportEventManagement as SportEventManagementContent,
  EventActivation as EventActivationContent,
  MiceEvent as MiceEventContent,
} from "@/components/product"

interface ProductHeroProps {
  heading?: string
  subheading?: string
  description?: string
}

export function ProductHero({
  heading = "We strive for excellence",
  subheading = "Do our utmost to provide the best, and aim for success.",
  description = "We value excellence and integrity to deliver remarkable experiences to the guest with an emphasis on bringing innovation to the table. Putting our highest endeavor in executing ideas is our foundation to bring together the client’s visions.",
}: ProductHeroProps) {
  const router = useRouter()
  const [introStep, setIntroStep] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")
  const { getClasses } = useHomepageAnimations()
  const animationClasses = getClasses()

  const items: { id: number; slug: string; label: string; icon: LucideIcon; imagePosition: "left" | "right" }[] = [
    { id: 1, slug: "audience-flow-management", label: "Audience Flow Management", icon: Route, imagePosition: "left" },
    { id: 2, slug: "creative-agency", label: "Creative Agency", icon: Rocket, imagePosition: "right" },
    { id: 3, slug: "music-concert-management", label: "Music Concert Management", icon: PartyPopper, imagePosition: "left" },
    { id: 4, slug: "sport-event-management", label: "Sport Event Management", icon: Users, imagePosition: "right" },
    { id: 5, slug: "event-activation", label: "Event Activation", icon: ClipboardList, imagePosition: "left" },
    { id: 6, slug: "mice-event", label: "Mice Event", icon: Users, imagePosition: "right" },
  ]

  const baseClasses = "rounded-2xl border border-button-border bg-background transition-all duration-600 ease-out transform-gpu"
  const [introReady, setIntroReady] = useState(false)
  const totalIntroSteps = items.length + 1
  const introClass = (index: number) => (introStep <= index ? "opacity-0 translate-y-10 blur-md" : "opacity-100 translate-y-0 blur-0")
  const introDone = introStep >= totalIntroSteps
  const getScaleClasses = (index: number) => {
    if (introStep < totalIntroSteps) return "scale-100 shadow-none"
    if (selectedId === null) {
      if (hovered === index) return "scale-110 z-10 shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
      if (hovered === null) return "scale-100 shadow-none"
      return "scale-90 opacity-80 shadow-none"
    }
    const item = items[index]
    const isSelected = item && item.id === selectedId
    const cascadeActive = detailStage !== "idle"
    if (!cascadeActive) {
      return isSelected ? "scale-100 opacity-100" : "scale-100 opacity-80"
    }
    return isSelected ? "scale-110 opacity-100" : "scale-70 opacity-40"
  }
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const frameRef = useRef<number | null>(null)
  const resetIntroTimers = useCallback(() => {
    if (frameRef.current !== null) { cancelAnimationFrame(frameRef.current); frameRef.current = null }
    timeoutsRef.current.forEach((t) => clearTimeout(t))
    timeoutsRef.current = []
  }, [])

  useEffect(() => { return () => resetIntroTimers() }, [resetIntroTimers])
  useEffect(() => {
    const timer = setTimeout(() => { setIntroReady(true) }, 600)
    return () => { clearTimeout(timer) }
  }, [])
  useEffect(() => {
    if (!introReady || selectedId !== null) return
    resetIntroTimers()
    const initId = setTimeout(() => { setIntroStep(0) }, 0)
    timeoutsRef.current.push(initId)
    const run = (index: number) => {
      const timeoutId = setTimeout(() => {
        setIntroStep(index + 1)
        if (index < totalIntroSteps - 1) { frameRef.current = requestAnimationFrame(() => run(index + 1)) }
      }, index === 0 ? 160 : 240)
      timeoutsRef.current.push(timeoutId)
    }
    frameRef.current = requestAnimationFrame(() => run(0))
  }, [introReady, totalIntroSteps, resetIntroTimers, selectedId])

  useEffect(() => {
    if (selectedId === null) {
      const t = setTimeout(() => setDetailStage("idle"), 0)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setDetailStage("cards")
      const t2 = setTimeout(() => setDetailStage("content"), 220)
      return () => clearTimeout(t2)
    }, 0)
    return () => { clearTimeout(t) }
  }, [selectedId])

  const handleCloseDetail = () => {
    if (!selectedId) return
    handleCardClick(selectedId)
  }

  const handleCardClick = (id: number) => {
    if (!introDone) return
    if (selectedId === id) {
      setSelectedId(null)
      setDetailStage("idle")
      setIntroStep(0)
      setIntroReady(false)
      const timer = setTimeout(() => setIntroReady(true), 600)
      timeoutsRef.current.push(timer)
      return
    }
    setSelectedId(id)
  }

  const selectedItem = items.find((item) => item.id === selectedId)

  const renderDetailContent = () => {
    const slug = selectedItem?.slug
    const imagePosition = selectedItem?.imagePosition
    if (!slug) return null
    if (slug === "audience-flow-management") {
      return <AudienceFlowManagementContent stage={detailStage} onClose={handleCloseDetail} imagePosition={imagePosition} />
    }
    if (slug === "creative-agency") {
      return <CreativeAgencyContent stage={detailStage} onClose={handleCloseDetail} imagePosition={imagePosition} />
    }
    if (slug === "music-concert-management") {
      return <MusicConcertManagementContent stage={detailStage} onClose={handleCloseDetail} imagePosition={imagePosition} />
    }
    if (slug === "sport-event-management") {
      return <SportEventManagementContent stage={detailStage} onClose={handleCloseDetail} imagePosition={imagePosition} />
    }
    if (slug === "event-activation") {
      return <EventActivationContent stage={detailStage} onClose={handleCloseDetail} imagePosition={imagePosition} />
    }
    if (slug === "mice-event") {
      return <MiceEventContent stage={detailStage} onClose={handleCloseDetail} imagePosition={imagePosition} />
    }
    return null
  }

  return (
    <section className="bg-background-900 flex-1 min-h-0 w-full flex items-center">
      <div className="flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto">
        {!selectedId && (
          <div className="flex flex-col lg:flex-row lg:items-center w-full">
            <div className="w-full lg:max-w-[30vw]">
              {/* Cards menu 2x3: 2 kolom, 3 baris untuk 6 produk */}
              <div className="grid grid-cols-2 grid-rows-3 gap-3 md:gap-4 w-full">
                {items.map((item, idx) => {
                  const Icon = item.icon
                  const globalIdx = idx
                  return (
                    <div
                      key={item.slug}
                      aria-hidden="true"
                      role="button"
                      tabIndex={introDone ? 0 : -1}
                      aria-label={item.label}
                      className={`${baseClasses} ${introClass(globalIdx)} ${getScaleClasses(globalIdx)} ${
                        introStep < totalIntroSteps ? "pointer-events-none" : "cursor-pointer"
                      } group relative overflow-hidden hover:brightness-110 hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]`}
                      style={{ aspectRatio: "3 / 2" }}
                      onMouseEnter={() => introDone && !selectedId && setHovered(globalIdx)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleCardClick(item.id)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                      <div className="absolute inset-0 flex items-end p-4">
                        <div className="flex items-center gap-2">
                          <Icon
                            className="h-5 w-5 text-auth-text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
                            aria-hidden="true"
                          />
                          {/* UI text nama produk di dalam card (xxs), align left bawah */}
                          <span className="text-[0.60rem] font-medium text-auth-text-primary">
                            {item.label}
                          </span>
                        </div>
                        <span className="sr-only">{item.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="lg:flex-1 flex items-left justify-left lg:ml-5 mt-8 lg:mt-0">
              <div className="w-full p-6 lg:p-8">
                <div className="flex flex-col gap-7">
                  <h1
                    className={`font-heading font-semibold text-3xl md:text-5xl lg:text-7xl tracking-tighter text-text-200 transition-all duration-700 ease-out transform-gpu ${animationClasses.svg}`}
                  >
                    <span>{heading}</span>
                  </h1>
                  <p
                    className={`font-subheading text-lg md:text-2xl md:mt-2 lg:text-3xl lg:mt-0 text-text-50 transition-all duration-700 ease-out ${animationClasses.text}`}
                  >
                    <span>{subheading}</span>
                  </p>
                  <p
                    className={`font-body text-lg md:text-2xl md:mt-2 lg:text-[1.2rem] lg:mt-0 text-text-50 transition-all duration-700 ease-out ${animationClasses.text}`}
                  >
                    {description}
                  </p>
                  <div className="flex items-start">
                    <Button
                      className={`font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10 transform-gpu ${animationClasses.button1}`}
                      onClick={() => router.push("/contact")}
                    >
                      Let’s Talk
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedId && (
          <>
            {/* Cards menu state 2: semua produk (Audience Flow Management, Creative Agency, Music Concert & Sport Event Management, Event Activation, Mice Event) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full">
              {items.map((item) => {
                const isSelected = item.id === selectedId
                const cascadeActive = detailStage !== "idle"
                const cardScaleClass = !cascadeActive
                  ? isSelected
                    ? "scale-100 opacity-100"
                    : "scale-100 opacity-80"
                  : isSelected
                    ? "scale-110 opacity-100"
                    : "scale-70 opacity-40"
                const cardHighlightClass =
                  isSelected && cascadeActive ? "ring-1 ring-white/40 shadow-[0_24px_56px_rgba(0,0,0,0.40)]" : "shadow-none"

                return (
                  <div
                    key={item.slug}
                    className={`transition-all duration-500 ease-out aspect-square lg:aspect-[32/9] transform-gpu ${cardScaleClass} ${cardHighlightClass}`}
                    style={{ transitionDelay: cascadeActive ? (isSelected ? "80ms" : "0ms") : "0ms" }}
                  >
                    {(() => {
                      const Icon = item.icon as LucideIcon
                      return (
                        <div
                          className="group relative rounded-[var(--radius-none)] overflow-hidden cursor-pointer border border-button-border transition-all duration-300 h-full hover:brightness-110 transform-gpu shadow-none hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
                          onClick={() => handleCardClick(item.id)}
                        >
                          <div className="absolute inset-0 auth-bg-hover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                          <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                            <div className="flex items-center gap-2">
                              <Icon
                                className="h-6 w-6 text-auth-text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
                                aria-hidden="true"
                              />
                              {/* UI text nama produk di dalam card state 2 (xxs), align left bawah */}
                              <span className="text-[0.60rem] font-medium text-auth-text-primary">
                                {item.label}
                              </span>
                            </div>
                            <span className="sr-only">{item.label}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
            <div className="w-full py-6 lg:py-8">
              {renderDetailContent()}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
