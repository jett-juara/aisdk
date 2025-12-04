"use client"

import { useRouter } from "next/navigation"
import { DetailSection } from "@/components/shared/detail-section"

export default function Tech({
  stage,
  onClose,
  navigationItems,
  currentId,
  onNavigate
}: {
  stage: "idle" | "cards" | "content"
  onClose?: () => void
  navigationItems?: any[]
  currentId?: string | number
  onNavigate?: (id: string | number) => void
}) {
  const router = useRouter()
  const paragraphs = [
    "Teknologi adalah jantung dari apa yang kami lakukan. JUARA Tech menghadirkan solusi inovatif yang mengubah visi menjadi kenyataan dengan kepercayaan diri, mengintegrasikan cutting-edge technology untuk menciptakan experiences yang truly revolutionary.",
    "Tim tech kami mengkhususkan diri dalam developing custom solutions yang mengoptimize setiap aspek event management. Dari AI-powered audience analytics hingga blockchain-based ticketing systems, kami leverage teknologi terdepan untuk streamline operations dan enhance participant experience.",
    "Inovasi kami tidak berhenti di event execution. Kami mengembangkan platform proprietary yang mengintegrasikan smart contracts, IoT sensors, AR/VR experiences, dan predictive analytics untuk menciptakan ecosystem yang fully connected dan data-driven.",
    "Dengan pendekatan agile development dan continuous innovation, JUARA Tech memastikan bahwa clients selalu stay ahead of the curve. Kami tidak hanya follow trends, tetapi menciptakan teknologi baru yang mendefinisikan future dari event industry."
  ]

  return (
    <DetailSection
      stage={stage}
      onClose={onClose ?? (() => router.push("/about"))}
      title="Next-generation experiences"
      paragraphs={paragraphs}
      imagePosition="left"
      navigationItems={navigationItems}
      currentId={currentId}
      onNavigate={onNavigate}
    />
  )
}
