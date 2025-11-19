"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function EventActivation({
  stage,
  onClose,
  imagePosition,
}: {
  stage: "idle" | "cards" | "content"
  onClose?: () => void
  imagePosition?: "left" | "right"
}) {
  const paragraphs = [
    "Mengubah pesan brand menjadi pengalaman interaktif yang menciptakan percakapan luas dan memori kolektif.",
    "Brand storytelling dipadu teknologi interaktif (AR, RFID, IoT, gamification) untuk engagement yang terasa natural.",
    "Design activation mengutamakan flow, dwell time, dan conversion metric yang jelas; bukan sekadar instalasi cantik.",
    "Tim produksi memastikan setup, operasi, hingga post-event reporting berjalan clean dan accountable.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title="Experiential Brand Activation"
      paragraphs={paragraphs}
      imagePosition={imagePosition}
    />
  )
}
