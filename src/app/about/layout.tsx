import { Header } from "@/components/layout/header/header"
import Footer from "@/components/layout/footer"

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
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
