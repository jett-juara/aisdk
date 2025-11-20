import { Header } from "@/components/layout/header/header"
import Footer from "@/components/layout/footer"

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background-deep relative overflow-hidden">
      {/* Noise Texture Overlay - Global for About Section */}
      <div className="absolute inset-0 bg-noise-overlay z-0" />

      {/* Ambient Glows - Global for About Section */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-glow-primary rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-glow-secondary rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Blueprint Network Overlay - Specific for About Section */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      <svg className="absolute inset-0 z-0 w-full h-full opacity-[0.20] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="300" height="300" patternUnits="userSpaceOnUse">
            {/* Row 1 - Using primary brand and chart colors */}
            <rect x="0" y="0" width="100" height="100" fill="#87139b" opacity="0.4" />
            <rect x="100" y="0" width="100" height="100" fill="#581c87" opacity="0.35" />
            <rect x="200" y="0" width="100" height="100" fill="#9b1371" opacity="0.3" />

            {/* Row 2 - Using secondary and accent colors */}
            <rect x="0" y="100" width="100" height="100" fill="#1e3a8a" opacity="0.3" />
            <rect x="100" y="100" width="100" height="100" fill="#5a2a5a" opacity="0.35" />
            <rect x="200" y="100" width="100" height="100" fill="#ab1e7e" opacity="0.3" />

            {/* Row 3 - Mix with purple and blue tones */}
            <rect x="0" y="200" width="100" height="100" fill="#9b1371" opacity="0.35" />
            <rect x="100" y="200" width="100" height="100" fill="#6366f1" opacity="0.3" />
            <rect x="200" y="200" width="100" height="100" fill="#87139b" opacity="0.4" />

            {/* Grid lines - vertical and horizontal */}
            <path d="M100,0 L100,300 M200,0 L200,300 M0,100 L300,100 M0,200 L300,200"
              fill="none" stroke="white" strokeWidth="0.5" opacity="0.6" />
          </pattern>

          {/* Vertical Fade Mask - Fades out top (header) and bottom (footer) */}
          <mask id="about-vertical-fade-mask">
            <linearGradient id="about-vertical-fade-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="black" />
              <stop offset="15%" stopColor="white" stopOpacity="0.3" />
              <stop offset="35%" stopColor="white" />
              <stop offset="65%" stopColor="white" />
              <stop offset="85%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="black" />
            </linearGradient>
            <rect width="100%" height="100%" fill="url(#about-vertical-fade-gradient)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" mask="url(#about-vertical-fade-mask)" />
      </svg>

      <Header />
      <main className="flex-1 relative z-10 py-12 flex flex-col">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
