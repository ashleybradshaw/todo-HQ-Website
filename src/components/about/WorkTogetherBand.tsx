import Link from "next/link";
import { aboutPage } from "@/content/pages/about";

const linkClass =
  "underline decoration-[color-mix(in_srgb,var(--foreground)_45%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

export function WorkTogetherBand() {
  const { workTogether } = aboutPage;

  return (
    <section className="mt-16 border-t border-border-ide pt-10">
      <h2 className="type-heading">{workTogether.title}</h2>
      <div className="type-body mt-8 flex flex-wrap gap-6 font-bold">
        <Link
          href={workTogether.ctaHref}
          className={`${linkClass} text-accent-swap`}
        >
          {workTogether.ctaLabel}
        </Link>
        <Link href={workTogether.secondary.href} className={linkClass}>
          {workTogether.secondary.label}
        </Link>
      </div>
    </section>
  );
}
