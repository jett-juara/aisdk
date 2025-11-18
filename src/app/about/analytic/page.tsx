"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { CalendarCheck, UsersRound, Cpu, ChartBarBig } from "lucide-react"

export default function AboutAnalyticsPage() {
  const router = useRouter()
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")

  useEffect(() => {
    const t1 = setTimeout(() => setDetailStage("cards"), 0)
    const t2 = setTimeout(() => setDetailStage("content"), 220)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const items = [
    { id: 1, slug: "events", name: "Events", description: "Premium event experiences", icon: CalendarCheck },
    { id: 2, slug: "community", name: "Community", description: "Community-driven innovation", icon: UsersRound },
    { id: 3, slug: "tech", name: "Tech", description: "Next-generation experiences", icon: Cpu },
    { id: 4, slug: "analytic", name: "Analytic", description: "Data-driven insights", icon: ChartBarBig },
  ]

  const paragraphs = [
    "Data memberikan pemahaman mendalam. JUARA Analytics menggunakan insights berbasis data untuk mengoptimalkan strategi dan memaksimalkan ROI dari setiap kampanye, memberikan competitive advantage yang measurable dan actionable.",
    "Platform analytics kami mengumpulkan dan menganalisis data real-time dari berbagai touchpoints: social media engagement, audience behavior, sentiment analysis, hingga conversion metrics. Visual dashboards yang intuitive membantu stakeholders make informed decisions berdasarkan evidence.",
    "Dengan advanced machine learning algorithms, kami dapat memprediksi trends, mengidentifikasi patterns yang tidak obvious, dan memberikan recommendations yang personalized. Analytics kami tidak hanya report what happened, tetapi explain why it happened dan predict what will happen next.",
    "ROI measurement adalah core dari everything yang kami lakukan. JUARA Analytics membantu clients understand true impact dari setiap event, dari brand awareness metrics hingga revenue attribution, dari audience retention rates hingga lifetime value calculations."
  ]

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-4 gap-6 w-full">
        {items.map((item) => {
          const isSelected = item.slug === "analytics"
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
                    onClick={() => router.push(`/about/${item.slug}`)}
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

      <Analytic stage={detailStage} />
    </div>
  )
}
import { Analytic } from "@/components/about"