"use client"

import type { LucideIcon } from "lucide-react"

interface CompanyCardProps {
  name: string
  description: string
  icon: LucideIcon
  onSelect: () => void
  showDescription?: boolean
}

export default function CompanyCard({ name, description, icon: Icon, onSelect, showDescription = true }: CompanyCardProps) {
  return (
    <div
      className="group relative rounded-[var(--radius-none)] overflow-hidden cursor-pointer border border-button-border transition-all duration-300 h-full hover:brightness-110 transform-gpu shadow-none hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
      onClick={onSelect}
    >
      <div className="absolute inset-0 auth-bg-hover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="flex items-center gap-2 justify-start">
          <Icon className="h-9 w-9 text-auth-text-primary drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" aria-hidden="true" />
          <span className="sr-only">{name}</span>
        </div>
        {showDescription && <p className="auth-text-secondary text-xs">{description}</p>}
      </div>
    </div>
  )
}
