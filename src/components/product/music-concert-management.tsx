"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function MusicConcertManagement({
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
    "Kami merancang dan mengeksekusi konser musik dengan energi tinggi, menggabungkan ritme, crowd dynamics, dan momentum panggung menjadi satu narasi yang kohesif.",
    "Sound engineering, stage design modular, dan sistem visual (lighting, projection, screen) dikurasi agar setiap lagu terasa seperti bab dalam sebuah cerita yang imersif.",
    "Operasional di belakang panggung—dari talent routing, jadwal soundcheck, hingga koordinasi kru—diatur dengan presisi supaya artis dan penonton sama-sama mendapatkan pengalaman terbaik.",
    "Setelah acara, kami melakukan analisis data dan dokumentasi untuk mengukur dampak brand, engagement audiens, dan menyusun rekomendasi perbaikan konser berikutnya.",
  ]

  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title="Music Concert Management"
      paragraphs={paragraphs}
      imagePosition={imagePosition}
      navigationItems={navigationItems}
      currentId={currentId}
      onNavigate={onNavigate}
    />
  )
}

