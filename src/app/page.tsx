import { Header } from "@/components/layout/header";
import HomepageSection from "@/components/homepage/homepage-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <HomepageSection />
    </div>
  );
}
