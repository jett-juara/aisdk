import { ProductServicesHero, ProductServicesContentComponent, PRODUCT_SERVICES_CONTENT } from '@/components/products-services';

export default function ProductServicesPage() {
  return (
    <main>
      <ProductServicesHero
        heading={PRODUCT_SERVICES_CONTENT.headline}
        subheading={PRODUCT_SERVICES_CONTENT.subheading}
        description={PRODUCT_SERVICES_CONTENT.description}
        buttons={{
          primary: {
            text: PRODUCT_SERVICES_CONTENT.cta.text,
            url: PRODUCT_SERVICES_CONTENT.cta.url,
          },
        }}
      />
      <ProductServicesContentComponent
        products={PRODUCT_SERVICES_CONTENT.products}
        services={PRODUCT_SERVICES_CONTENT.services}
      />
    </main>
  );
}