"use client"

import { useRouter } from "next/navigation"

export default function CreativeAgency({ stage }: { stage: "idle" | "cards" | "content" }) {
  const router = useRouter()
  const paragraphs = [
    "Kami menggabungkan kreativitas dan data untuk membangun konsep yang relevan, bernilai jual, dan beda di industri event.",
    "Storytelling multisensori: visual, audio, interaksi, dan ritme dramaturgi dirangkai agar pesan brand terasa hidup.",
    "Process yang rapi dari brief → concept → prototype → playbook eksekusi, dengan guardrail feasibility dan ROI.",
    "Kolaborasi lintas disiplin (design, tech, production) memastikan ide bukan hanya indah di deck, tapi matang di lapangan.",
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
          <h2 className="text-2xl font-heading font-semibold">Data-Driven Creative Concepting</h2>
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className={`auth-text-secondary leading-relaxed transition-opacity duration-600 ease-out ${stage === "content" ? "opacity-100" : "opacity-0"}`}
              style={{ transitionDelay: stage === "content" ? `${0.25 + idx * 0.08}s` : "0ms" }}
            >
              {p}
            </p>
          ))}
        </div>
        <div className="order-1 lg:order-2 lg:basis-[40%] flex flex-col w-full cursor-pointer" onClick={() => router.push('/product')}>
          <div className={`w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20 transition-all duration-700 ease-out ${stage === "content" ? "opacity-100 blur-0" : "opacity-60 blur-[3px]"}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}