import { Header } from "@/components/layout/header";
import HomepageSection from "@/components/homepage/homepage-section";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="h-screen bg-black relative bg-[url('/images/hero_03-mobile.webp')] md:bg-[url('/images/hero_03-tablet.webp')] lg:bg-[url('/images/hero_03-xlarge.webp')] bg-cover bg-center overflow-hidden">
      <div className="flex flex-col h-full">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <HomepageSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
