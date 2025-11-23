"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

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
  const maskStyle = {
    maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
    WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat"
  }

  return (
    <div className="flex flex-col gap-8 overflow-x-hidden py-8 w-full" style={maskStyle}>
      <MarqueeRow logos={row1Logos} direction="right" duration={30} />
      <MarqueeRow logos={row2Logos} direction="left" duration={30} />
      <MarqueeRow logos={row3Logos} direction="right" duration={30} />
    </div>
  )
}

interface MarqueeRowProps {
  logos: string[]
  direction: "left" | "right"
  duration: number
}

function MarqueeRow({ logos, direction, duration }: MarqueeRowProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isPausedRef = useRef(false)
  const offsetRef = useRef(direction === "right" ? -33.333 : 0)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>()

  // Duplicate logos 3x for seamless loop
  const repeatedLogos = [...logos, ...logos, ...logos]

  useEffect(() => {
    offsetRef.current = direction === "right" ? -33.333 : 0
    lastTimeRef.current = undefined
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${offsetRef.current}%, 0, 0)`
      trackRef.current.style.willChange = "transform"
    }
    const animate = (currentTime: number) => {
      if (lastTimeRef.current === undefined) {
        lastTimeRef.current = currentTime
      }

      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      if (!isPausedRef.current && trackRef.current) {
        const speed = 33.333 / (duration * 1000) // percent per millisecond
        const movement = deltaTime * speed

        let newOffset = direction === "left" ? offsetRef.current - movement : offsetRef.current + movement

        // Loop at 33.333% boundaries
        if (direction === "left" && newOffset <= -33.333) {
          newOffset += 33.333
        } else if (direction === "right" && newOffset >= 0) {
          newOffset -= 33.333
        }

        offsetRef.current = newOffset
        trackRef.current.style.transform = `translate3d(${newOffset}%, 0, 0)`
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [duration, direction])

  return (
    <div
      className="relative flex w-full overflow-x-hidden py-4 group"
      onMouseEnter={() => {
        isPausedRef.current = true
      }}
      onMouseLeave={() => {
        isPausedRef.current = false
      }}
    >
      <div
        ref={trackRef}
        className="flex items-center gap-2 md:gap-3 lg:gap-3"
      >
        {repeatedLogos.map((logo, idx) => (
          <LogoItem key={`${logo}-${idx}`} logo={logo} />
        ))}
      </div>
    </div>
  )
}

interface LogoItemProps {
  logo: string
}

function LogoItem({ logo }: LogoItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1.6)

  const handleImageLoad = (img: HTMLImageElement) => {
    const ratio = img.naturalWidth / img.naturalHeight
    setAspectRatio(ratio < 1.3 ? 1 : 1.6)
  }

  return (
    <div
      className="group relative h-20 md:h-24 lg:h-28 w-[140px] md:w-[180px] lg:w-[200px] flex items-center justify-center select-none cursor-pointer transition-transform duration-300 hover:scale-110"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative h-full transition-all duration-300"
        style={{ aspectRatio }}
      >
        {/* Hover Background */}
        <div
          className={`absolute z-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl rounded-xl transition-opacity duration-300 inset-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Gray Logo */}
        <div className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}>
          <div className="relative w-full h-full">
            <Image
              src={`/client-logo/gray/${logo}-gray.png`}
              alt={`${logo} logo gray`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 140px, 200px"
              loading="eager"
              priority
              onLoad={(e) => handleImageLoad(e.currentTarget)}
              draggable={false}
            />
          </div>
        </div>

        {/* Color Logo */}
        <div className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <div className="relative w-full h-full">
            <Image
              src={`/client-logo/color/${logo}-color.png`}
              alt={`${logo} logo color`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 140px, 200px"
              loading="eager"
              priority
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
