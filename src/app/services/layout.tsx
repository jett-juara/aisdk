import { Header } from "@/components/layout/header/header"
import Footer from "@/components/layout/footer"

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 min-h-0 flex items-center">{children}</main>
      <Footer />
    </div>
  )
}