"use client"

import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CompaniesGrid from "@/components/about-page/companies-grid";
import { ThemeProvider } from "@/components/about-page/theme-provider";

export default function AboutPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-black text-white flex flex-col">
        <Header fixed={false} />

        <main className="flex-1 relative z-10 py-12 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <CompaniesGrid />
          </div>
        </main>

        <Footer fixed={false} />
      </div>
    </ThemeProvider>
  );
}
