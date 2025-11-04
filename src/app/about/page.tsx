import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      <main className="flex-1 relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* Content */}
          <h1 className="font-heading text-4xl font-bold text-white mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
            About JUARA
          </h1>

          <p className="font-body text-lg leading-relaxed text-white/90 mb-8 sm:text-xl md:text-2xl max-w-3xl mx-auto">
            JUARA creates extraordinary events beyond boundaries. We combine creativity, technology,
            and strategic thinking to deliver unforgettable experiences in the most unexpected places.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <h3 className="font-heading text-2xl font-bold text-white mb-3">Off The Grid</h3>
              <p className="font-body text-white/70">
                We create experiences in unique locations that push boundaries and challenge expectations.
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-heading text-2xl font-bold text-white mb-3">Technology First</h3>
              <p className="font-body text-white/70">
                We leverage cutting-edge technology to enhance every aspect of event planning and execution.
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-heading text-2xl font-bold text-white mb-3">Unforgettable</h3>
              <p className="font-body text-white/70">
                Our events create lasting memories that resonate with audiences long after they're over.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16">
            <Link href="/contact">
              <Button
                size="lg"
                className="min-h-[56px] rounded-lg text-white px-8 py-4 font-heading text-lg font-semibold transition-all duration-200 hover:scale-[1.02] focus-visible:scale-[1.02] auth-button-brand hover:auth-button-brand-hover active:auth-button-brand-active"
              >
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}