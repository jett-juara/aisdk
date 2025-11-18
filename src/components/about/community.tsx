"use client"

import { useRouter } from "next/navigation"

export default function Community({ stage }: { stage: "idle" | "cards" | "content" }) {
  const router = useRouter()
  const paragraphs = [
    "Kami percaya pada kekuatan komunitas untuk mendorong inovasi. JUARA Community mengubah kreator, profesional, dan visioner untuk berkolaborasi dan saling menginspirasi dalam ekosistem yang saling mendukung.",
    "Platform komunitas kami menyediakan ruang bagi para innovator untuk berbagi ide, membangun koneksi, dan mengembangkan proyek-proyek ambisius. Melalui workshop, meetup, dan program mentorship, kami memfasilitasi knowledge transfer dan skill development yang berkelanjutan.",
    "JUARA Community juga berperan sebagai bridge between industries, menghubungkan individu-individu talented dengan opportunity yang tepat. Kami memahami bahwa innovation terbaik lahir dari keberagaman perspektif dan kolaborasi lintas disiplin.",
    "Dengan berbagai inisiatif seperti creative labs, startup incubators, dan innovation challenges, kami terus mendorong boundaries dari apa yang возможно. Community kami bukan hanya tentang networking, tetapi tentang membangun masa depan yang lebih baik melalui collective intelligence."
  ]

  return (
    <div className="w-full py-6 lg:py-8">
      <div
        className={`flex flex-col lg:flex-row gap-6 ${stage === "content" ? "lg:translate-x-0 translate-y-0 opacity-100" : "lg:translate-x-0 translate-y-12 opacity-0"}`}
        style={{
          transitionProperty: "transform, opacity",
          transitionDuration: stage === "content" ? "800ms" : "260ms",
          transitionDelay: stage === "content" ? "150ms" : "0ms",
          transitionTimingFunction: "cubic-bezier(0.32, 0.96, 0.33, 1)"
        }}
      >
        <div className="order-2 lg:order-1 lg:basis-[60%] p-4 lg:p-8 flex flex-col gap-4 pr-0 lg:pr-10">
          <h2 className="text-2xl font-heading font-semibold">Community-driven innovation</h2>
          {paragraphs.map((p, idx) => (
            <p key={idx} className={`auth-text-secondary leading-relaxed transition-opacity duration-600 ease-out ${stage === "content" ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: stage === "content" ? `${0.25 + idx * 0.08}s` : "0ms" }}>
              {p}
            </p>
          ))}
        </div>
        <div className="order-1 lg:order-2 lg:basis-[40%] flex flex-col w-full cursor-pointer" onClick={() => router.push('/about')}>
          <div className={`w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20 transition-all duration-700 ease-out ${stage === "content" ? "opacity-100 blur-0" : "opacity-60 blur-[3px]"}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}