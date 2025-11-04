import { Header } from "@/components/layout/header";
import HomepageSection from "@/components/homepage/homepage-section";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="h-screen bg-black overflow-hidden relative">
      <Header />
      <HomepageSection />
      <Footer />
    </div>
  );
}
