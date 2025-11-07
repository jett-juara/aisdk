import { Header } from "@/components/layout/header/header";
import HomepageSection from "@/components/homepage/homepage-section";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="relative isolate flex min-h-screen min-h-dvh flex-col overflow-hidden bg-black">
      {/* Background Image - covers full viewport */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/home-hero/hero_03-mobile.webp')] bg-cover bg-center md:bg-[url('/images/home-hero/hero_03-tablet.webp')] lg:bg-[url('/images/home-hero/hero_03-desktop.webp')]"
        aria-hidden="true"
      />

      {/* 30% Dark Shadow Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black/30" />

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Main Content - Centered */}
      <main className="relative z-20 flex flex-1 items-center justify-center">
        <div className="w-full">
          <HomepageSection />
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
