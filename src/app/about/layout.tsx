"use client"

import { Header } from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { ThemeProvider } from "@/components/about-page/theme-provider"

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />
        <main className="flex-1 relative z-10 py-12 flex items-center justify-center">
          <div className="container mx-auto px-4">{children}</div>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}