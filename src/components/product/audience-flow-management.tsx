"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function AudienceFlowManagement({
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
    "Kami mendesain journey audiens end-to-end: dari pre-event onboarding, akses lokasi, hingga egress, supaya alur terasa mulus dan terukur.",
    "Crowd control dengan zoning, queue orchestration, dan wayfinding yang jelas untuk mencegah bottleneck dan menjaga safety.",
    "Integrasi smart access system (RFID/NFC, biometric) dan real-time monitoring untuk tracking arus pergerakan dan optimasi on the fly.",
    "Pendekatan berbasis data dan psikologi audiens: memanfaatkan FOMO, social proof, dan loss aversion agar engagement naik tanpa friksi.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title={detailBlock?.title || "Seamless Audience Journey"}
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
