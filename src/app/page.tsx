import { Header } from "@/components/layout/header/header";
import { HomepageSection } from "@/components/homepage";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="relative isolate flex flex-col overflow-hidden bg-black md:h-dvh lg:h-dvh [&_*]:focus:outline-none [&_*]:focus-visible:outline-none [&_*]:focus-visible:ring-0 [&_*]:focus-visible:ring-offset-0">
      {/* Background Image - covers full viewport */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[url('/images/home-hero/dark-hero-home.webp')] bg-cover bg-center"
        aria-hidden="true"
      />

      {/* 30% Dark Shadow Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-black/30" />

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Main Content - Centered */}
      <main className="relative z-20 flex flex-1 items-center justify-center overflow-hidden">
        <div className="w-full h-full">
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
