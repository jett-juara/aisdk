import { Header } from "@/components/layout/header/header"
import Footer from "@/components/layout/footer"

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-deep relative overflow-hidden">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-noise-overlay z-0" />

      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-glow-primary rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-glow-secondary rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Spotlight Stage Overlay - Copied from Product for consistency */}
      {/* Main spotlight from top center */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_-20%,rgba(155,19,113,0.25)_0%,rgba(155,19,113,0.12)_30%,transparent_60%)]" />

      {/* Secondary spotlight from top-right */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_80%_0%,rgba(99,102,241,0.18)_0%,rgba(99,102,241,0.08)_35%,transparent_55%)]" />

      {/* Stage glow from bottom (like footlights) */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_100%,rgba(171,30,126,0.15)_0%,transparent_40%)]" />

      {/* Subtle particles overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Grid Pattern Overlay - Exact match to Product page colors */}
      <svg className="absolute inset-0 z-0 w-full h-full opacity-[0.20] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="services-grid-pattern" width="300" height="300" patternUnits="userSpaceOnUse">
            {/* Row 1 - Blue/Indigo dominant for Services identity */}
            <rect x="0" y="0" width="100" height="100" fill="#1e3a8a" opacity="0.4" />
            <rect x="100" y="0" width="100" height="100" fill="#6366f1" opacity="0.35" />
            <rect x="200" y="0" width="100" height="100" fill="#581c87" opacity="0.3" />

            {/* Row 2 - Darker tones with Magenta accent */}
            <rect x="0" y="100" width="100" height="100" fill="#5a2a5a" opacity="0.35" />
            <rect x="100" y="100" width="100" height="100" fill="#1e3a8a" opacity="0.3" />
            <rect x="200" y="100" width="100" height="100" fill="#9b1371" opacity="0.3" />

            {/* Row 3 - Indigo/Purple mix */}
            <rect x="0" y="200" width="100" height="100" fill="#6366f1" opacity="0.3" />
            <rect x="100" y="200" width="100" height="100" fill="#581c87" opacity="0.35" />
            <rect x="200" y="200" width="100" height="100" fill="#1e3a8a" opacity="0.4" />

            {/* Grid lines - vertical and horizontal */}
            <path d="M100,0 L100,300 M200,0 L200,300 M0,100 L300,100 M0,200 L300,200"
              fill="none" stroke="white" strokeWidth="0.5" opacity="0.6" />
          </pattern>

          {/* Vertical Fade Mask - Fades out top (header) and bottom (footer) */}
          <mask id="services-vertical-fade-mask">
            <linearGradient id="services-vertical-fade-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="black" />
              <stop offset="15%" stopColor="white" stopOpacity="0.3" />
              <stop offset="35%" stopColor="white" />
              <stop offset="65%" stopColor="white" />
              <stop offset="85%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="black" />
            </linearGradient>
            <rect width="100%" height="100%" fill="url(#services-vertical-fade-gradient)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#services-grid-pattern)" mask="url(#services-vertical-fade-mask)" />
      </svg>

      <Header />
      <main className="flex-1 relative z-10 py-12 lg:py-12 flex flex-col">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
