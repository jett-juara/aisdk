import { Header } from "@/components/layout/header/header"
import Footer from "@/components/layout/footer"

export default function ProductServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}