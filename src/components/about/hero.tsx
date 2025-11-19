"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { CalendarCheck, UsersRound, Cpu, ChartBarBig } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ABOUT_RESET_EVENT } from "@/lib/constants/events"

const layoutConfigs = {
  1: { desktopTextOrder: "lg:order-1", desktopImageOrder: "lg:order-2", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  2: { desktopTextOrder: "lg:order-2", desktopImageOrder: "lg:order-1", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  3: { desktopTextOrder: "lg:order-1", desktopImageOrder: "lg:order-2", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
  4: { desktopTextOrder: "lg:order-2", desktopImageOrder: "lg:order-1", textBasis: "lg:basis-[60%]", imageBasis: "lg:basis-[40%]" },
} as const

const Hero = () => {
  const router = useRouter()
  const companies = [
    { id: 1, name: "Events", description: "Premium event experiences", icon: CalendarCheck, fullDescription: [
      "JUARA Events menghadirkan pengalaman acara premium yang tak terlupakan. Kami menggabungkan kreativitas, teknologi, dan eksekusi sempurna untuk menciptakan momen yang berkesan bagi audiences Anda.",
      "Dengan pendekatan 'off the grid' yang signature, kami menciptakan event-event unik di lokasi-lokasi tak terduga yang menantang batasan konvensional. Setiap konsep dirancang khusus untuk memberikan pengalaman immersive yang tidak hanya menghibur, tetapi juga bermakna dan transformatif.",
      "Tim kami berpengalaman dalam mengelola event skala besar hingga intimate, dari konser musik hingga corporate gathering, dari festival komunitas hingga launch produk eksklusif. Kami percaya bahwa setiap event adalah kesempatan untuk menciptakan kenangan yang akan dikenang selamanya.",
      "Dengan teknologi terdepan dan jaringan mitra yang kuat, JUARA Events memastikan setiap detail executes flawlessly. Dari perencanaan konsep hingga evaluasi pasca-event, kami hadir sebagai partner strategis yang memahami visi Anda dan berkomitmen mencapai hasil yang超越 ekspektasi."
    ] },
    { id: 2, name: "Community", description: "Community-driven innovation", icon: UsersRound, fullDescription: [
      "Kami percaya pada kekuatan komunitas untuk mendorong inovasi. JUARA Community mengubah kreator, profesional, dan visioner untuk berkolaborasi dan saling menginspirasi dalam ekosistem yang saling mendukung.",
      "Platform komunitas kami menyediakan ruang bagi para innovator untuk berbagi ide, membangun koneksi, dan mengembangkan proyek-proyek ambisius. Melalui workshop, meetup, dan program mentorship, kami memfasilitasi knowledge transfer dan skill development yang berkelanjutan.",
      "JUARA Community juga berperan sebagai bridge between industries, menghubungkan individu-individu talented dengan opportunity yang tepat. Kami memahami bahwa innovation terbaik lahir dari keberagaman perspektif dan kolaborasi lintas disiplin.",
      "Dengan berbagai inisiatif seperti creative labs, startup incubators, dan innovation challenges, kami terus mendorong boundaries dari apa yang возможно. Community kami bukan hanya tentang networking, tetapi tentang membangun masa depan yang lebih baik melalui collective intelligence."
    ] },
    { id: 3, name: "Tech", description: "Next-generation experiences", icon: Cpu, fullDescription: [
      "Teknologi adalah jantung dari apa yang kami lakukan. JUARA Tech menghadirkan solusi inovatif yang mengubah visi menjadi kenyataan dengan kepercayaan diri, mengintegrasikan cutting-edge technology untuk menciptakan experiences yang truly revolutionary.",
      "Tim tech kami mengkhususkan diri dalam developing custom solutions yang mengoptimize setiap aspek event management. Dari AI-powered audience analytics hingga blockchain-based ticketing systems, kami leverage teknologi terdepan untuk streamline operations dan enhance participant experience.",
      "Inovasi kami tidak berhenti di event execution. Kami mengembangkan platform proprietary yang mengintegrasikan smart contracts, IoT sensors, AR/VR experiences, dan predictive analytics untuk menciptakan ecosystem yang fully connected dan data-driven.",
      "Dengan pendekatan agile development dan continuous innovation, JUARA Tech memastikan bahwa clients selalu stay ahead of the curve. Kami tidak hanya follow trends, tetapi menciptakan teknologi baru yang mendefinisikan future dari event industry."
    ] },
    { id: 4, name: "Analytics", description: "Data-driven insights", icon: ChartBarBig, fullDescription: [
      "Data memberikan pemahaman mendalam. JUARA Analytics menggunakan insights berbasis data untuk mengoptimalkan strategi dan memaksimalkan ROI dari setiap kampanye, memberikan competitive advantage yang measurable dan actionable.",
      "Platform analytics kami mengumpulkan dan menganalisis data real-time dari berbagai touchpoints: social media engagement, audience behavior, sentiment analysis, hingga conversion metrics. Visual dashboards yang intuitive membantu stakeholders make informed decisions berdasarkan evidence.",
      "Dengan advanced machine learning algorithms, kami dapat memprediksi trends, mengidentifikasi patterns yang tidak obvious, dan memberikan recommendations yang personalized. Analytics kami tidak hanya report what happened, tetapi explain why it happened dan predict what will happen next.",
      "ROI measurement adalah core dari everything yang kami lakukan. JUARA Analytics membantu clients understand true impact dari setiap event, dari brand awareness metrics hingga revenue attribution, dari audience retention rates hingga lifetime value calculations."
    ] },
  ]

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [introStep, setIntroStep] = useState(0)
  const [introReady, setIntroReady] = useState(false)
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")
  const totalIntroSteps = companies.length + 1
  const introDone = introStep >= totalIntroSteps
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const frameRef = useRef<number | null>(null)
  const detailTimerRef = useRef<NodeJS.Timeout | null>(null)
  const introStartTimerRef = useRef<NodeJS.Timeout | null>(null)

  const resetIntroTimers = useCallback(() => {
    if (frameRef.current !== null) { cancelAnimationFrame(frameRef.current); frameRef.current = null }
    if (timeoutsRef.current.length) { timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = [] }
  }, [])

  useEffect(() => {
    const handleReset = () => {
      setSelectedId(null); setIntroStep(0); setDetailStage("idle"); setIntroReady(false)
      if (introStartTimerRef.current) { clearTimeout(introStartTimerRef.current); introStartTimerRef.current = null }
      introStartTimerRef.current = setTimeout(() => { setIntroReady(true) }, 600)
    }
    if (typeof window !== "undefined") { window.addEventListener(ABOUT_RESET_EVENT, handleReset) }
    return () => { if (typeof window !== "undefined") { window.removeEventListener(ABOUT_RESET_EVENT, handleReset) } }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => { setIntroReady(true) }, 100)
    return () => { clearTimeout(timer); if (introStartTimerRef.current) { clearTimeout(introStartTimerRef.current) } }
  }, [])

  useEffect(() => { return () => resetIntroTimers() }, [resetIntroTimers])

  useEffect(() => {
    if (selectedId !== null) { return }
    if (!introReady) { return }
    resetIntroTimers()
    const timer = setTimeout(() => { setIntroStep(0) }, 0)
    const run = (index: number) => {
      const timeoutId = setTimeout(() => {
        setIntroStep(index + 1)
        if (index < totalIntroSteps - 1) { frameRef.current = requestAnimationFrame(() => run(index + 1)) }
      }, index === 0 ? 160 : 240)
      timeoutsRef.current.push(timeoutId)
    }
    frameRef.current = requestAnimationFrame(() => run(0))
    return () => { clearTimeout(timer); resetIntroTimers() }
  }, [resetIntroTimers, selectedId, totalIntroSteps, introReady])

  useEffect(() => { if (selectedId !== null) { const t = setTimeout(() => setHoveredId(null), 0); return () => clearTimeout(t) } }, [selectedId])

  useEffect(() => {
    if (detailTimerRef.current) { clearTimeout(detailTimerRef.current); detailTimerRef.current = null }
    if (selectedId === null) { const t = setTimeout(() => setDetailStage("idle"), 0); return () => clearTimeout(t) }
    const t = setTimeout(() => {
      setDetailStage("cards")
      detailTimerRef.current = setTimeout(() => { setDetailStage("content"); detailTimerRef.current = null }, 220)
    }, 0)
    return () => { clearTimeout(t); if (detailTimerRef.current) { clearTimeout(detailTimerRef.current); detailTimerRef.current = null } }
  }, [selectedId])

  const handleCardClick = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null); setHoveredId(null); setIntroStep(0); setDetailStage("idle"); resetIntroTimers(); setIntroReady(false)
      if (introStartTimerRef.current) { clearTimeout(introStartTimerRef.current) }
      introStartTimerRef.current = setTimeout(() => { setIntroReady(true) }, 600)
    } else { setSelectedId(id) }
  }

  const selectedCompany = companies.find((c) => c.id === selectedId)

  return (
    <section className="bg-background-900 flex-1 min-h-0 w-full flex items-center">
    <div className="flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto">
      {!selectedId && (
        <div className="flex flex-col lg:flex-row lg:items-center w-full">
          <div className="w-full lg:max-w-[30vw]">
            <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4">
              {companies.map((company, index) => {
                const isStateOne = selectedId === null
                const isIntroActive = introStep <= index
                const introClass = isIntroActive ? "opacity-0 translate-y-10 blur-md" : "opacity-100 translate-y-0 blur-0"
                const scaleClass = !isStateOne || introStep < totalIntroSteps ? "scale-100 shadow-none" : hoveredId === company.id ? "scale-110 z-10 shadow-[0_24px_48px_rgba(0,0,0,0.45)]" : hoveredId === null ? "scale-100 shadow-none" : "scale-90 opacity-80 shadow-none"
                return (
                  <div key={company.id} className={`transition-all duration-600 ease-out transform-gpu w-full aspect-square ${introClass} ${scaleClass} ${introStep < totalIntroSteps ? "pointer-events-none" : ""}`}
                    onMouseEnter={() => introDone && setHoveredId(company.id)} onMouseLeave={() => introDone && setHoveredId(null)}>
                    {(() => {
                      const Icon = company.icon as LucideIcon
                      return (
                        <div
                          className="group relative rounded-2xl overflow-hidden cursor-pointer border border-button-border transition-all duration-300 h-full hover:brightness-110 transform-gpu shadow-none hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
                          onClick={() => handleCardClick(company.id)}
                        >
                          <div className="absolute inset-0 auth-bg-hover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                          <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                            <div className="flex items-center gap-2">
                              <Icon className="h-6 w-6 text-auth-text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" aria-hidden="true" />
                              <span className="text-[0.60rem] font-medium text-auth-text-primary">
                                {company.name}
                              </span>
                            </div>
                            <span className="sr-only">{company.name}</span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="lg:flex-1 flex items-left justify-left lg:ml-5 mt-8 lg:mt-0">
            <div className={`w-full max-w transition-all duration-700 ease-out ${introStep < companies.length ? "opacity-0 translate-y-12 blur-md" : "opacity-100 translate-y-0 blur-0"}`} style={{ visibility: introStep < companies.length ? "hidden" : "visible" }}>
              {introStep > 0 && (
                <div className="w-full p-6 lg:p-8">
                  <div className="flex flex-col gap-7">
                    <h1 className="font-heading font-semibold text-3xl md:text-5xl lg:text-7xl tracking-tighter text-text-200 transition-all duration-700 ease-out transform-gpu">Kreativitas × Teknologi</h1>
                    <p className="font-body text-lg md:text-2xl lg:text-[1.2rem] text-text-50 leading-relaxed transition-all duration-700 ease-out">Kami menggabungkan kreativitas, teknologi, dan eksekusi presisi untuk menghadirkan pengalaman acara yang imersif, aman, dan berdampak. Berbasis governance, data, dan playbook operasional yang jelas, setiap momen dirancang untuk mencapai tujuan bisnis sekaligus memukau audiens.</p>
                    <div className="flex items-start">
                      <Button className="font-button font-medium text-md md:text-xl lg:text-sm bg-button-primary text-text-100 hover:bg-button-primary-hover active:bg-button-primary-active tracking-wide transition-all duration-500 ease-out h-10 md:h-14 lg:h-10 transform-gpu" onClick={() => router.push("/contact")}>Contact Us</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedId && (
        <>
          <div className="grid grid-cols-4 gap-6 w-full">
            {companies.map((company) => {
              const isSelected = selectedId === company.id
              const cascadeActive = detailStage !== "idle"
              const cardScaleClass = !cascadeActive ? (isSelected ? "scale-100 opacity-100" : "scale-100 opacity-80") : (isSelected ? "scale-110 opacity-100" : "scale-70 opacity-40")
              const cardHighlightClass = isSelected && cascadeActive ? "ring-1 ring-white/40 shadow-[0_24px_56px_rgba(0,0,0,0.40)]" : "shadow-none"
              return (
                <div key={company.id} className={`transition-all duration-500 ease-out aspect-square lg:aspect-[32/9] transform-gpu ${cardScaleClass} ${cardHighlightClass}`} style={{ transitionDelay: cascadeActive ? (isSelected ? "80ms" : "0ms") : "0ms" }}>
                  {(() => {
                    const Icon = company.icon as LucideIcon
                    return (
                      <div
                        className="group relative rounded-[var(--radius-none)] overflow-hidden cursor-pointer border border-button-border transition-all duration-300 h-full hover:brightness-110 transform-gpu shadow-none hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
                        onClick={() => handleCardClick(company.id)}
                      >
                        <div className="absolute inset-0 auth-bg-hover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                        <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                          <div className="flex items-center gap-2 justify-start">
                            <Icon className="h-9 w-9 text-auth-text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" aria-hidden="true" />
                            <span className="text-[0.60rem] font-medium text-auth-text-primary">
                              {company.name}
                            </span>
                          </div>
                          <span className="sr-only">{company.name}</span>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>

          

          <div className="w-full py-6 lg:py-8">
            {(() => {
              const layoutConfig = layoutConfigs[selectedId as keyof typeof layoutConfigs]
              const desktopTextOrder = layoutConfig?.desktopTextOrder ?? "lg:order-2"
              const desktopImageOrder = layoutConfig?.desktopImageOrder ?? "lg:order-1"
              return (
                <div className={`flex flex-col lg:flex-row gap-6 ${detailStage === "content" ? "lg:translate-x-0 translate-y-0 opacity-100" : "lg:translate-x-0 translate-y-12 opacity-0"}`} style={{ transitionProperty: "transform, opacity", transitionDuration: detailStage === "content" ? "800ms" : "260ms", transitionDelay: detailStage === "content" ? "150ms" : "0ms", transitionTimingFunction: "cubic-bezier(0.32, 0.96, 0.33, 1)" }}>
                  <div className={`order-1 ${desktopImageOrder} ${layoutConfig?.imageBasis ?? "lg:basis-[40%]"} flex flex-col w-full cursor-pointer`} onClick={() => handleCardClick(selectedId as number)}>
                    <div className={`w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20 transition-all duration-700 ease-out ${detailStage === "content" ? "opacity-100 blur-0" : "opacity-60 blur-[3px]"}`} style={{ transitionDelay: detailStage === "content" ? "250ms" : "0ms" }} aria-hidden="true" />
                  </div>
                  <div className={`order-2 ${desktopTextOrder} ${layoutConfig?.textBasis ?? "lg:basis-[60%]"} p-4 lg:p-8 flex flex-col justify-between gap-6 pr-0 lg:pr-10`}>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-heading font-semibold auth-text-primary">{selectedCompany?.description}</h2>
                    </div>
                    <div className="space-y-4">
                      {selectedCompany?.fullDescription.map((paragraph, idx) => (
                        <p key={idx} className={`auth-text-secondary leading-relaxed transition-opacity duration-600 ease-out ${detailStage === "content" ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: detailStage === "content" ? `${0.25 + idx * 0.08}s` : "0ms" }}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </>
      )}
    </div>
  </section>
  )
}

export default Hero
