"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function CreativeAgency({
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
    "Kami menggabungkan kreativitas dan data untuk membangun konsep yang relevan, bernilai jual, dan beda di industri event.",
    "Storytelling multisensori: visual, audio, interaksi, dan ritme dramaturgi dirangkai agar pesan brand terasa hidup.",
    "Process yang rapi dari brief → concept → prototype → playbook eksekusi, dengan guardrail feasibility dan ROI.",
    "Kolaborasi lintas disiplin (design, tech, production) memastikan ide bukan hanya indah di deck, tapi matang di lapangan.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title={detailBlock?.title || "Creative Agency"}
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
