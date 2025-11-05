"use client"

import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CompaniesGrid from "@/components/about-page/companies-grid";
import { ThemeProvider } from "@/components/about-page/theme-provider";

export default function AboutPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header />

        <main className="flex-1 relative z-10 flex items-center justify-center">
          <div className="relative z-10 bg-color-dashboard-bg-main h-screen w-screen overflow-hidden flex items-center justify-center">
            <CompaniesGrid />
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}