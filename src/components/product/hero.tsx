"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Briefcase, Lightbulb, Music, Trophy, Footprints, Palette, type LucideIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  AudienceFlowManagement as AudienceFlowManagementContent,
  CreativeAgency as CreativeAgencyContent,
  MusicConcertManagement as MusicConcertManagementContent,
  SportEventManagement as SportEventManagementContent,
  EventActivation as EventActivationContent,
  MiceEvent as MiceEventContent,
} from "@/components/product"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface ProductHeroProps {
  heading?: string
  subheading?: string
  description?: string
  imageGridItems?: any[]
  detailBlocks?: Record<string, { title?: string; paragraphs?: string[]; imageUrl?: string; altText?: string }>
}

export function ProductHero({
  heading = "Excellence in Action",
  subheading = "Delivering success through innovation and integrity.",
  description = "We create remarkable guest experiences by combining creative vision with precise execution. Our focus on innovation and integrity ensures that every event brings your vision to life.",
  imageGridItems = [], // CMS image grid items
  detailBlocks = {},
}: ProductHeroProps) {
  const router = useRouter()
  const [introStep, setIntroStep] = useState(0)
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")
  const [introReady, setIntroReady] = useState(false)

  // Minimal fallback items (emergency only)
  const fallbackItems: { id: number; slug: string; label: string; labelLine1: string; labelLine2: string; imagePosition: "left" | "right"; imageUrl?: string; altText?: string; icon: LucideIcon }[] = [
    { id: 1, slug: "audience-flow-management", label: "Audience Flow Management", labelLine1: "Audience Flow", labelLine2: "Management", imagePosition: "left", icon: Footprints },
    { id: 2, slug: "creative-agency", label: "Creative Agency", labelLine1: "Creative", labelLine2: "Agency", imagePosition: "right", icon: Palette },
    { id: 5, slug: "event-activation", label: "Event Activation", labelLine1: "Event", labelLine2: "Activation", imagePosition: "left", icon: Trophy },
    { id: 6, slug: "mice-event", label: "Mice Event", labelLine1: "Mice", labelLine2: "Event", imagePosition: "right", icon: Briefcase },
    { id: 3, slug: "music-concert-management", label: "Music Concert Management", labelLine1: "Music Concert", labelLine2: "Management", imagePosition: "left", icon: Music },
    { id: 4, slug: "sport-event-management", label: "Sport Event Management", labelLine1: "Sport Event", labelLine2: "Management", imagePosition: "right", icon: Lightbulb },
  ]

  const desiredCount = fallbackItems.length

  // Primary: Use CMS image grid. Fallback: show gradient placeholder
  const allowedSlugs = fallbackItems.map((i) => i.slug)

  const getIconBySlug = (slug: string): LucideIcon => {
    const map: Record<string, LucideIcon> = {
      "audience-flow-management": Footprints,
      "creative-agency": Palette,
      "event-activation": Trophy,
      "mice-event": Briefcase,
      "music-concert-management": Music,
      "sport-event-management": Lightbulb,
    }
    return map[slug] || Briefcase
  }

  const normalizeProductSlug = (slug: string, index: number) => {
    if (allowedSlugs.includes(slug)) return slug
    return allowedSlugs[index] || slug
  }

  const useCMSImages = imageGridItems && imageGridItems.length > 0
  let items = useCMSImages
    ? imageGridItems.map((item: any, index: number) => {
      const mappedSlug = normalizeProductSlug(item.slug, index)
      return {
        id: Number(item.id) || item.position || index + 1,
        slug: mappedSlug,
        label: item.label,
        labelLine1: item.labelLine1 || "",
        labelLine2: item.labelLine2 || "",
        imagePosition: item.imagePosition || "left",
        imageUrl: item.imageUrl ?? undefined,
        altText: item.altText ?? undefined,
        icon: getIconBySlug(mappedSlug),
      }
    })
    : fallbackItems

  // Pad with fallback items to preserve 6-tile layout when CMS data is partial
  if (useCMSImages && items.length < desiredCount) {
    const existingSlugs = new Set(items.map((i) => i.slug))
    const padded = [...items]
    for (const fb of fallbackItems) {
      if (padded.length >= desiredCount) break
      if (existingSlugs.has(fb.slug)) continue
      padded.push({ ...fb, id: fb.id + 1000 })
    }
    items = padded
  }

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

  const handleCardClick = (id: string | number) => {
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
  const detailMap = detailBlocks || {}

  return (
    <section className={`relative flex-1 min-h-0 w-full flex items-start -mt-8 lg:mt-0 ${selectedId ? "pt-8" : "pt-8"} overflow-visible transition-all duration-500`}>
      <div className={`relative z-10 flex flex-col items-center justify-start w-full max-w-screen-xl mx-auto lg:px-8`}>
        {!selectedId && (
          <div className="flex flex-col lg:flex-row lg:items-start w-full gap-12 lg:gap-20">
            {/* Hero Text Section */}
            <div className="lg:flex-1 flex flex-col justify-start">
              <div className={`w-full transition-all duration-1000 ease-premium ${introStep < items.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"}`}>
                {introStep > 0 && (
                  <>
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

                    </div>

                    {/* Mobile/Tablet View (Accordion) */}
                    <div className="lg:hidden w-full">
                      <Accordion type="single" collapsible className="w-full flex flex-col gap-4">
                        <AccordionItem value="excellence" className="border-none">
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
                  const isStateOne = selectedId === null
                  const isIntroActive = introStep <= index
                  const introClass = isIntroActive ? "opacity-0 translate-y-12 blur-lg" : "opacity-100 translate-y-0 blur-0"
                  const scaleClass = !isStateOne || introStep < totalIntroSteps ? "scale-100" : hoveredId === item.id ? "scale-[1.09]" : hoveredId === null ? "scale-100" : "scale-95 opacity-60 blur-[1px]"

                  // Bento Grid Classes
                  let bentoClass = ""
                  if (index === 0) bentoClass = "col-span-2 aspect-[2/1] md:col-span-2 md:row-start-1 md:col-start-1"
                  else if (index === 1) bentoClass = "col-span-1 row-span-2 h-full lg:h-full md:col-span-1 md:row-start-1 md:col-start-3 md:row-span-1 md:aspect-square md:h-auto"
                  else if (index === 2) bentoClass = "col-span-1 aspect-square md:col-span-1 md:row-start-2 md:col-start-1"
                  else if (index === 3) bentoClass = "col-span-1 aspect-square md:col-span-1 md:row-start-2 md:col-start-2"
                  else if (index === 4) bentoClass = "col-span-2 aspect-[2/1] md:col-span-2 md:row-start-3 md:col-start-1"
                  else if (index === 5) bentoClass = "col-span-2 aspect-[2/1] md:col-span-1 md:row-start-2 md:col-start-3 md:row-span-2 md:h-full md:aspect-auto"

                  return (
                    <div key={item.id}
                      className={`transition-all duration-700 ease-premium transform-gpu w-full ${bentoClass} ${introClass} ${scaleClass} ${introStep < totalIntroSteps ? "pointer-events-none" : ""}`}
                      onMouseEnter={() => introDone && setHoveredId(item.id)}
                      onMouseLeave={() => introDone && setHoveredId(null)}>
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
                              alt={item.altText || item.label || 'JUARA Products'}
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
                            <h3 className="text-lg font-medium text-white tracking-wide group-hover:text-text-50 transition-colors duration-300 leading-tight">{item.label}</h3>
                          </div>
                        </div>
                      </div>
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

                if (slug === "audience-flow-management") return <AudienceFlowManagementContent {...commonProps} detailBlock={detailMap[slug]} />
                if (slug === "creative-agency") return <CreativeAgencyContent {...commonProps} detailBlock={detailMap[slug]} />
                if (slug === "music-concert-management") return <MusicConcertManagementContent {...commonProps} detailBlock={detailMap[slug]} />
                if (slug === "sport-event-management") return <SportEventManagementContent {...commonProps} detailBlock={detailMap[slug]} />
                if (slug === "event-activation") return <EventActivationContent {...commonProps} detailBlock={detailMap[slug]} />
                if (slug === "mice-event") return <MiceEventContent {...commonProps} detailBlock={detailMap[slug]} />
                return null
              })()}
            </div>
          </>
        )}
      </div>
    </section >
  )
}
