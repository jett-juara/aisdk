"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function LocalAuthLiaison({
  stage,
  onClose,
  imagePosition,
}: {
  stage: "idle" | "cards" | "content"
  onClose?: () => void
  imagePosition?: "left" | "right"
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
      title="Local Authority Liaison"
      paragraphs={paragraphs}
      imagePosition={imagePosition}
    />
  )
}
