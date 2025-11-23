"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { motion, useAnimation, useReducedMotion } from "framer-motion"

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
      <MarqueeRow logos={row1Logos} direction="right" speed={30} isCoarse={isCoarse} />
      <MarqueeRow logos={row2Logos} direction="left" speed={30} isCoarse={isCoarse} />
      <MarqueeRow logos={row3Logos} direction="right" speed={30} isCoarse={isCoarse} />
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
  const [isPaused, setIsPaused] = useState(false)
  const controls = useAnimation()
  const shouldReduceMotion = useReducedMotion()

  // Duplicate logos to ensure seamless loop
  // We need enough copies to fill the screen width + buffer
  // 4 copies should be plenty for most screens given the logo width
  const repeatedLogos = [...logos, ...logos, ...logos, ...logos]

  useEffect(() => {
    if (shouldReduceMotion) return

    const startAnimation = async () => {
      // If moving left, we start at 0 and move to -50%
      // If moving right, we start at -50% and move to 0%
      await controls.start({
        x: direction === "left" ? "0%" : "-50%",
        transition: {
          duration: 0, // Set initial position instantly
        }
      })

      controls.start({
        x: direction === "left" ? "-50%" : "0%",
        transition: {
          duration: speed,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      })
    }

    startAnimation()
  }, [controls, direction, speed, shouldReduceMotion])

  // Handle pause state
  useEffect(() => {
    if (isPaused) {
      controls.stop()
    } else {
      if (!shouldReduceMotion) {
        controls.start({
          x: direction === "left" ? "-50%" : "0%",
          transition: {
            duration: speed,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          },
        })
      }
    }
  }, [isPaused, controls, direction, speed, shouldReduceMotion])

  const handleInteractionStart = () => setIsPaused(true)
  const handleInteractionEnd = () => setIsPaused(false)

  // On mobile (coarse pointer), tap toggles pause
  const handleTap = () => {
    if (isCoarse) {
      setIsPaused(prev => !prev)
    }
  }

  return (
    <div
      className="relative flex w-full overflow-hidden"
      onMouseEnter={!isCoarse ? handleInteractionStart : undefined}
      onMouseLeave={!isCoarse ? handleInteractionEnd : undefined}
      onClick={handleTap}
    >
      <motion.div
        className="flex items-center gap-2 md:gap-3 lg:gap-3 w-max min-w-full"
        animate={controls}
        initial={{ x: direction === "left" ? "0%" : "-50%" }}
      >
        {repeatedLogos.map((logo, idx) => (
          <LogoItem
            key={`${logo}-${idx}`}
            logo={logo}
            isRowPaused={isPaused}
            isCoarse={isCoarse}
            priority={idx < 10}
          />
        ))}
      </motion.div>
    </div>
  )
}

interface LogoItemProps {
  logo: string
  isRowPaused: boolean
  isCoarse: boolean
  priority: boolean
}

function LogoItem({ logo, isRowPaused, isCoarse, priority }: LogoItemProps) {
  const [aspectRatio, setAspectRatio] = useState(1)
  const [isHovered, setIsHovered] = useState(false)

  const handleImageLoad = (img: HTMLImageElement) => {
    const ratio = img.naturalWidth / img.naturalHeight
    // Snap to Square (1) or Landscape (1.6) based on threshold
    setAspectRatio(ratio < 1.3 ? 1 : 1.6)
  }

  const BG_INSET = "inset-2 md:inset-3 lg:inset-3"
  const IMG_INSET = "inset-4 md:inset-5 lg:inset-5"

  // Determine if color should be shown
  // 1. Desktop: Show on hover
  // 2. Mobile: Show if row is paused (tapped)
  const showColor = isCoarse ? isRowPaused : isHovered

  return (
    <div
      className="group relative h-20 md:h-24 lg:h-28 w-[140px] md:w-[180px] lg:w-[200px] flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
    </div>
  )
}

