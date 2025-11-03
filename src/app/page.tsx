import { Header } from "@/components/layout/header";
import HomepageSection from "@/components/homepage/homepage-section";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="relative">
        <HomepageSection />
        <Footer />
      </div>
    </div>
  );
}
