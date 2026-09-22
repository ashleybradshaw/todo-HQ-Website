import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { aboutPage } from "@/content/pages/about";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: aboutPage.metaDescription,
  path: "/about",
});

const ctaClass =
  "underline decoration-[color-mix(in_srgb,var(--foreground)_45%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

export default function AboutPage() {
  return (
    <PageShell
      variant="essay"
      eyebrow={aboutPage.eyebrow}
      eyebrowClassName="text-center"
      title={aboutPage.title}
      titleClassName="type-title text-center text-balance tracking-tight"
      ledeClassName="text-center"
      lede={
        <>
          <p>{aboutPage.lede[0]}</p>
          <p className="mt-4">{aboutPage.lede[1]}</p>
        </>
      }
    >
      <section className="mt-16 border-t border-border-ide pt-10">
        <h2 className="type-heading">{aboutPage.standardsHeading}</h2>
        <ul className="mt-8 grid grid-cols-1 gap-6">
          {aboutPage.standards.map((standard) => (
            <li key={standard.label} className="border-border-ide border p-6">
              <p className="type-meta font-bold">{standard.label}</p>
              <h3 className="type-subhead mt-3">{standard.title}</h3>
              <p className="type-body mt-3">{standard.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 border-t border-border-ide pt-10">
        <h2 className="type-heading">{aboutPage.factoryHeading}</h2>
        <p className="type-body mt-4">{aboutPage.factoryProof}</p>
        <div className="type-body mt-8 flex flex-wrap gap-6 font-bold">
          {aboutPage.ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className={
                cta.href === "/book" ? `${ctaClass} text-accent-swap` : ctaClass
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
