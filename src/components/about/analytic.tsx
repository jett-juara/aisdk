"use client"

import { useRouter } from "next/navigation"

export default function Analytic({ stage }: { stage: "idle" | "cards" | "content" }) {
  const router = useRouter()
  const paragraphs = [
    "Data memberikan pemahaman mendalam. JUARA Analytics menggunakan insights berbasis data untuk mengoptimalkan strategi dan memaksimalkan ROI dari setiap kampanye, memberikan competitive advantage yang measurable dan actionable.",
    "Platform analytics kami mengumpulkan dan menganalisis data real-time dari berbagai touchpoints: social media engagement, audience behavior, sentiment analysis, hingga conversion metrics. Visual dashboards yang intuitive membantu stakeholders make informed decisions berdasarkan evidence.",
    "Dengan advanced machine learning algorithms, kami dapat memprediksi trends, mengidentifikasi patterns yang tidak obvious, dan memberikan recommendations yang personalized. Analytics kami tidak hanya report what happened, tetapi explain why it happened dan predict what will happen next.",
    "ROI measurement adalah core dari everything yang kami lakukan. JUARA Analytics membantu clients understand true impact dari setiap event, dari brand awareness metrics hingga revenue attribution, dari audience retention rates hingga lifetime value calculations."
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
          <h2 className="text-2xl font-heading font-semibold">Data-driven insights</h2>
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