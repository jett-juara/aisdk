"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CompanyCard from "@/components/about-page/company-card"
import { Package, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductPage() {
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
              const isSelected = item.id === "product"
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
              <div className="order-1 lg:basis-[40%] flex flex-col w-full">
                <div className={`w-full h-full min-h-[200px] rounded-[var(--radius-none)] border border-dashed border-white/20 bg-black/20 transition-all duration-700 ease-out ${detailStage === "content" ? "opacity-100 blur-0" : "opacity-60 blur-[3px]"}`} aria-hidden="true" />
              </div>
              <div className="order-2 lg:basis-[60%] p-4 lg:p-8 flex flex-col gap-6 pr-0 lg:pr-10 cursor-pointer" onClick={() => router.push('/product-services')}>
                <div className="space-y-2">
                  <h2 className="text-2xl font-heading font-semibold">Complete Compliance & Security Readiness</h2>
                  <p className={`text-muted-foreground transition-opacity duration-600 ease-out ${detailStage === "content" ? "opacity-100" : "opacity-0"}`}>
                    Stay compliant with privacy and healthcare regulations. Our platform meets GDPR and HIPAA requirements, providing data protection and compliance monitoring for regulated industries.
                  </p>
                </div>
                <div className="border-border bg-background rounded-2xl border">
                  <div className="grid divide-y divide-border">
                    <div className="border-border relative overflow-hidden p-3 md:p-4 min-h-28 md:min-h-32 flex flex-col justify-center">
                      <div>
                        <h3 className="text-lg md:text-xl font-medium">Automated audit trails</h3>
                        <p className="text-muted-foreground mt-1 mb-0 text-sm md:text-base leading-relaxed">
                          Every action is logged and timestamped with immutable audit trails for complete regulatory compliance.
                        </p>
                      </div>
                    </div>
                    <div className="border-border relative overflow-hidden p-3 md:p-4 min-h-28 md:min-h-32 flex flex-col justify-center">
                      <div>
                        <h3 className="text-lg md:text-xl font-medium">Role-based access control</h3>
                        <p className="text-muted-foreground mt-1 mb-0 text-sm md:text-base leading-relaxed">
                          Granular role-based access ensures secure data access management.
                        </p>
                      </div>
                    </div>
                    <div className="border-border relative overflow-hidden p-3 md:p-4 min-h-28 md:min-h-32 flex flex-col justify-center">
                      <div>
                        <h3 className="text-lg md:text-xl font-medium">Incident response</h3>
                        <p className="text-muted-foreground mt-1 mb-0 text-sm md:text-base leading-relaxed">
                          Defined procedures enable rapid detection and remediation of incidents.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
}
