"use client"

import { useRouter } from "next/navigation"
import { DetailSection } from "@/components/shared/detail-section"

export default function Community({ stage, onClose }: { stage: "idle" | "cards" | "content"; onClose?: () => void }) {
  const router = useRouter()
  const paragraphs = [
    "Kami percaya pada kekuatan komunitas untuk mendorong inovasi. JUARA Community mengubah kreator, profesional, dan visioner untuk berkolaborasi dan saling menginspirasi dalam ekosistem yang saling mendukung.",
    "Platform komunitas kami menyediakan ruang bagi para innovator untuk berbagi ide, membangun koneksi, dan mengembangkan proyek-proyek ambisius. Melalui workshop, meetup, dan program mentorship, kami memfasilitasi knowledge transfer dan skill development yang berkelanjutan.",
    "JUARA Community juga berperan sebagai bridge between industries, menghubungkan individu-individu talented dengan opportunity yang tepat. Kami memahami bahwa innovation terbaik lahir dari keberagaman perspektif dan kolaborasi lintas disiplin.",
    "Dengan berbagai inisiatif seperti creative labs, startup incubators, dan innovation challenges, kami terus mendorong boundaries dari apa yang возможно. Community kami bukan hanya tentang networking, tetapi tentang membangun masa depan yang lebih baik melalui collective intelligence."
  ]

  return (
    <DetailSection
      stage={stage}
      onClose={onClose ?? (() => router.push("/about"))}
      title="Community-driven innovation"
      paragraphs={paragraphs}
      imagePosition="right"
    />
  )
}
