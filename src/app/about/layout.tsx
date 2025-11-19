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

      <Header />
      <main className="flex-1 relative z-10 py-12 flex items-center justify-center">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
