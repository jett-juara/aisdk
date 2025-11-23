import { Header } from "@/components/layout/header/header";
import Image from "next/image";
import { HomepageSection } from "@/components/homepage";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="relative isolate flex flex-col md:overflow-hidden lg:overflow-hidden bg-black min-h-[100svh] md:h-dvh lg:h-dvh [&_*]:focus:outline-none [&_*]:focus-visible:outline-none [&_*]:focus-visible:ring-0 [&_*]:focus-visible:ring-offset-0">
      {/* Background Images - Responsive switching with Next.js Image */}

      {/* Mobile Background */}
      <Image
        src="/images/home-hero/dark-hero-home-mobile.webp"
        alt="Background"
        width={800}
        height={1434}
        className="absolute top-0 left-0 w-full h-auto -z-10 md:hidden object-cover"
        priority
      />

      {/* Tablet Background */}
      <Image
        src="/images/home-hero/dark-hero-home-tablet.webp"
        alt="Background"
        width={1536}
        height={2048}
        className="hidden md:block lg:hidden absolute top-0 left-0 w-full h-auto -z-10 object-cover"
        priority
      />

      {/* Desktop Background */}
      <Image
        src="/images/home-hero/dark-hero-home.webp"
        alt="Background"
        width={1280}
        height={800}
        className="hidden lg:block absolute top-0 left-0 w-full h-auto -z-10 object-cover"
        priority
      />

      {/* 30% Dark Shadow Overlay */}
      <div className="pointer-events-none absolute inset-0 w-full h-full z-10 bg-black/30" />

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Main Content - Centered */}
      <main className="flex-grow relative z-10 flex flex-col justify-start lg:justify-center">
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
