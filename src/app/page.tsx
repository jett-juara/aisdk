import { Header } from "@/components/layout/header/header";
import HomepageSection from "@/components/homepage/homepage-section";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Background Image - covers full viewport */}
      <div
        className="absolute inset-0 bg-[url('/images/hero_03-mobile.webp')] md:bg-[url('/images/hero_03-tablet.webp')] lg:bg-[url('/images/hero_03-xlarge.webp')] bg-cover bg-center"
        aria-hidden="true"
      />

      {/* 30% Dark Shadow Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full">
          <HomepageSection />
        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
