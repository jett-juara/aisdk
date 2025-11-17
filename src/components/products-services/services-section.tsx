import { Badge } from "@/components/ui/badge";
import { Service } from './types';

interface ServicesSectionProps {
  services: Service[];
}

const ServicesSection = ({ services }: ServicesSectionProps) => {
  return (
    <section id="services" className="bg-background py-32">
      <div className="container">
        <div className="grid gap-9 lg:grid-cols-2 lg:flex-row-reverse">
          <div className="flex flex-col gap-5">
            <Badge variant="outline" className="bg-background gap-1.5">
              <span className="size-1.5 rounded-full bg-green-500" />
              Services
            </Badge>
            <h1 className="text-balance text-4xl font-medium lg:text-5xl">
              Professional Services
            </h1>
            <p className="text-muted-foreground text-lg">
              Expert services to support your event from conception to completion. Our team brings creativity, precision, and local expertise to every project.
            </p>
            <div className="flex items-center gap-6">
              <div className="h-22 opacity-50 grayscale md:h-28 flex items-center justify-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg opacity-70" />
              </div>
              <div className="h-22 opacity-60 grayscale md:h-28 flex items-center justify-center">
                <div className="w-12 h-12 bg-teal-500 rounded-lg opacity-70" />
              </div>
            </div>
          </div>
          <div className="border-border bg-muted/30 rounded-2xl border">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`border-border relative overflow-hidden ${
                  index === 0 ? '' : index === services.length - 1 ? 'border-t' : 'border-b'
                } p-6 lg:px-8 lg:py-11`}
              >
                <div>
                  <h2 className="text-xl font-medium lg:text-2xl">
                    {service.name}
                  </h2>
                  <p className="text-muted-foreground mt-2 w-3/4 pr-10 text-sm md:text-base">
                    Comprehensive {service.name.toLowerCase()} expertise to ensure your event runs smoothly and achieves its objectives.
                  </p>
                </div>
                {/* Service Icon Placeholder */}
                <div className="text-muted-foreground absolute -bottom-7 right-4 size-24 opacity-80 flex items-center justify-center rounded-lg bg-background lg:right-8 lg:size-32">
                  <div className="w-8 h-8 bg-green-500 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { ServicesSection };