import { Header } from "@/components/layout/header/header"
import Footer from "@/components/layout/footer"

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-deep relative overflow-hidden">
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 bg-noise-overlay z-0" />

      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-glow-primary rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-glow-secondary rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Spotlight Stage Overlay - Specific for Product Section */}
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

      {/* Grid Pattern Overlay - Same structure as About but different colors */}
      <svg className="absolute inset-0 z-0 w-full h-full opacity-[0.20] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="product-grid-pattern" width="300" height="300" patternUnits="userSpaceOnUse">
            {/* Row 1 - Lighter magenta/pink tones for spotlight feel */}
            <rect x="0" y="0" width="100" height="100" fill="#ab1e7e" opacity="0.4" />
            <rect x="100" y="0" width="100" height="100" fill="#9b1371" opacity="0.35" />
            <rect x="200" y="0" width="100" height="100" fill="#6366f1" opacity="0.3" />

            {/* Row 2 - Deep purple and blue mix */}
            <rect x="0" y="100" width="100" height="100" fill="#9b1371" opacity="0.3" />
            <rect x="100" y="100" width="100" height="100" fill="#1e3a8a" opacity="0.35" />
            <rect x="200" y="100" width="100" height="100" fill="#581c87" opacity="0.3" />

            {/* Row 3 - Secondary and accents */}
            <rect x="0" y="200" width="100" height="100" fill="#5a2a5a" opacity="0.35" />
            <rect x="100" y="200" width="100" height="100" fill="#ab1e7e" opacity="0.3" />
            <rect x="200" y="200" width="100" height="100" fill="#87139b" opacity="0.4" />

            {/* Grid lines - vertical and horizontal */}
            <path d="M100,0 L100,300 M200,0 L200,300 M0,100 L300,100 M0,200 L300,200"
              fill="none" stroke="white" strokeWidth="0.5" opacity="0.6" />
          </pattern>

          {/* Vertical Fade Mask - Fades out top (header) and bottom (footer) */}
          <mask id="vertical-fade-mask">
            <linearGradient id="vertical-fade-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="black" />
              <stop offset="15%" stopColor="white" stopOpacity="0.3" />
              <stop offset="35%" stopColor="white" />
              <stop offset="65%" stopColor="white" />
              <stop offset="85%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="black" />
            </linearGradient>
            <rect width="100%" height="100%" fill="url(#vertical-fade-gradient)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#product-grid-pattern)" mask="url(#vertical-fade-mask)" />
      </svg>

      <Header />
      <main className="flex-1 relative z-10 py-6 lg:py-0 flex items-center justify-center">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
