"use client"

import { useState } from "react"
import CompanyCard from "./company-card"

const CompaniesGrid = () => {
  const companies = [
    {
      id: 1,
      name: "Events",
      description: "Premium event experiences",
      gradient: "from-amber-600/30 to-amber-900/30",
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
      gradient: "from-slate-600/30 to-slate-900/30",
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
      gradient: "from-cyan-600/30 to-cyan-900/30",
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
      gradient: "from-indigo-600/30 to-indigo-900/30",
      fullDescription: [
        "Data memberikan pemahaman mendalam. JUARA Analytics menggunakan insights berbasis data untuk mengoptimalkan strategi dan memaksimalkan ROI dari setiap kampanye, memberikan competitive advantage yang measurable dan actionable.",
        "Platform analytics kami mengumpulkan dan menganalisis data real-time dari berbagai touchpoints: social media engagement, audience behavior, sentiment analysis, hingga conversion metrics. Visual dashboards yang intuitive membantu stakeholders make informed decisions berdasarkan evidence, bukan hanya intuition.",
        "Dengan advanced machine learning algorithms, kami dapat memprediksi trends, mengidentifikasi patterns yang tidak obvious, dan memberikan recommendations yang personalized. Analytics kami tidak hanya report what happened, tetapi explain why it happened dan predict what will happen next.",
        "ROI measurement adalah core dari everything yang kami lakukan. JUARA Analytics membantu clients understand true impact dari setiap event, dari brand awareness metrics hingga revenue attribution, dari audience retention rates hingga lifetime value calculations. Dengan data yang akurat dan actionable insights, setiap investment dalam event dapat dioptimasi untuk hasil yang maksimal dan sustainable growth."
      ]
    },
  ]

  const [selectedId, setSelectedId] = useState<number | null>(null)

  const handleCardClick = (id: number) => {
    if (selectedId === id) {
      setSelectedId(null)
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
          <div className="w-full lg:max-w-[30vw] bg-red-500/10">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 lg:gap-2">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="transition-all duration-700 ease-out scale-100 opacity-100 transform-gpu w-full aspect-square"
                >
                  <CompanyCard
                    name={company.name}
                    description={company.description}
                    gradient={company.gradient}
                    onSelect={() => handleCardClick(company.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Combined Headline Outline */}
          <div className="lg:flex-1 flex items-left justify-left lg:ml-5">
            <div className="w-full max-w">
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
          <div className="grid grid-cols-4 gap-2 w-full">
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
                  gradient={company.gradient}
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
          <div className="animate-expandContent rounded-2xl overflow-hidden auth-border">
            <div className={`bg-gradient-to-br ${selectedCompany.gradient} p-8`}>
              <h3 className="text-xl font-semibold auth-text-primary mb-3">Tentang</h3>
              <div className="space-y-4">
                {selectedCompany.fullDescription.map((paragraph, idx) => (
                  <p key={idx} className="auth-text-secondary leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompaniesGrid
