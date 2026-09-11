import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
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

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out">
      <JsonLd data={organizationGraph()} />
      <div className="relative z-10 mx-auto max-w-[1336px]">
        <p className="font-jetbrains text-base leading-5 font-bold">About;</p>
        <h1 className="font-unbounded mt-4 max-w-[20ch] text-4xl font-bold tracking-tight md:text-6xl">
          Most teams just write code. We build the entire factory.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">
          {SITE_DESCRIPTION}
        </p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed">
          The team behind {SITE_NAME} designs, codes, and ships production-ready
          applications, autonomous agentic workflows, multi-agent ecosystems,
          and scalable backends for enterprises, SaaS platforms, and high-growth
          technology companies.
        </p>

        <section className="mt-16 border-t border-border-ide pt-10">
          <h2 className="font-jetbrains text-base leading-5 font-bold">
            Engineering standards
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
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
            <Link href="/work" className="underline">
              [ Work ]
            </Link>
            <Link href="/book" className="underline">
              [ Book Team ]
            </Link>
            <Link href="/home" className="underline">
              [ Factory ]
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
