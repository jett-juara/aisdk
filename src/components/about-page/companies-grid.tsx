"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import CompanyCard from "./company-card"
import { ABOUT_RESET_EVENT } from "@/lib/constants/events"

const layoutConfigs = {
  1: {
    textOrder: "order-1 lg:order-1",
    imageOrder: "order-2 lg:order-2",
    textBasis: "lg:basis-[60%]",
    imageBasis: "lg:basis-[40%]",
  },
  2: {
    textOrder: "order-2 lg:order-2",
    imageOrder: "order-1 lg:order-1",
    textBasis: "lg:basis-[60%]",
    imageBasis: "lg:basis-[40%]",
  },
  3: {
    textOrder: "order-1 lg:order-1",
    imageOrder: "order-2 lg:order-2",
    textBasis: "lg:basis-[60%]",
    imageBasis: "lg:basis-[40%]",
  },
  4: {
    textOrder: "order-2 lg:order-2",
    imageOrder: "order-1 lg:order-1",
    textBasis: "lg:basis-[60%]",
    imageBasis: "lg:basis-[40%]",
  },
} as const

const CompaniesGrid = () => {
  const companies = [
    {
      id: 1,
      name: "Events",
      description: "Premium event experiences",
      fullDescription: [
        "JUARA Events menghadirkan pengalaman acara premium yang tak terlupakan. Kami menggabungkan kreativitas, teknologi, dan eksekusi sempurna untuk menciptakan momen yang berkesan bagi audiences Anda.",
        "Dengan pendekatan 'off the grid' yang signature, kami menciptakan event-event unik di lokasi-lokasi tak terduga yang menantang batasan konvensional. Setiap konsep dirancang khusus untuk memberikan pengalaman immersive yang tidak hanya menghibur, tetapi juga bermakna dan transformatif.",
        "Tim kami berpengalaman dalam mengelola event skala besar hingga intimate, dari konser musik hingga corporate gathering, dari festival komunitas hingga launch produk eksklusif. Kami percaya bahwa setiap event adalah kesempatan untuk menciptakan kenangan yang akan dikenang selamanya.",
        "Dengan teknologi terdepan dan jaringan mitra yang kuat, JUARA Events memastikan setiap detail executes flawlessly. Dari perencanaan konsep hingga evaluasi pasca-event, kami hadir sebagai partner strategis yang memahami visi Anda dan berkomitmen mencapai hasil yang超越 ekspektasi."
      ]
    },
    {
      id: 2,
      name: "Community",
      description: "Community-driven innovation",
      fullDescription: [
        "Kami percaya pada kekuatan komunitas untuk mendorong inovasi. JUARA Community mengubah kreator, profesional, dan visioner untuk berkolaborasi dan saling menginspirasi dalam ekosistem yang saling mendukung.",
        "Platform komunitas kami menyediakan ruang bagi para innovator untuk berbagi ide, membangun koneksi, dan mengembangkan proyek-proyek ambisius. Melalui workshop, meetup, dan program mentorship, kami memfasilitasi knowledge transfer dan skill development yang berkelanjutan.",
        "JUARA Community juga berperan sebagai bridge between industries, menghubungkan individu-individu talented dengan opportunity yang tepat. Kami memahami bahwa innovation terbaik lahir dari keberagaman perspektif dan kolaborasi lintas disiplin.",
        "Dengan berbagai inisiatif seperti creative labs, startup incubators, dan innovation challenges, kami terus mendorong boundaries dari apa yang возможно. Community kami bukan hanya tentang networking, tetapi tentang membangun masa depan yang lebih baik melalui collective intelligence dan shared vision."
      ]
    },
    {
      id: 3,
      name: "Tech",
      description: "Next-generation experiences",
      fullDescription: [
        "Teknologi adalah jantung dari apa yang kami lakukan. JUARA Tech menghadirkan solusi inovatif yang mengubah visi menjadi kenyataan dengan kepercayaan diri, mengintegrasikan cutting-edge technology untuk menciptakan experiences yang truly revolutionary.",
        "Tim tech kami mengkhususkan diri dalam developing custom solutions yang mengoptimize setiap aspek event management. Dari AI-powered audience analytics hingga blockchain-based ticketing systems, kami leverage teknologi terdepan untuk streamline operations dan enhance participant experience.",
        "Inovasi kami tidak berhenti di event execution. Kami mengembangkan platform proprietary yang mengintegrasikan smart contracts, IoT sensors, AR/VR experiences, dan predictive analytics untuk menciptakan ecosystem yang fully connected dan data-driven.",
        "Dengan pendekatan agile development dan continuous innovation, JUARA Tech memastikan bahwa clients selalu stay ahead of the curve. Kami tidak hanya follow trends, tetapi menciptakan teknologi baru yang mendefinisikan future dari event industry. Setiap line of code yang kami tulis contribute untuk vision besar: technology yang empower human connection dan creativity."
      ]
    },
    {
      id: 4,
      name: "Analytics",
      description: "Data-driven insights",
      fullDescription: [
        "Data memberikan pemahaman mendalam. JUARA Analytics menggunakan insights berbasis data untuk mengoptimalkan strategi dan memaksimalkan ROI dari setiap kampanye, memberikan competitive advantage yang measurable dan actionable.",
        "Platform analytics kami mengumpulkan dan menganalisis data real-time dari berbagai touchpoints: social media engagement, audience behavior, sentiment analysis, hingga conversion metrics. Visual dashboards yang intuitive membantu stakeholders make informed decisions berdasarkan evidence, bukan hanya intuition.",
        "Dengan advanced machine learning algorithms, kami dapat memprediksi trends, mengidentifikasi patterns yang tidak obvious, dan memberikan recommendations yang personalized. Analytics kami tidak hanya report what happened, tetapi explain why it happened dan predict what will happen next.",
        "ROI measurement adalah core dari everything yang kami lakukan. JUARA Analytics membantu clients understand true impact dari setiap event, dari brand awareness metrics hingga revenue attribution, dari audience retention rates hingga lifetime value calculations. Dengan data yang akurat dan actionable insights, setiap investment dalam event dapat dioptimasi untuk hasil yang maksimal dan sustainable growth."
      ]
    },
  ]

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [introStep, setIntroStep] = useState(0)
  const totalIntroSteps = companies.length + 1
  const introDone = introStep >= totalIntroSteps
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const frameRef = useRef<number | null>(null)

  const resetIntroTimers = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
    if (timeoutsRef.current.length) {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  useEffect(() => {
    const handleReset = () => setSelectedId(null)

    if (typeof window !== "undefined") {
      window.addEventListener(ABOUT_RESET_EVENT, handleReset)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(ABOUT_RESET_EVENT, handleReset)
      }
    }
  }, [])

  useEffect(() => {
    return () => resetIntroTimers()
  }, [resetIntroTimers])

  useEffect(() => {
    if (selectedId !== null) {
      return
    }

    resetIntroTimers()
    setIntroStep(0)

    const run = (index: number) => {
      const timeoutId = setTimeout(() => {
        setIntroStep(index + 1)
        if (index < totalIntroSteps - 1) {
          frameRef.current = requestAnimationFrame(() => run(index + 1))
        }
      }, index === 0 ? 160 : 240)

      timeoutsRef.current.push(timeoutId)
    }

    frameRef.current = requestAnimationFrame(() => run(0))

    return () => {
      resetIntroTimers()
    }
  }, [resetIntroTimers, selectedId, totalIntroSteps])

  useEffect(() => {
    if (selectedId !== null) {
      setHoveredId(null)
    }
  }, [selectedId])

  const handleCardClick = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null)
      setHoveredId(null)
    } else {
      setSelectedId(id)
    }
  }

  const selectedCompany = companies.find((c) => c.id === selectedId)

  // SVG mapping for each company
  const headlineSvg = "/images/about-page/headline-outline.svg"
  const svgFiles = {
    1: "/images/about-page/event-outline.svg",
    2: "/images/about-page/community-outline.svg",
    3: "/images/about-page/tech-outline.svg",
    4: "/images/about-page/analytics-outline.svg"
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w mx-auto">
      {/* STATE 1: 2-Column Layout - Cards Left, SVGs Right (Desktop) */}
      {!selectedId && (
        <div className="flex flex-col lg:flex-row lg:items-center w-full">
          {/* LEFT: 4 Cards in 2x2 Grid */}
          <div className="w-full lg:max-w-[30vw]">
            <div className="grid grid-cols-2 grid-rows-2">
              {companies.map((company, index) => {
                const isStateOne = selectedId === null
                const isIntroActive = introStep <= index
                const introClass = isIntroActive
                  ? "opacity-0 translate-y-10 blur-md"
                  : "opacity-100 translate-y-0 blur-0"
                const scaleClass =
                  !isStateOne || introStep < totalIntroSteps
                    ? "scale-100 shadow-none"
                  : hoveredId === company.id
                      ? "scale-110 z-10 shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
                      : hoveredId === null
                        ? "scale-100 shadow-none"
                        : "scale-90 opacity-80 shadow-none"

                return (
                  <div
                    key={company.id}
                    className={`transition-all duration-600 ease-out transform-gpu w-full aspect-square ${introClass} ${scaleClass} ${
                      introStep < totalIntroSteps ? "pointer-events-none" : ""
                    }`}
                    onMouseEnter={() => introDone && setHoveredId(company.id)}
                    onMouseLeave={() => introDone && setHoveredId(null)}
                  >
                    <CompanyCard
                      name={company.name}
                      description={company.description}
                      onSelect={() => handleCardClick(company.id)}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Combined Headline Outline */}
          <div className="lg:flex-1 flex items-left justify-left lg:ml-5">
            <div
              className={`w-full max-w transition-all duration-700 ease-out ${
                introStep < companies.length ? "opacity-0 translate-y-12 blur-md" : "opacity-100 translate-y-0 blur-0"
              }`}
            >
              <div className="relative w-full" style={{ paddingTop: `${(644.37 / 1418.77) * 100}%` }}>
                <img
                  src={headlineSvg}
                  alt="JUARA headline divisions"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: Single Column Layout - Cards Full Width + SVG Below + Content */}
      {selectedId && (
        <>
          {/* Cards Section - Full Width */}
          <div className="grid grid-cols-4 gap-6 w-full">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`transition-all duration-700 ease-out aspect-[32/9] ${
                  selectedId === company.id
                    ? "scale-100 opacity-100"
                    : "scale-75 opacity-30"
                } transform-gpu`}
              >
                <CompanyCard
                  name={company.name}
                  description={company.description}
                  onSelect={() => handleCardClick(company.id)}
                />
              </div>
            ))}
          </div>

          {/* SVG Section - Below Cards */}
          <div className="flex justify-left w-full">
            <img
              src={svgFiles[selectedId as keyof typeof svgFiles]}
              alt={`${companies.find(c => c.id === selectedId)?.name} visualization`}
              className="w-auto max-w-md lg:max-w-full object-contain"
            />
          </div>
        </>
      )}

      {/* Expandable Content Section */}
      {selectedCompany && (
        <div className="w-full cursor-pointer" onClick={() => setSelectedId(null)}>
          <div className="animate-expandContent rounded-[var(--radius-none)] overflow-hidden auth-border">
            <div className="relative bg-auth-bg-hover">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/0 opacity-40" aria-hidden="true" />
              <div className="relative flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch h-full">
                <div
                  className={`p-4 lg:p-8 flex flex-col justify-between gap-6 ${layoutConfigs[selectedCompany.id as keyof typeof layoutConfigs]?.textOrder ?? ""} ${layoutConfigs[selectedCompany.id as keyof typeof layoutConfigs]?.textBasis ?? "lg:basis-[60%]"} pr-0 lg:pr-10`}
                >
                  <div>
                    <h2 className="text-3xl font-heading auth-text-primary mb-2">{selectedCompany.name}</h2>
                    <p className="auth-text-secondary mb-4">{selectedCompany.description}</p>
                    <h3 className="text-xl font-semibold auth-text-primary mb-3">Tentang</h3>
                  </div>
                  <div className="space-y-4">
                    {selectedCompany.fullDescription.map((paragraph, idx) => (
                      <p key={idx} className="auth-text-secondary leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </div>
                <div
                  className={`w-full ${layoutConfigs[selectedCompany.id as keyof typeof layoutConfigs]?.imageOrder ?? ""} ${layoutConfigs[selectedCompany.id as keyof typeof layoutConfigs]?.imageBasis ?? "lg:basis-[40%]"} flex`}
                >
                  <div className="w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompaniesGrid
