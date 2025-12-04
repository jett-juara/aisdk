"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function EventActivation({
  stage,
  onClose,
  imagePosition,
  navigationItems,
  currentId,
  onNavigate,
  detailBlock,
}: {
  stage: "idle" | "cards" | "content"
  onClose?: () => void
  imagePosition?: "left" | "right"
  navigationItems?: any[]
  currentId?: string | number
  onNavigate?: (id: string | number) => void
  detailBlock?: { title?: string; paragraphs?: string[]; imageUrl?: string; altText?: string }
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
      title={detailBlock?.title || "Event Activation"}
      paragraphs={detailBlock?.paragraphs?.length ? detailBlock.paragraphs : paragraphs}
      imagePosition={imagePosition}
      imageUrl={detailBlock?.imageUrl}
      imageAlt={detailBlock?.altText}
      navigationItems={navigationItems}
      currentId={currentId}
      onNavigate={onNavigate}
    />
  )
}
