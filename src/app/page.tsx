import type { Metadata } from "next";
import { GatewayIdle } from "@/components/GatewayIdle";
import { JsonLd } from "@/components/JsonLd";
import { organizationGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { OFFERING_SUMMARY, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} — Enterprise AI, Autonomous Agents & Backend Factory`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function GatewayPage() {
  return (
    <main className="relative min-h-screen bg-[#4545FF] text-[#DDDDFF]">
      <JsonLd data={organizationGraph()} />
      <article className="sr-only">
        <h1>{SITE_NAME} enterprise AI engineering factory</h1>
        <p>{SITE_DESCRIPTION}</p>
        <p>{OFFERING_SUMMARY}</p>
        <h2>Capabilities</h2>
        <ul>
          <li>Production-ready application design, code, and ship</li>
          <li>Autonomous agentic workflows and multi-agent ecosystems</li>
          <li>Scalable backend engineering for SaaS and enterprise</li>
          <li>Active roster: Repdaily, ReadyGo, and Contentic</li>
        </ul>
        <nav aria-label="Primary destinations">
          <a href="/intro">Start the intro sequence</a>
          <a href="/home">Open the factory dashboard</a>
          <a href="/about">Read the manifesto</a>
          <a href="/work">View production work</a>
          <a href="/book">Book the team</a>
        </nav>
      </article>
      <noscript>
        <p>{SITE_DESCRIPTION}</p>
        <p>
          <a href="/home">Continue to the factory</a>
          {" · "}
          <a href="/about">About</a>
          {" · "}
          <a href="/work">Work</a>
          {" · "}
          <a href="/book">Book Team</a>
        </p>
      </noscript>
      <GatewayIdle />
    </main>
  );
}
