"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function CreativeAgency({
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
  currentId?: number
  onNavigate?: (id: number) => void
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
      title="Creative Agency"
      paragraphs={paragraphs}
      imagePosition={imagePosition}
      navigationItems={navigationItems}
      currentId={currentId}
      onNavigate={onNavigate}
    />
  )
}
