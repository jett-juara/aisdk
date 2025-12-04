"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function CreativePlanDev({
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
    "Kami merancang strategi acara berbasis data dan insight audiens untuk memastikan konsep tepat sasaran dan berdaya jual.",
    "Blueprint menyeluruh dari tujuan bisnis → narasi → pengalaman multisensori, disertai playbook eksekusi yang terukur.",
    "Prototyping cepat untuk menguji feasibility, risk, dan impact sebelum naik produksi, menjaga efisiensi biaya dan waktu.",
    "Kolaborasi erat dengan stakeholder untuk menyatukan creative vision dan operational constraints agar hasil konsisten dan terukur.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title={detailBlock?.title || "Creative & Plan Development"}
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
