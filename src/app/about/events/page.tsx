"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CompanyCard from "@/components/about-page/company-card"
import { CalendarCheck, UsersRound, Cpu, ChartBarBig } from "lucide-react"

export default function AboutEventsPage() {
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
    { id: 4, slug: "analytics", name: "Analytics", description: "Data-driven insights", icon: ChartBarBig },
  ]

  const paragraphs = [
    "JUARA Events menghadirkan pengalaman acara premium yang tak terlupakan. Kami menggabungkan kreativitas, teknologi, dan eksekusi sempurna untuk menciptakan momen yang berkesan bagi audiences Anda.",
    "Dengan pendekatan 'off the grid' yang signature, kami menciptakan event-event unik di lokasi-lokasi tak terduga yang menantang batasan konvensional. Setiap konsep dirancang khusus untuk memberikan pengalaman immersive yang tidak hanya menghibur, tetapi juga bermakna dan transformatif.",
    "Tim kami berpengalaman dalam mengelola event skala besar hingga intimate, dari konser musik hingga corporate gathering, dari festival komunitas hingga launch produk eksklusif. Kami percaya bahwa setiap event adalah kesempatan untuk menciptakan kenangan yang akan dikenang selamanya.",
    "Dengan teknologi terdepan dan jaringan mitra yang kuat, JUARA Events memastikan setiap detail executes flawlessly. Dari perencanaan konsep hingga evaluasi pasca-event, kami hadir sebagai partner strategis yang memahami visi Anda dan berkomitmen mencapai hasil yang超越 ekspektasi."
  ]

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-4 gap-6 w-full">
        {items.map((item) => {
          const isSelected = item.slug === "events"
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
              <CompanyCard
                name={item.name}
                description={item.description}
                icon={item.icon}
                showDescription={false}
                onSelect={() => router.push(`/about/${item.slug}`)}
              />
            </div>
          )
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 py-6 lg:py-8">
        <div className="order-1 lg:basis-[40%] flex flex-col w-full">
          <div className={`w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20 transition-all duration-700 ease-out ${detailStage === "content" ? "opacity-100 blur-0" : "opacity-60 blur-[3px]"}`} aria-hidden="true" />
        </div>
        <div className="order-2 lg:basis-[60%] p-4 lg:p-8 flex flex-col gap-4 pr-0 lg:pr-10 cursor-pointer" onClick={() => router.push('/about')}>
          <h2 className="text-2xl font-heading font-semibold">Premium event experiences</h2>
          {paragraphs.map((p, idx) => (
            <p key={idx} className={`auth-text-secondary leading-relaxed transition-opacity duration-600 ease-out ${detailStage === "content" ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: detailStage === "content" ? `${0.25 + idx * 0.08}s` : "0ms" }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}