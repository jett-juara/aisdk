"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useHomepageAnimations } from "@/hooks/use-homepage-animations"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Route, Rocket, PartyPopper, ClipboardList, Users } from "lucide-react"

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
  const { getClasses } = useHomepageAnimations()
  const animationClasses = getClasses()

  const items: { slug: string; label: string; icon: LucideIcon }[] = [
    { slug: "audience-flow-management", label: "Audience Flow Management", icon: Route },
    { slug: "creative-agency", label: "Creative Agency", icon: Rocket },
    { slug: "music-concert-and-sport-event-management", label: "Music Concert & Sport Event Management", icon: PartyPopper },
    { slug: "event-activation", label: "Event Activation", icon: ClipboardList },
    { slug: "mice-event", label: "Mice Event", icon: Users },
  ]

  const baseClasses = "rounded-2xl border border-button-border bg-background transition-all duration-600 ease-out transform-gpu"
  const [introReady, setIntroReady] = useState(false)
  const totalIntroSteps = items.length + 1
  const introClass = (index: number) => (introStep <= index ? "opacity-0 translate-y-10 blur-md" : "opacity-100 translate-y-0 blur-0")
  const introDone = introStep >= totalIntroSteps
  const getScaleClasses = (index: number) => {
    if (introStep < totalIntroSteps) return "scale-100 shadow-none"
    if (hovered === index) return "scale-110 z-10 shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
    if (hovered === null) return "scale-100 shadow-none"
    return "scale-90 opacity-80 shadow-none"
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
    if (!introReady) return
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
  }, [introReady, totalIntroSteps, resetIntroTimers])

  return (
    <section className="bg-background-900 flex-1 min-h-0 w-full flex items-center">
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
              className={`font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10 transform-gpu ${animationClasses.button1}`}
              onClick={() => router.push("/contact")}
            >
              Let’s Talk
            </Button>
          </div>
        </div>

        <div className="right-container w-full lg:w-2/5 relative z-10 flex items-center justify-center">
          <div className="flex w-full flex-col gap-3 md:gap-4">
            <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
              {items.slice(0, 2).map((item, idx) => {
                const Icon = item.icon
                const globalIdx = idx
                return (
                  <div
                    key={item.slug}
                    aria-hidden="true"
                    role="button"
                    tabIndex={introDone ? 0 : -1}
                    aria-label={item.label}
                    className={`${baseClasses} ${introClass(globalIdx)} ${getScaleClasses(globalIdx)} ${introStep < totalIntroSteps ? "pointer-events-none" : "cursor-pointer"} group relative overflow-hidden hover:brightness-110 hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]`}
                    style={{ aspectRatio: "1 / 1" }}
                    onMouseEnter={() => introDone && setHovered(globalIdx)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => introDone && router.push(`/product/${item.slug}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                    <div className="absolute inset-0 flex items-end p-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-6 w-6 text-auth-text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" aria-hidden="true" />
                        <span className="sr-only">{item.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full">
              {items.slice(2).map((item, idx) => {
                const Icon = item.icon
                const globalIdx = idx + 2
                return (
                  <div
                    key={item.slug}
                    aria-hidden="true"
                    role="button"
                    tabIndex={introDone ? 0 : -1}
                    aria-label={item.label}
                    className={`${baseClasses} ${introClass(globalIdx)} ${getScaleClasses(globalIdx)} ${introStep < totalIntroSteps ? "pointer-events-none" : "cursor-pointer"} group relative overflow-hidden hover:brightness-110 hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]`}
                    style={{ aspectRatio: "1 / 1" }}
                    onMouseEnter={() => introDone && setHovered(globalIdx)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => introDone && router.push(`/product/${item.slug}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                    <div className="absolute inset-0 flex items-end p-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-6 w-6 text-auth-text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" aria-hidden="true" />
                        <span className="sr-only">{item.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}