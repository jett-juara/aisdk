import { Badge } from "@/components/ui/badge";
import { Product } from './types';

interface ProductsSectionProps {
  products: Product[];
}

const ProductsSection = ({ products }: ProductsSectionProps) => {
  return (
    <section className="bg-muted/50 py-32">
      <div className="container">
        <div className="grid gap-9 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Badge variant="outline" className="bg-background gap-1.5">
              <span className="size-1.5 rounded-full bg-blue-500" />
              Products
            </Badge>
            <h1 className="text-balance text-4xl font-medium lg:text-5xl">
              Our Event Products
            </h1>
            <p className="text-muted-foreground text-lg">
              Comprehensive event management solutions designed to create exceptional experiences. From audience flow to creative execution, we handle every aspect of your event needs.
            </p>
            <div className="flex items-center gap-6">
              <div className="h-22 opacity-50 grayscale md:h-28 flex items-center justify-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg opacity-70" />
              </div>
              <div className="h-22 opacity-60 grayscale md:h-28 flex items-center justify-center">
                <div className="w-12 h-12 bg-purple-500 rounded-lg opacity-70" />
              </div>
            </div>
          </div>
          <div className="border-border bg-background rounded-2xl border">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`border-border relative overflow-hidden ${
                  index === 0 ? '' : index === products.length - 1 ? 'border-t' : 'border-b'
                } p-6 lg:px-8 lg:py-11`}
              >
                <div>
                  <h2 className="text-xl font-medium lg:text-2xl">
                    {product.name}
                  </h2>
                  <p className="text-muted-foreground mt-2 w-3/4 pr-10 text-sm md:text-base">
                    Professional {product.name.toLowerCase()} solutions for seamless event execution and exceptional guest experiences.
                  </p>
                </div>
                {/* Product Icon Placeholder */}
                <div className="text-muted-foreground absolute -bottom-7 right-4 size-24 opacity-80 flex items-center justify-center rounded-lg bg-muted lg:right-8 lg:size-32">
                  <div className="w-8 h-8 bg-blue-500 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProductsSection };