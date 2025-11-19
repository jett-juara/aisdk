"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Wand2, Workflow, Users, Ship, Landmark } from "lucide-react"
import { LocalAuthLiaison } from "@/components/services"

export default function LocalAuthorityLiaisonPage() {
  const router = useRouter()
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")

  useEffect(() => {
    const t1 = setTimeout(() => setDetailStage("cards"), 0)
    const t2 = setTimeout(() => setDetailStage("content"), 220)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const items = [
    { slug: "creative-and-plan-development", name: "Creative & Plan", icon: Wand2 },
    { slug: "execution-handling", name: "Execution Handling", icon: Workflow },
    { slug: "talent-and-logistic-management", name: "Talent & Logistic", icon: Ship },
    { slug: "local-authority-liaison", name: "Local Authority", icon: Landmark },
  ]

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
        {items.map((item) => {
          const isSelected = item.slug === "local-authority-liaison"
          const cascadeActive = detailStage !== "idle"
          const cardScaleClass = !cascadeActive
            ? isSelected ? "scale-100 opacity-100" : "scale-100 opacity-80"
            : isSelected ? "scale-110 opacity-100" : "scale-70 opacity-40"
          const cardHighlightClass = isSelected && cascadeActive ? "ring-1 ring-white/40 shadow-[0_24px_56px_rgba(0,0,0,0.40)]" : "shadow-none"

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
                    onClick={() => router.push(`/services/${item.slug}`)}
                  >
                    <div className="absolute inset-0 auth-bg-hover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                      <div className="flex items-center gap-2 justify-start">
                        <Icon className="h-9 w-9 text-auth-text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" aria-hidden="true" />
                        <span className="sr-only">{item.name}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        })}
      </div>

      <LocalAuthLiaison stage={detailStage} />
    </div>
  )
}