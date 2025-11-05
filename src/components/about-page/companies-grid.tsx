"use client"

import { useState } from "react"
import CompanyCard from "./company-card"

const CompaniesGrid = () => {
  const companies = [
    {
      id: 1,
      name: "JUARA Events",
      shortName: "Events",
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
      name: "JUARA Community",
      shortName: "Community",
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
      name: "JUARA Tech",
      shortName: "Tech",
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
      name: "JUARA Analytics",
      shortName: "Analytics",
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

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-7xl px-4">
      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-6 w-full">
        {companies.map((company) => (
          <div
            key={company.id}
            className={`transition-all duration-700 ease-out ${
              selectedId ? "aspect-[32/9]" : "aspect-square"
            } ${
              selectedId
                ? selectedId === company.id
                  ? "scale-100 opacity-100"
                  : "transform scale-75 opacity-30"
                : "scale-100 opacity-100"
            } transform-gpu`}
          >
            <CompanyCard
              id={company.id}
              name={company.name}
              description={company.description}
              gradient={company.gradient}
              onSelect={() => handleCardClick(company.id)}
            />
          </div>
        ))}
      </div>

      {/* Expandable Content Section */}
      {selectedCompany && (
        <div className="w-full grid grid-cols-4 gap-6">
          <div className="col-span-4 cursor-pointer" onClick={() => setSelectedId(null)}>
            <div className="animate-expandContent rounded-2xl overflow-hidden auth-border">
              <div className={`bg-gradient-to-br ${selectedCompany.gradient} p-8`}>
                <h2 className="text-4xl font-bold auth-text-primary mb-2 font-heading">{selectedCompany.shortName}</h2>
                <p className="auth-text-secondary mb-6 text-lg">{selectedCompany.description}</p>
                <h3 className="text-xl font-semibold auth-text-primary mb-3">Tentang</h3>
                <div className="space-y-4">
                  {selectedCompany.fullDescription.map((paragraph, idx) => (
                    <p key={idx} className="auth-text-secondary leading-relaxed">{paragraph}</p>
                  ))}
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
