import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { organizationGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "The manifesto and engineering standards behind //TODO Engineering — an internal software factory for autonomous agents, multi-agent ecosystems, and production SaaS architecture.",
  path: "/about",
});

const STANDARDS = [
  {
    label: "01",
    title: "Internal software factory",
    body: "Repeatable process, not one-off freelance. The same production system that ships our own apps is the system we run for clients.",
  },
  {
    label: "02",
    title: "Multi-agent systems",
    body: "AI workflow architecture is a core capability: autonomous agents, orchestrated pipelines, and human-in-the-loop gates where the work demands it.",
  },
  {
    label: "03",
    title: "Production, not prototypes",
    body: "We design, build, and ship applications that hold up in production — backends included. Velocity without a disposable architecture.",
  },
] as const;

const ctaClass =
  "underline decoration-[color-mix(in_srgb,var(--foreground)_45%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationGraph()} />
      <PageShell
        eyebrow="ABOUT //"
        title="Most teams just write code. We build the entire factory."
        lede={
          <>
            <p>{SITE_DESCRIPTION}</p>
            <p className="mt-4">
              The team behind {SITE_NAME} designs, codes, and ships
              production-ready applications, autonomous agentic workflows,
              multi-agent ecosystems, and scalable backends for enterprises,
              SaaS platforms, and high-growth technology companies.
            </p>
          </>
        }
      >
        <section className="mt-16 border-t border-border-ide pt-10">
          <h2 className="font-jetbrains text-base leading-5 font-bold">
            Engineering standards
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-6">
            {STANDARDS.map((standard) => (
              <li
                key={standard.label}
                className="border-border-ide border p-6"
              >
                <p className="font-jetbrains text-sm font-bold">
                  {standard.label}
                </p>
                <h3 className="font-unbounded mt-3 text-xl font-bold tracking-tight">
                  {standard.title}
                </h3>
                <p className="mt-3 leading-relaxed">{standard.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border-t border-border-ide pt-10">
          <h2 className="font-jetbrains text-base leading-5 font-bold">
            The factory
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed">
            Proof is in production: <strong>Repdaily</strong>,{" "}
            <strong>ReadyGo</strong>, and <strong>Contentic</strong>. The same
            roster, the same pipeline, available to technical founders and
            product leads who need the work to ship.
          </p>
          <div className="font-jetbrains mt-8 flex flex-wrap gap-6 text-base font-bold">
            <Link href="/work" className={ctaClass}>
              [ Work ]
            </Link>
            <Link href="/book" className={ctaClass}>
              [ Book Team ]
            </Link>
            <Link href="/home" className={ctaClass}>
              [ Factory ]
            </Link>
          </div>
        </section>
      </PageShell>
    </>
  );
}
