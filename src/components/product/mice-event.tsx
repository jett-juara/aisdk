"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function MiceEvent({
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
    "Mendefinisikan ulang MICE: meeting, incentive, conference, exhibition dengan pendekatan dinamis dan audience-centric.",
    "Optimasi networking, content delivery, dan partisipasi audiens melalui format yang engaging dan terukur.",
    "Integrasi sistem digital: registrasi, ticketing, tracking, hingga live analytics untuk keputusan real-time.",
    "Outcome-oriented: KPI, ROI, dan rekomendasi pasca event untuk siklus perbaikan berkelanjutan.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title={detailBlock?.title || "MICE Event"}
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
