"use client"

import { Button } from "@/components/ui/button"

interface DetailSectionProps {
  stage: "idle" | "cards" | "content"
  onClose?: () => void
  title: string
  paragraphs: string[]
  imagePosition?: "left" | "right"
}

export function DetailSection({
  stage,
  onClose,
  title,
  paragraphs,
  imagePosition,
}: DetailSectionProps) {
  const isContent = stage === "content"
  const isImageLeft = imagePosition === "left"

  return (
    <div className={`flex flex-col lg:flex-row gap-8 lg:gap-16 ease-premium ${isContent ? "lg:translate-x-0 translate-y-0 opacity-100" : "lg:translate-x-0 translate-y-12 opacity-0"}`}
      style={{ transitionProperty: "transform, opacity", transitionDuration: "1000ms" }}>

      {/* Image/Visual Area */}
      <div className={`order-1 ${isImageLeft ? "lg:order-1" : "lg:order-2"} lg:basis-[40%] flex flex-col w-full`}>
        <div
          className={`relative w-full h-[300px] lg:h-full min-h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm transition-all duration-1000 cursor-pointer group ${isContent ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          onClick={() => onClose?.()}
        >
          {/* Placeholder for future immersive content */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center group-hover:scale-105 transition-transform duration-500 ease-premium">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/10 transition-colors">
                <span className="text-3xl">✨</span>
              </div>
              <span className="text-white/20 font-mono text-sm uppercase tracking-widest group-hover:text-white/40 transition-colors">Visual Asset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Text Content Area */}
      <div className={`order-2 ${isImageLeft ? "lg:order-2" : "lg:order-1"} lg:basis-[60%] flex flex-col justify-center`}>
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl lg:text-6xl font-heading font-bold text-white tracking-tight mb-2">{title}</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-white/30 to-transparent rounded-full" />
          </div>

          <div className="space-y-6">
            {paragraphs.map((paragraph, idx) => (
              <p key={idx}
                className={`text-white/80 leading-relaxed text-lg font-light transition-all duration-700 ${isContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${200 + idx * 100}ms` }}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className={`pt-6 transition-all duration-700 ${isContent ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "600ms" }}>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full px-8"
              onClick={() => onClose?.()}
            >
              Back to Overview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
