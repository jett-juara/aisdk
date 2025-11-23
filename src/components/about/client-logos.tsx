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

  const getInset = (logo: string) => {
    const o = orientations[logo] ?? "square"
    if (o === "wide") return "inset-3 md:inset-4 lg:inset-5"
    if (o === "tall") return "inset-3 md:inset-4 lg:inset-5"
    return "inset-2 md:inset-3 lg:inset-4"
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
    <div className="flex flex-col gap-12 overflow-hidden group/logos py-8 w-full [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
        <div className={`flex gap-8 w-max ${reduceMotion ? "" : "animate-marquee-right group-hover/logos:[animation-play-state:paused]"}`}>
          {[...logos.slice(0, 9), ...logos.slice(0, 9)].map((logo, idx) => (
            <div key={`row1-${idx}`} className="group relative h-16 w-[160px] md:w-[180px] lg:w-[200px] flex items-center justify-center p-3 transition-transform duration-300 hover:scale-125 select-none transform-gpu will-change-transform">
              <div className={`absolute z-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 rounded-xl transition-all duration-300 ${getInset(logo)}`} />
              <div className={`absolute z-10 ${getInset(logo)}`}>
                <Image
                  src={`/client-logo/gray/${logo}-gray.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-100 group-hover:opacity-0 group-active:opacity-0 transition-opacity duration-300"
                  onLoadingComplete={(img) => {
                    const ratio = img.naturalWidth / img.naturalHeight
                    const orient = ratio > 1.5 ? "wide" : ratio < 0.67 ? "tall" : "square"
                    setOrientations((prev) => (prev[logo] ? prev : { ...prev, [logo]: orient }))
                  }}
                />
              </div>
              <div className={`absolute z-10 ${getInset(logo)}`}>
                <Image
                  src={`/client-logo/color/${logo}-color.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          ))}
        </div>

        <div className={`flex gap-8 w-max ${reduceMotion ? "" : "animate-marquee-left group-hover/logos:[animation-play-state:paused]"}`}>
          {[...logos.slice(9, 18), ...logos.slice(9, 18)].map((logo, idx) => (
            <div key={`row2-${idx}`} className="group relative h-16 w-[160px] md:w-[180px] lg:w-[200px] flex items-center justify-center p-3 transition-transform duration-300 hover:scale-125 select-none transform-gpu will-change-transform">
              <div className={`absolute z-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 rounded-xl transition-all duration-300 ${getInset(logo)}`} />
              <div className={`absolute z-10 ${getInset(logo)}`}>
                <Image
                  src={`/client-logo/gray/${logo}-gray.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-100 group-hover:opacity-0 group-active:opacity-0 transition-opacity duration-300"
                />
              </div>
              <div className={`absolute z-10 ${getInset(logo)}`}>
                <Image
                  src={`/client-logo/color/${logo}-color.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          ))}
        </div>

        <div className={`flex gap-8 w-max ${reduceMotion ? "" : "animate-marquee-right group-hover/logos:[animation-play-state:paused]"}`}>
          {[...logos.slice(18, 28), ...logos.slice(18, 28)].map((logo, idx) => (
            <div key={`row3-${idx}`} className="group relative h-16 w-[160px] md:w-[180px] lg:w-[200px] flex items-center justify-center p-3 transition-transform duration-300 hover:scale-125 select-none transform-gpu will-change-transform">
              <div className={`absolute z-0 bg-gradient-to-br from-white via-white/90 to-white/50 backdrop-blur-xl border border-white/60 shadow-xl opacity-0 group-hover:opacity-100 group-active:opacity-100 rounded-xl transition-all duration-300 ${getInset(logo)}`} />
              <div className={`absolute z-10 ${getInset(logo)}`}>
                <Image
                  src={`/client-logo/gray/${logo}-gray.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-100 group-hover:opacity-0 group-active:opacity-0 transition-opacity duration-300"
                />
              </div>
              <div className={`absolute z-10 ${getInset(logo)}`}>
                <Image
                  src={`/client-logo/color/${logo}-color.png`}
                  alt={logo}
                  fill
                  sizes="(max-width: 768px) 160px, (max-width: 1024px) 180px, 200px"
                  className="object-contain opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                />
              </div>
            </div>
          ))}
        </div>
    </div>
  )
}