"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function ExecutionHandling({
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
    "Eksekusi presisi tinggi dengan koordinasi lintas-stakeholder, memastikan setiap detail berjalan sesuai rencana.",
    "Run of show yang jelas, risk mitigation, dan SOP operasional menjaga kualitas, keamanan, dan ketepatan waktu.",
    "Team onsite yang agile untuk resolving issues secara real-time, mengurangi downtime dan menjaga pengalaman audiens.",
    "Post-event wrap dengan dokumentasi dan evaluasi menyeluruh sebagai dasar perbaikan berkelanjutan.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title={detailBlock?.title || "Execution Handling"}
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
