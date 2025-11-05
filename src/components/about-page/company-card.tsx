"use client"

interface CompanyCardProps {
  id: number
  name: string
  description: string
  gradient: string
  onSelect: () => void
}

export default function CompanyCard({ id, name, description, gradient, onSelect }: CompanyCardProps) {
  return (
    <div
      className="group relative rounded-xl overflow-hidden cursor-pointer border auth-border transition-all duration-300 hover:border-purple-500/50 h-full hover:shadow-lg hover:shadow-purple-500/20 transform-origin-center transition-transform"
      onClick={onSelect}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`}
      />
      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
        <div />
        <div>
          <h3 className="font-bold auth-text-primary font-heading mb-1 text-lg">{name}</h3>
          <p className="auth-text-secondary text-sm line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  )
}
