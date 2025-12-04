"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function EventActivation({
  stage,
  onClose,
  imagePosition,
  navigationItems,
  currentId,
  onNavigate
}: {
  stage: "idle" | "cards" | "content"
  onClose?: () => void
  imagePosition?: "left" | "right"
  navigationItems?: any[]
  currentId?: string | number
  onNavigate?: (id: string | number) => void
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
      title="Event Activation"
      paragraphs={paragraphs}
      imagePosition={imagePosition}
      navigationItems={navigationItems}
      currentId={currentId}
      onNavigate={onNavigate}
    />
  )
}
