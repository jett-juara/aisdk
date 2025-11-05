export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-8 pt-32">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Welcome to JUARA</h1>
        <p className="text-lg text-muted-foreground mb-12 text-balance">
          Extraordinary events. Brilliant experiences. Built with innovation and creativity.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="px-8 py-3 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition">
            Explore Events
          </button>
          <button className="px-8 py-3 rounded-lg border border-muted hover:bg-muted/10 transition">Learn More</button>
        </div>
      </div>
    </section>
  )
}
