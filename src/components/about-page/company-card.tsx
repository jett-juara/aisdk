"use client"

interface CompanyCardProps {
  name: string
  description: string
  gradient: string
  onSelect: () => void
}

export default function CompanyCard({ name, description, gradient, onSelect }: CompanyCardProps) {
  return (
    <div
      className="group relative rounded-[var(--radius-none)] overflow-hidden cursor-pointer border auth-border transition-all duration-300 h-full hover:brightness-110 transform-gpu shadow-none hover:-translate-y-[6px] hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]"
      onClick={onSelect}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <h3 className="font-bold auth-text-primary font-heading mb-1 text-base">{name}</h3>
        <p className="auth-text-secondary text-xs">{description}</p>
      </div>
    </div>
  )
}
