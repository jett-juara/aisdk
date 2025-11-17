import { Button } from "@/components/ui/button";
import {
  Trophy,
  Award,
  Lightbulb,
  HeartHandshake,
  Users,
  Leaf,
  ArrowRight,
} from "lucide-react";

const ITEMS = [
  {
    icon: Trophy,
    title: "Industry Recognition",
    subtitle: "Achievement",
    highlight: "Outstanding Performance Award.",
  },
  {
    icon: Award,
    title: "Excellence Award",
    subtitle: "Recognition",
    highlight: "Best in Category Winner.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Prize",
    subtitle: "Technology",
    highlight: "Breakthrough Solution of the Year.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Success",
    subtitle: "Service",
    highlight: "Top-Rated Solution Provider.",
  },
  {
    icon: Users,
    title: "Global Leadership",
    subtitle: "Management",
    highlight: "Executive Team of the Year.",
  },
  {
    icon: Leaf,
    title: "Sustainability Impact",
    subtitle: "Environmental",
    highlight: "Green Initiative Excellence.",
  },
];

export function ProductServicesAchievements() {
  return (
    <section className="bg-background min-h-[calc(100dvh-5rem)] flex items-center">
      <div className="container w-full">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-foreground text-2xl md:text-3xl font-semibold mb-6">
              Our Achievements & Recognition
            </h2>
            <div className="w-full mr-auto">
              <div className="border border-border rounded-2xl bg-background h-[calc(100dvh-5rem-4rem)] overflow-hidden">
                <ul className="grid grid-rows-6 h-full">
              {ITEMS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx} className="p-3 md:p-4 border-t first:border-t-0 border-border">
                    <div className="flex items-center gap-3 md:gap-4 h-full">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-lg bg-background-700 text-foreground">
                          <Icon className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs md:text-sm font-medium text-foreground">
                            {item.title}
                          </div>
                          <div className="text-[10px] md:text-xs text-muted-foreground">
                            {item.subtitle}
                          </div>
                           <p className="text-foreground text-sm md:text-base mt-2 md:mt-3 mb-1 md:mb-0">
                             {item.highlight}
                           </p>
                        </div>
                      </div>
                      <div className="shrink-0 ml-auto">
                        <Button variant="outline" className="gap-2 h-8 md:h-9 px-2 md:px-3 text-xs md:text-sm">
                          <span>View project</span>
                          <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-foreground text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">
              Complete Compliance & Security Readiness
            </h3>
            <p className="text-muted-foreground mt-4 text-base lg:text-lg">
              Stay compliant with privacy and healthcare regulations. Our platform meets GDPR and HIPAA requirements, providing data protection and compliance monitoring for regulated industries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
