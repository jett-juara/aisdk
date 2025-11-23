"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const logos = [
  "abc", "angkasapura", "axa", "belfoods", "bintangtoedjoe", "bkkbn", "bukalapak", "cocacola", "danone",
  "djarum", "duakelinci", "dunhill", "gudanggaram", "haan", "honda", "indosat", "injourney", "kemenag",
  "kemnaker", "kimbo", "komdigi", "mayora", "mgpa", "nugreentea", "pwc", "sariroti", "telkom", "umc"
]

export function AboutClientLogos() {
  const [reduceMotion, setReduceMotion] = useState(false)
  const [orientations, setOrientations] = useState<Record<string, "wide" | "square" | "tall">>({})
  const [ratios, setRatios] = useState<Record<string, number>>({})

  const BG_INSET = "inset-2 md:inset-3 lg:inset-3"
  const IMG_INSET = "inset-4 md:inset-5 lg:inset-5"

  const getAspectRatio = (logo: string) => {
    const r = ratios[logo] ?? 1.2
    return Math.min(Math.max(r, 0.85), 1.6)
  }

  const handleImageLoad = (logo: string, img: HTMLImageElement) => {
    const ratio = img.naturalWidth / img.naturalHeight
    const orient = ratio > 1.5 ? "wide" : ratio < 0.67 ? "tall" : "square"

    setOrientations((prev) => (prev[logo] ? prev : { ...prev, [logo]: orient }))
    setRatios((prev) => (prev[logo] ? prev : { ...prev, [logo]: ratio }))
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return (
    <div className="flex flex-col gap-4 overflow-hidden group/logos py-2 w-full [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
      <div className={`flex items-center gap-2 md:gap-3 lg:gap-3 w-max ${reduceMotion ? "" : "animate-marquee-right group-hover/logos:[animation-play-state:paused]"}`}>
        {[...logos.slice(0, 9), ...logos.slice(0, 9)].map((logo, idx) => (
          <div
            key={`row1-${idx}`}
            className="group relative h-20 md:h-24 lg:h-28 w-auto flex items-center justify-center transition-transform duration-300 hover:scale-[1.05] select-none transform-gpu will-change-transform px-3 md:px-4 lg:px-5"
          >
            <div
              className="relative h-full w-auto max-w-full"
              style={{ aspectRatio: getAspectRatio(logo) }}
            >
              <div className={`absolute z-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 rounded-xl transition-all duration-300 ${BG_INSET}`} />
              <div className={`absolute z-10 ${IMG_INSET}`}>
                <Image
                  src={`/client-logo/gray/${logo}-gray.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-100 group-hover:opacity-0 group-active:opacity-0 transition-opacity duration-300"
                  onLoadingComplete={(img) => handleImageLoad(logo, img)}
                />
              </div>
              <div className={`absolute z-10 ${IMG_INSET}`}>
                <Image
                  src={`/client-logo/color/${logo}-color.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`flex items-center gap-2 md:gap-3 lg:gap-3 w-max ${reduceMotion ? "" : "animate-marquee-left group-hover/logos:[animation-play-state:paused]"}`}>
        {[...logos.slice(9, 18), ...logos.slice(9, 18)].map((logo, idx) => (
          <div
            key={`row2-${idx}`}
            className="group relative h-20 md:h-24 lg:h-28 w-auto flex items-center justify-center transition-transform duration-300 hover:scale-[1.05] select-none transform-gpu will-change-transform px-3 md:px-4 lg:px-5"
          >
            <div
              className="relative h-full w-auto max-w-full"
              style={{ aspectRatio: getAspectRatio(logo) }}
            >
              <div className={`absolute z-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 rounded-xl transition-all duration-300 ${BG_INSET}`} />
              <div className={`absolute z-10 ${IMG_INSET}`}>
                <Image
                  src={`/client-logo/gray/${logo}-gray.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-100 group-hover:opacity-0 group-active:opacity-0 transition-opacity duration-300"
                  onLoadingComplete={(img) => handleImageLoad(logo, img)}
                />
              </div>
              <div className={`absolute z-10 ${IMG_INSET}`}>
                <Image
                  src={`/client-logo/color/${logo}-color.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`flex items-center gap-2 md:gap-3 lg:gap-3 w-max ${reduceMotion ? "" : "animate-marquee-right group-hover/logos:[animation-play-state:paused]"}`}>
        {[...logos.slice(18, 28), ...logos.slice(18, 28)].map((logo, idx) => (
          <div
            key={`row3-${idx}`}
            className="group relative h-20 md:h-24 lg:h-28 w-auto flex items-center justify-center transition-transform duration-300 hover:scale-[1.05] select-none transform-gpu will-change-transform px-3 md:px-4 lg:px-5"
          >
            <div
              className="relative h-full w-auto max-w-full"
              style={{ aspectRatio: getAspectRatio(logo) }}
            >
              <div className={`absolute z-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 rounded-xl transition-all duration-300 ${BG_INSET}`} />
              <div className={`absolute z-10 ${IMG_INSET}`}>
                <Image
                  src={`/client-logo/gray/${logo}-gray.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-100 group-hover:opacity-0 group-active:opacity-0 transition-opacity duration-300"
                  onLoadingComplete={(img) => handleImageLoad(logo, img)}
                />
              </div>
              <div className={`absolute z-10 ${IMG_INSET}`}>
                <Image
                  src={`/client-logo/color/${logo}-color.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
