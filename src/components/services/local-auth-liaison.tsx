"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function LocalAuthLiaison({
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
    "Pengurusan perizinan, regulasi, dan koordinasi dengan otoritas setempat untuk memastikan acara berjalan lancar dan patuh aturan.",
    "Risk assessment dan compliance checklist disiapkan sejak awal untuk menghindari hambatan operasional.",
    "Hubungan yang baik dengan pihak berwenang mempercepat proses, meningkatkan safety, dan kepercayaan publik.",
    "Dokumentasi lengkap dan pelaporan transparan menjadi fondasi governance yang kuat untuk setiap event.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title={detailBlock?.title || "Local Authority Liaison"}
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
