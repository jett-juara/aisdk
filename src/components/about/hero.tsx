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
    {
      id: 1, name: "Events", description: "Premium event experiences", icon: CalendarCheck, fullDescription: [
        "JUARA Events menghadirkan pengalaman acara premium yang tak terlupakan. Kami menggabungkan kreativitas, teknologi, dan eksekusi sempurna untuk menciptakan momen yang berkesan bagi audiences Anda.",
        "Dengan pendekatan 'off the grid' yang signature, kami menciptakan event-event unik di lokasi-lokasi tak terduga yang menantang batasan konvensional. Setiap konsep dirancang khusus untuk memberikan pengalaman immersive yang tidak hanya menghibur, tetapi juga bermakna dan transformatif.",
        "Tim kami berpengalaman dalam mengelola event skala besar hingga intimate, dari konser musik hingga corporate gathering, dari festival komunitas hingga launch produk eksklusif. Kami percaya bahwa setiap event adalah kesempatan untuk menciptakan kenangan yang akan dikenang selamanya.",
        "Dengan teknologi terdepan dan jaringan mitra yang kuat, JUARA Events memastikan setiap detail executes flawlessly. Dari perencanaan konsep hingga evaluasi pasca-event, kami hadir sebagai partner strategis yang memahami visi Anda dan berkomitmen mencapai hasil yang超越 ekspektasi."
      ]
    },
    {
      id: 2, name: "Community", description: "Community-driven innovation", icon: UsersRound, fullDescription: [
        "Kami percaya pada kekuatan komunitas untuk mendorong inovasi. JUARA Community mengubah kreator, profesional, dan visioner untuk berkolaborasi dan saling menginspirasi dalam ekosistem yang saling mendukung.",
        "Platform komunitas kami menyediakan ruang bagi para innovator untuk berbagi ide, membangun koneksi, dan mengembangkan proyek-proyek ambisius. Melalui workshop, meetup, dan program mentorship, kami memfasilitasi knowledge transfer dan skill development yang berkelanjutan.",
        "JUARA Community juga berperan sebagai bridge between industries, menghubungkan individu-individu talented dengan opportunity yang tepat. Kami memahami bahwa innovation terbaik lahir dari keberagaman perspektif dan kolaborasi lintas disiplin.",
        "Dengan berbagai inisiatif seperti creative labs, startup incubators, dan innovation challenges, kami terus mendorong boundaries dari apa yang возможно. Community kami bukan hanya tentang networking, tetapi tentang membangun masa depan yang lebih baik melalui collective intelligence."
      ]
    },
    {
      id: 3, name: "Tech", description: "Next-generation experiences", icon: Cpu, fullDescription: [
        "Teknologi adalah jantung dari apa yang kami lakukan. JUARA Tech menghadirkan solusi inovatif yang mengubah visi menjadi kenyataan dengan kepercayaan diri, mengintegrasikan cutting-edge technology untuk menciptakan experiences yang truly revolutionary.",
        "Tim tech kami mengkhususkan diri dalam developing custom solutions yang mengoptimize setiap aspek event management. Dari AI-powered audience analytics hingga blockchain-based ticketing systems, kami leverage teknologi terdepan untuk streamline operations dan enhance participant experience.",
        "Inovasi kami tidak berhenti di event execution. Kami mengembangkan platform proprietary yang mengintegrasikan smart contracts, IoT sensors, AR/VR experiences, dan predictive analytics untuk menciptakan ecosystem yang fully connected dan data-driven.",
        "Dengan pendekatan agile development dan continuous innovation, JUARA Tech memastikan bahwa clients selalu stay ahead of the curve. Kami tidak hanya follow trends, tetapi menciptakan teknologi baru yang mendefinisikan future dari event industry."
      ]
    },
    {
      id: 4, name: "Analytics", description: "Data-driven insights", icon: ChartBarBig, fullDescription: [
        "Data memberikan pemahaman mendalam. JUARA Analytics menggunakan insights berbasis data untuk mengoptimalkan strategi dan memaksimalkan ROI dari setiap kampanye, memberikan competitive advantage yang measurable dan actionable.",
        "Platform analytics kami mengumpulkan dan menganalisis data real-time dari berbagai touchpoints: social media engagement, audience behavior, sentiment analysis, hingga conversion metrics. Visual dashboards yang intuitive membantu stakeholders make informed decisions berdasarkan evidence.",
        "Dengan advanced machine learning algorithms, kami dapat memprediksi trends, mengidentifikasi patterns yang tidak obvious, dan memberikan recommendations yang personalized. Analytics kami tidak hanya report what happened, tetapi explain why it happened dan predict what will happen next.",
        "ROI measurement adalah core dari everything yang kami lakukan. JUARA Analytics membantu clients understand true impact dari setiap event, dari brand awareness metrics hingga revenue attribution, dari audience retention rates hingga lifetime value calculations."
      ]
    },
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
      detailTimerRef.current = setTimeout(() => { setDetailStage("content"); detailTimerRef.current = null }, 400) // Increased delay for smoother feel
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
    <section className="relative flex-1 min-h-0 w-full flex items-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedId && (
          <div className="flex flex-col lg:flex-row lg:items-center w-full gap-12 lg:gap-20">
            {/* Hero Text Section */}
            <div className="lg:flex-1 flex flex-col justify-center">
              <div className={`w-full transition-all duration-1000 ease-premium ${introStep < companies.length ? "opacity-0 translate-y-16 blur-xl" : "opacity-100 translate-y-0 blur-0"}`}>
                {introStep > 0 && (
                  <div className="flex flex-col gap-8">
                    <div>
                      <h1 className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-premium-gradient leading-[0.9]">
                        Kreativitas<br />
                        <span className="text-white/20">×</span> Teknologi
                      </h1>
                    </div>
                    <p className="font-light text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl border-l border-white/10 pl-6">
                      Kami menggabungkan kreativitas, teknologi, dan eksekusi presisi untuk menghadirkan pengalaman acara yang imersif. Berbasis data dan inovasi, setiap momen dirancang untuk melampaui ekspektasi.
                    </p>
                    <div className="flex items-center gap-6 pt-4">
                      <Button
                        className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-medium tracking-wide transition-all duration-300 hover:scale-105"
                        onClick={() => router.push("/contact")}
                      >
                        Start Project
                      </Button>
                      <span className="text-sm text-white/30 font-mono tracking-widest uppercase">Est. 2025</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Grid Section */}
            <div className="w-full lg:max-w-[35vw]">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {companies.map((company, index) => {
                  const isStateOne = selectedId === null
                  const isIntroActive = introStep <= index
                  const introClass = isIntroActive ? "opacity-0 translate-y-12 blur-lg" : "opacity-100 translate-y-0 blur-0"
                  const scaleClass = !isStateOne || introStep < totalIntroSteps ? "scale-100" : hoveredId === company.id ? "scale-[1.02]" : hoveredId === null ? "scale-100" : "scale-95 opacity-60 blur-[1px]"

                  return (
                    <div key={company.id}
                      className={`transition-all duration-700 ease-premium transform-gpu w-full aspect-square ${introClass} ${scaleClass} ${introStep < totalIntroSteps ? "pointer-events-none" : ""}`}
                      onMouseEnter={() => introDone && setHoveredId(company.id)}
                      onMouseLeave={() => introDone && setHoveredId(null)}>
                      {(() => {
                        const Icon = company.icon as LucideIcon
                        return (
                          <div
                            className="group relative rounded-3xl overflow-hidden cursor-pointer h-full glass-card shadow-2xl"
                            onClick={() => handleCardClick(company.id)}
                          >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/10 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-between p-6">
                              <div className="flex justify-end">
                                <div className="p-3 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
                                  <Icon className="h-6 w-6 text-white/80 group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                                </div>
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-white/90 tracking-wide group-hover:text-white transition-colors duration-300">{company.name}</h3>
                                <p className="text-xs text-white/50 mt-1 font-light tracking-wider uppercase">{company.description.split(" ")[0]}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {selectedId && (
          <>
            {/* Detail View Grid (Top) */}
            <div className="grid grid-cols-4 gap-4 w-full mb-8 lg:mb-12">
              {companies.map((company) => {
                const isSelected = selectedId === company.id
                const cascadeActive = detailStage !== "idle"
                const cardScaleClass = !cascadeActive ? (isSelected ? "scale-100 opacity-100" : "scale-100 opacity-80") : (isSelected ? "scale-105 opacity-100 ring-1 ring-white/20" : "scale-90 opacity-30 blur-[2px]")

                return (
                  <div key={company.id}
                    className={`transition-all duration-700 ease-premium transform-gpu aspect-[4/3] lg:aspect-[32/9] ${cardScaleClass}`}>
                    {(() => {
                      const Icon = company.icon as LucideIcon
                      return (
                        <div
                          className={`group relative rounded-xl overflow-hidden cursor-pointer h-full glass-panel transition-all duration-300 hover:bg-white/10`}
                          onClick={() => handleCardClick(company.id)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center gap-3">
                            <Icon className={`h-6 w-6 ${isSelected ? "text-white" : "text-white/50"} transition-colors`} strokeWidth={1.5} />
                            <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-white/50"} hidden lg:block tracking-wide`}>
                              {company.name}
                            </span>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>

            {/* Detail Content Area */}
            <div className="w-full min-h-[50vh]">
              {(() => {
                const layoutConfig = layoutConfigs[selectedId as keyof typeof layoutConfigs]
                const desktopTextOrder = layoutConfig?.desktopTextOrder ?? "lg:order-2"
                const desktopImageOrder = layoutConfig?.desktopImageOrder ?? "lg:order-1"

                return (
                  <div className={`flex flex-col lg:flex-row gap-8 lg:gap-16 ease-premium ${detailStage === "content" ? "lg:translate-x-0 translate-y-0 opacity-100" : "lg:translate-x-0 translate-y-12 opacity-0"}`}
                    style={{ transitionProperty: "transform, opacity", transitionDuration: "1000ms" }}>

                    {/* Image/Visual Area */}
                    <div className={`order-1 ${desktopImageOrder} ${layoutConfig?.imageBasis ?? "lg:basis-[40%]"} flex flex-col w-full`}>
                      <div className={`relative w-full h-[300px] lg:h-full min-h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-1000 ${detailStage === "content" ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
                        {/* Placeholder for future immersive content */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                              {(() => {
                                const Icon = selectedCompany?.icon as LucideIcon
                                return <Icon className="h-8 w-8 text-white/60" strokeWidth={1} />
                              })()}
                            </div>
                            <span className="text-white/20 font-mono text-sm uppercase tracking-widest">Visual Asset</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Text Content Area */}
                    <div className={`order-2 ${desktopTextOrder} ${layoutConfig?.textBasis ?? "lg:basis-[60%]"} flex flex-col justify-center`}>
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-4xl lg:text-6xl font-heading font-bold text-white tracking-tight mb-2">{selectedCompany?.name}</h2>
                          <p className="text-xl text-white/60 font-light">{selectedCompany?.description}</p>
                        </div>

                        <div className="space-y-6">
                          {selectedCompany?.fullDescription.map((paragraph, idx) => (
                            <p key={idx}
                              className={`text-white/80 leading-relaxed text-lg font-light transition-all duration-700 ${detailStage === "content" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                              style={{ transitionDelay: `${200 + idx * 100}ms` }}>
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        <div className={`pt-6 transition-all duration-700 ${detailStage === "content" ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "600ms" }}>
                          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full px-8">
                            Learn More
                          </Button>
                        </div>
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
