"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function SportEventManagement({
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
    "Kami mengelola event olahraga dari sisi operasional dan experience: mengatur alur atlet, official, dan penonton agar pertandingan terasa tertib namun tetap penuh adrenalin.",
    "Desain venue, tribun, dan area aktivasi disusun untuk memaksimalkan visibilitas, keselamatan, dan atmosfer kompetisi—baik untuk pertandingan indoor maupun outdoor.",
    "Koordinasi lintas-stakeholder (federasi, sponsor, broadcaster, dan pihak keamanan) dijalankan dengan SOP yang jelas supaya event berjalan sesuai regulasi dan standar profesional.",
    "Kami juga menyiapkan framework evaluasi pasca event: metrik attendance, engagement, media value, serta rekomendasi untuk meningkatkan kualitas sport event di edisi berikutnya.",
  ]

  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title="Sport Event Management"
      paragraphs={paragraphs}
      imagePosition={imagePosition}
      navigationItems={navigationItems}
      currentId={currentId}
      onNavigate={onNavigate}
    />
  )
}

