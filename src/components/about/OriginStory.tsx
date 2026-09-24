import { AsciiReveal } from "@/components/about/AsciiReveal";
import { TypeComment } from "@/components/TypeComment";
import { aboutPage } from "@/content/pages/about";

export function OriginStory() {
  const { origin } = aboutPage;

  return (
    <section className="mt-16 grid grid-cols-1 gap-8 border-t border-border-ide pt-10 lg:grid-cols-2 lg:items-start">
      <div className="grid grid-cols-1 gap-3">
        {origin.media.map((item, index) => (
          <AsciiReveal
            key={item.src}
            src={item.src}
            alt={item.alt}
            delayMs={index === 1 ? 150 : 0}
          />
        ))}
      </div>
      <div>
        <TypeComment text={origin.eyebrow} />
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
