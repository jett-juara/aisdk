import { Header } from "@/components/layout/header";
import HomepageSection from "@/components/homepage/homepage-section";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative bg-[url('/images/hero_03-mobile.webp')] md:bg-[url('/images/hero_03-tablet.webp')] lg:bg-[url('/images/hero_03-xlarge.webp')] bg-cover bg-center">
      <Header />
      <main className="relative">
        <HomepageSection />
        <Footer />
      </main>
    </div>
  );
}
