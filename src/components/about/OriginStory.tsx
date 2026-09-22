import { aboutPage } from "@/content/pages/about";

export function OriginStory() {
  const { origin } = aboutPage;

  return (
    <section className="mt-16 grid grid-cols-1 gap-8 border-t border-border-ide pt-10 lg:grid-cols-2 lg:items-start">
      <div
        aria-hidden="true"
        className="aspect-[4/5] w-full border border-border-ide bg-foreground/8"
      />
      <div>
        <p className="type-label">{origin.eyebrow}</p>
        <h2 className="type-heading mt-3">{origin.title}</h2>
        {origin.body.map((paragraph) => (
          <p key={paragraph} className="type-body mt-4">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
