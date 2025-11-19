"use client"

import { DetailSection } from "@/components/shared/detail-section"

export default function TalentLogMng({
  stage,
  onClose,
  imagePosition,
}: {
  stage: "idle" | "cards" | "content"
  onClose?: () => void
  imagePosition?: "left" | "right"
}) {
  const paragraphs = [
    "Kurasi talent yang tepat dan manajemen logistik end-to-end untuk mendukung eksekusi tanpa hambatan.",
    "Routing, transportasi, akomodasi, dan distribusi diatur presisi agar operasional efisien dan tim fokus pada kualitas acara.",
    "Koordinasi dengan vendors dan partner memastikan SLA terpenuhi dan resiko operasional terkelola.",
    "Pelaporan pasca event mencakup penggunaan resource, efisiensi biaya, dan rekomendasi untuk optimasi berikutnya.",
  ]
  return (
    <DetailSection
      stage={stage}
      onClose={onClose}
      title="Talent & Logistic Management"
      paragraphs={paragraphs}
      imagePosition={imagePosition}
    />
  )
}
