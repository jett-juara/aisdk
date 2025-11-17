import { Hero47 } from '@/components/blocks/hero47';
import { ProductsSection } from '@/components/products-services/products-section';
import { ServicesSection } from '@/components/products-services/services-section';
import { PRODUCT_SERVICES_CONTENT } from '@/components/products-services';

export default function ProductServicesPage() {
  return (
    <main>
      <Hero47
        heading={PRODUCT_SERVICES_CONTENT.headline}
        subheading={PRODUCT_SERVICES_CONTENT.subheading}
        description={PRODUCT_SERVICES_CONTENT.description}
        buttons={{
          primary: {
            text: PRODUCT_SERVICES_CONTENT.cta.text,
            url: PRODUCT_SERVICES_CONTENT.cta.url,
          },
          secondary: {
            text: "View Services",
            url: "#services",
          },
        }}
        image={{
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-7-tall.svg",
          alt: "Product & Services",
        }}
      />
      <ProductsSection products={PRODUCT_SERVICES_CONTENT.products} />
      <ServicesSection services={PRODUCT_SERVICES_CONTENT.services} />
    </main>
  );
}