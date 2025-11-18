"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CompanyCard from "@/components/about-page/company-card"
import { CalendarCheck, UsersRound, Cpu, ChartBarBig } from "lucide-react"

export default function AboutCommunityPage() {
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
    "Kami percaya pada kekuatan komunitas untuk mendorong inovasi. JUARA Community mengubah kreator, profesional, dan visioner untuk berkolaborasi dan saling menginspirasi dalam ekosistem yang saling mendukung.",
    "Platform komunitas kami menyediakan ruang bagi para innovator untuk berbagi ide, membangun koneksi, dan mengembangkan proyek-proyek ambisius. Melalui workshop, meetup, dan program mentorship, kami memfasilitasi knowledge transfer dan skill development yang berkelanjutan.",
    "JUARA Community juga berperan sebagai bridge between industries, menghubungkan individu-individu talented dengan opportunity yang tepat. Kami memahami bahwa innovation terbaik lahir dari keberagaman perspektif dan kolaborasi lintas disiplin.",
    "Dengan berbagai inisiatif seperti creative labs, startup incubators, dan innovation challenges, kami terus mendorong boundaries dari apa yang возможно. Community kami bukan hanya tentang networking, tetapi tentang membangun masa depan yang lebih baik melalui collective intelligence."
  ]

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-4 gap-6 w-full">
        {items.map((item) => {
          const isSelected = item.slug === "community"
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
          <h2 className="text-2xl font-heading font-semibold">Community-driven innovation</h2>
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