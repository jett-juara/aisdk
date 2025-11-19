"use client"

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
    <div className="w-full py-6 lg:py-8">
      <div
        className={`flex flex-col lg:flex-row gap-6 ${
          isContent ? "lg:translate-x-0 translate-y-0 opacity-100" : "lg:translate-x-0 translate-y-12 opacity-0"
        }`}
        style={{
          transitionProperty: "transform, opacity",
          transitionDuration: isContent ? "800ms" : "260ms",
          transitionDelay: isContent ? "150ms" : "0ms",
          transitionTimingFunction: "cubic-bezier(0.32, 0.96, 0.33, 1)",
        }}
      >
        <div
          className={`${
            isImageLeft ? "order-2 lg:order-2" : "order-2 lg:order-1"
          } lg:basis-[60%] p-4 lg:p-8 flex flex-col gap-4 pr-0 lg:pr-10`}
        >
          <h2 className="text-2xl font-heading font-semibold">{title}</h2>
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className={`auth-text-secondary leading-relaxed transition-opacity duration-600 ease-out ${
                isContent ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: isContent ? `${0.25 + idx * 0.08}s` : "0ms" }}
            >
              {p}
            </p>
          ))}
        </div>
        <div
          className={`${
            isImageLeft ? "order-1 lg:order-1" : "order-1 lg:order-2"
          } lg:basis-[40%] flex flex-col w-full cursor-pointer`}
          onClick={() => onClose?.()}
        >
          <div
            className={`w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20 transition-all duration-700 ease-out ${
              isContent ? "opacity-100 blur-0" : "opacity-60 blur-[3px]"
            }`}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  )
}
