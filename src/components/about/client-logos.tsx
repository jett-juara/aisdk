"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { motion, useReducedMotion, useMotionValue, useTransform, useAnimationFrame } from "framer-motion"

const logos = [
  "abc", "angkasapura", "axa", "belfoods", "bintangtoedjoe", "bkkbn", "bukalapak", "cocacola", "danone",
  "djarum", "duakelinci", "dunhill", "gudanggaram", "haan", "honda", "indosat", "injourney", "kemenag",
  "kemnaker", "kimbo", "komdigi", "mayora", "mgpa", "nugreentea", "pwc", "sariroti", "telkom", "umc"
]

// Split logos into 3 rows
const row1Logos = logos.slice(0, 9)
const row2Logos = logos.slice(9, 18)
const row3Logos = logos.slice(18, 28)

export function AboutClientLogos() {
  const [isCoarse, setIsCoarse] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(pointer: coarse)")
    const update = () => setIsCoarse(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const maskStyle = {
    maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
    WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat"
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden py-2 w-full" style={maskStyle}>
      <MarqueeRow logos={row1Logos} direction="right" speed={15} isCoarse={isCoarse} />
      <MarqueeRow logos={row2Logos} direction="left" speed={15} isCoarse={isCoarse} />
      <MarqueeRow logos={row3Logos} direction="right" speed={15} isCoarse={isCoarse} />
    </div>
  )
}

interface MarqueeRowProps {
  logos: string[]
  direction: "left" | "right"
  speed: number
  isCoarse: boolean
}

function MarqueeRow({ logos, direction, speed, isCoarse }: MarqueeRowProps) {
  const [activeLogoKey, setActiveLogoKey] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  // Pause if:
  // 1. Desktop: Mouse is hovering the row
  // 2. Mobile: A specific logo is active (tapped)
  const isPaused = activeLogoKey !== null || isHovered

  // Duplicate logos to ensure seamless loop
  const repeatedLogos = [...logos, ...logos, ...logos, ...logos]

  // Animation state
  // We use a motion value to drive the X position manually
  // 0% is start, -50% is the loop point (since we duplicated logos 4x, moving 50% shows the first half)
  const x = useMotionValue(0)
  const xPercent = useTransform(x, (v) => `${v}%`)
  const containerRef = useRef<HTMLDivElement>(null)

  useAnimationFrame((t, delta) => {
    if (shouldReduceMotion || isPaused) return

    // Calculate movement based on speed (seconds per loop)
    // Total distance to travel is 50% (0 to -50 or -50 to 0)
    // Speed is seconds to travel 50%
    // Delta is ms since last frame
    const movePercent = (delta / 1000) * (50 / speed)

    let newX = x.get()

    if (direction === "left") {
      newX -= movePercent
      // Wrap around: if we go past -50%, reset to 0%
      if (newX <= -50) {
        newX = 0
      }
    } else {
      newX += movePercent
      // Wrap around: if we go past 0%, reset to -50%
      if (newX >= 0) {
        newX = -50
      }
    }

    x.set(newX)
  })

  // Initialize position based on direction
  useEffect(() => {
    if (direction === "right") {
      x.set(-50)
    } else {
      x.set(0)
    }
  }, [direction, x])

  const handleInteractionStart = () => setIsHovered(true)
  const handleInteractionEnd = () => setIsHovered(false)

  const handleLogoToggle = (key: string) => {
    setActiveLogoKey(prev => prev === key ? null : key)
  }

  return (
    <div
      className="relative flex w-full overflow-hidden"
      onMouseEnter={!isCoarse ? handleInteractionStart : undefined}
      onMouseLeave={!isCoarse ? handleInteractionEnd : undefined}
      ref={containerRef}
    >
      <motion.div
        className="flex items-center gap-2 md:gap-3 lg:gap-3 w-max min-w-full"
        style={{ x: xPercent }}
      >
        {repeatedLogos.map((logo, idx) => {
          const key = `${logo}-${idx}`
          return (
            <LogoItem
              key={key}
              logo={logo}
              isActive={activeLogoKey === key}
              isCoarse={isCoarse}
              priority={idx < 10}
              onToggle={() => handleLogoToggle(key)}
            />
          )
        })}
      </motion.div>
    </div>
  )
}

interface LogoItemProps {
  logo: string
  isActive: boolean
  isCoarse: boolean
  priority: boolean
  onToggle: () => void
}

function LogoItem({ logo, isActive, isCoarse, priority, onToggle }: LogoItemProps) {
  const [aspectRatio, setAspectRatio] = useState(1)
  const [isHovered, setIsHovered] = useState(false)

  const handleImageLoad = (img: HTMLImageElement) => {
    const ratio = img.naturalWidth / img.naturalHeight
    setAspectRatio(ratio < 1.3 ? 1 : 1.6)
  }

  const BG_INSET = "inset-2 md:inset-3 lg:inset-3"
  const IMG_INSET = "inset-4 md:inset-5 lg:inset-5"

  // Determine if color should be shown
  const showColor = isCoarse ? isActive : isHovered
  // Determine if we should scale up
  const shouldScale = isCoarse ? isActive : isHovered

  return (
    <motion.div
      className="group relative h-20 md:h-24 lg:h-28 w-[140px] md:w-[180px] lg:w-[200px] flex items-center justify-center select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation() // Prevent bubbling
        onToggle()
      }}
      animate={{ scale: shouldScale ? 1.1 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div
        className="relative h-full transition-all duration-300"
        style={{ aspectRatio }}
      >
        {/* Hover/Active Background */}
        <motion.div
          className={`absolute z-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl rounded-xl ${BG_INSET}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: showColor ? 1 : 0,
            scale: showColor ? 1 : 0.9
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Gray Logo */}
        <div className={`absolute z-10 ${IMG_INSET}`}>
          <Image
            src={`/client-logo/gray/${logo}-gray.png`}
            alt={logo}
            fill
            sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
            className={`object-contain transition-opacity duration-300 ${showColor ? "opacity-0" : "opacity-100"}`}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            onLoad={(e) => handleImageLoad(e.currentTarget)}
          />
        </div>

        {/* Color Logo */}
        <div className={`absolute z-10 ${IMG_INSET}`}>
          <Image
            src={`/client-logo/color/${logo}-color.png`}
            alt={logo}
            fill
            sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
            className={`object-contain transition-opacity duration-300 ${showColor ? "opacity-100" : "opacity-0"}`}
            loading={priority ? "eager" : "lazy"}
            priority={priority}
          />
        </div>
      </div>
    </motion.div>
  )
}
