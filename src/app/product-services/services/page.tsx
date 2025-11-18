"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CompanyCard from "@/components/about-page/company-card"
import { Package, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Trophy, Award, Lightbulb, HeartHandshake, Users, Leaf, ArrowRight } from "lucide-react"

const ITEMS = [
  { icon: Trophy, title: "Industry Recognition", subtitle: "Achievement", highlight: "Outstanding Performance Award." },
  { icon: Award, title: "Excellence Award", subtitle: "Recognition", highlight: "Best in Category Winner." },
  { icon: Lightbulb, title: "Innovation Prize", subtitle: "Technology", highlight: "Breakthrough Solution of the Year." },
  { icon: HeartHandshake, title: "Customer Success", subtitle: "Service", highlight: "Top-Rated Solution Provider." },
  { icon: Users, title: "Global Leadership", subtitle: "Management", highlight: "Executive Team of the Year." },
  { icon: Leaf, title: "Sustainability Impact", subtitle: "Environmental", highlight: "Green Initiative Excellence." },
]

export default function ServicesPage() {
  const router = useRouter()
  const [detailStage, setDetailStage] = useState<"idle" | "cards" | "content">("idle")

  useEffect(() => {
    const t1 = setTimeout(() => setDetailStage("cards"), 0)
    const t2 = setTimeout(() => setDetailStage("content"), 220)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const items = [
    { id: "product", name: "Product", description: "Produk unggulan", icon: Package },
    { id: "services", name: "Services", description: "Layanan profesional", icon: Cog },
  ]

  return (
    <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 gap-6 w-full">
            {items.map((item) => {
              const isSelected = item.id === "services"
              const cascadeActive = detailStage !== "idle"
              const cardScaleClass = !cascadeActive
                ? isSelected
                  ? "scale-100 opacity-100"
                  : "scale-100 opacity-80"
                : isSelected
                  ? "scale-110 opacity-100"
                  : "scale-70 opacity-40"
              const cardHighlightClass = isSelected && cascadeActive ? "ring-1 ring-white/40 shadow-[0_24px_56px_rgba(0,0,0,0.40)]" : "shadow-none"

              return (
                <div
                  key={item.id}
                  className={`transition-all duration-500 ease-out aspect-square lg:aspect-[32/9] transform-gpu ${cardScaleClass} ${cardHighlightClass}`}
                  style={{ transitionDelay: cascadeActive ? (isSelected ? "80ms" : "0ms") : "0ms" }}
                >
                  <CompanyCard
                    name={item.name}
                    description={item.description}
                    icon={item.icon}
                    showDescription={false}
                    onSelect={() => router.push(`/product-services/${item.id}`)}
                  />
                </div>
              )
            })}
          </div>

          <div className="w-full py-6 lg:py-8">
            <div
              className={`flex flex-col lg:flex-row gap-6 ${detailStage === "content" ? "lg:translate-x-0 translate-y-0 opacity-100" : "lg:translate-x-0 translate-y-12 opacity-0"}`}
              style={{
                transitionProperty: "transform, opacity",
                transitionDuration: detailStage === "content" ? "800ms" : "260ms",
                transitionDelay: detailStage === "content" ? "150ms" : "0ms",
                transitionTimingFunction: "cubic-bezier(0.32, 0.96, 0.33, 1)"
              }}
            >
              <div className="order-1 lg:basis-[60%] p-4 lg:p-8 flex flex-col gap-6 pr-0 lg:pr-10">
                <div>
                  <h3 className="text-foreground text-xl md:text-2xl font-medium tracking-tight">Complete Compliance & Security Readiness</h3>
                  <p className={`text-muted-foreground mt-3 text-base lg:text-lg transition-opacity duration-600 ease-out ${detailStage === "content" ? "opacity-100" : "opacity-0"}`}>
                    Stay compliant with privacy and healthcare regulations. Our platform meets GDPR and HIPAA requirements, providing data protection and compliance monitoring for regulated industries.
                  </p>
                </div>
                <div className="border border-border rounded-2xl bg-background overflow-hidden">
                  <ul className="grid grid-rows-6">
                    {ITEMS.map((item, idx) => {
                      const Icon = item.icon
                      return (
                        <li key={idx} className="p-3 md:p-4 border-t first:border-t-0 border-border">
                          <div className="flex items-center gap-3 md:gap-4 h-full">
                            <div className="flex items-start gap-3 md:gap-4">
                              <div className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-lg bg-background-700 text-foreground">
                                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs md:text-sm font-medium text-foreground">{item.title}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground">{item.subtitle}</div>
                                <p className="text-foreground text-sm md:text-base mt-2 md:mt-3 mb-1 md:mb-0">{item.highlight}</p>
                              </div>
                            </div>
                            <div className="shrink-0 ml-auto">
                              <Button variant="outline" className="gap-2 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm">
                                <span>View project</span>
                                <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
              <div className="order-2 lg:basis-[40%] flex flex-col w-full cursor-pointer" onClick={() => router.push('/product-services')}>
                <div className={`w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20 transition-all duration-700 ease-out ${detailStage === "content" ? "opacity-100 blur-0" : "opacity-60 blur-[3px]"}`} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
    )
}
