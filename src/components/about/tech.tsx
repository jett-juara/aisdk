"use client"

import { useRouter } from "next/navigation"

export default function Tech({ stage }: { stage: "idle" | "cards" | "content" }) {
  const router = useRouter()
  const paragraphs = [
    "Teknologi adalah jantung dari apa yang kami lakukan. JUARA Tech menghadirkan solusi inovatif yang mengubah visi menjadi kenyataan dengan kepercayaan diri, mengintegrasikan cutting-edge technology untuk menciptakan experiences yang truly revolutionary.",
    "Tim tech kami mengkhususkan diri dalam developing custom solutions yang mengoptimize setiap aspek event management. Dari AI-powered audience analytics hingga blockchain-based ticketing systems, kami leverage teknologi terdepan untuk streamline operations dan enhance participant experience.",
    "Inovasi kami tidak berhenti di event execution. Kami mengembangkan platform proprietary yang mengintegrasikan smart contracts, IoT sensors, AR/VR experiences, dan predictive analytics untuk menciptakan ecosystem yang fully connected dan data-driven.",
    "Dengan pendekatan agile development dan continuous innovation, JUARA Tech memastikan bahwa clients selalu stay ahead of the curve. Kami tidak hanya follow trends, tetapi menciptakan teknologi baru yang mendefinisikan future dari event industry."
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
        <div className="order-1 lg:basis-[40%] flex flex-col w-full cursor-pointer" onClick={() => router.push('/about')}>
          <div className={`w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20 transition-all duration-700 ease-out ${stage === "content" ? "opacity-100 blur-0" : "opacity-60 blur-[3px]"}`} aria-hidden="true" />
        </div>
        <div className="order-2 lg:basis-[60%] p-4 lg:p-8 flex flex-col gap-4 pr-0 lg:pr-10">
          <h2 className="text-2xl font-heading font-semibold">Next-generation experiences</h2>
          {paragraphs.map((p, idx) => (
            <p key={idx} className={`auth-text-secondary leading-relaxed transition-opacity duration-600 ease-out ${stage === "content" ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: stage === "content" ? `${0.25 + idx * 0.08}s` : "0ms" }}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}