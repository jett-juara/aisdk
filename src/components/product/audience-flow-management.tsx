"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function AudienceFlowManagement({
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
    "Kami mendesain journey audiens end-to-end: dari pre-event onboarding, akses lokasi, hingga egress, supaya alur terasa mulus dan terukur.",
    "Crowd control dengan zoning, queue orchestration, dan wayfinding yang jelas untuk mencegah bottleneck dan menjaga safety.",
    "Integrasi smart access system (RFID/NFC, biometric) dan real-time monitoring untuk tracking arus pergerakan dan optimasi on the fly.",
    "Pendekatan berbasis data dan psikologi audiens: memanfaatkan FOMO, social proof, dan loss aversion agar engagement naik tanpa friksi.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title="Seamless Audience Journey"
      paragraphs={paragraphs}
      imagePosition={imagePosition}
      navigationItems={navigationItems}
      currentId={currentId}
      onNavigate={onNavigate}
    />
  )
}
