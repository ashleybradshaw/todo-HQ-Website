import { aboutPage } from "@/content/pages/about";

export function SignalStrip() {
  return (
    <section className="relative left-1/2 mt-16 w-screen -translate-x-1/2 bg-foreground text-background">
      <div className="mx-auto grid max-w-[1336px] grid-cols-1 gap-px bg-background/20 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
        {aboutPage.stats.map((stat) => (
          <div key={stat.figure} className="bg-foreground px-4 py-8">
            <p className="type-title">{stat.figure}</p>
            <p className="type-label mt-3 text-background/70">{stat.label}</p>
          </div>
        ))}
        <div className="flex min-h-40 flex-col justify-end border border-background/20 bg-background/10 px-4 py-8">
          <p className="type-label text-background/70">Floor</p>
        </div>
      </div>
    </section>
  );
}
