import { AsciiReveal } from "@/components/about/AsciiReveal";
import { aboutPage } from "@/content/pages/about";

export function OriginStory() {
  const { origin } = aboutPage;

  return (
    <section className="mt-16 grid grid-cols-1 gap-8 border-t border-border-ide pt-10 lg:grid-cols-2 lg:items-start">
      <AsciiReveal src={origin.mediaSrc} alt={origin.mediaAlt} />
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
