import { Header } from '@/components/layout/header/header';
import Footer from '@/components/layout/footer';
import { ProductServicesHero } from '@/components/product-services/hero';
import { ProductServicesContent } from '@/components/product-services/product';
import { ProductServicesAchievements } from '@/components/product-services/services';

export default function ProductServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ProductServicesHero />
        <ProductServicesContent />
        <ProductServicesAchievements />
      </main>
      <Footer />
    </div>
  );
}
