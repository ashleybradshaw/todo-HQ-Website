import type { Metadata } from "next";
import Link from "next/link";
import { GatewayIdle } from "@/components/GatewayIdle";
import { pageMetadata } from "@/lib/seo";
import { OFFERING_SUMMARY, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} — Enterprise AI, Autonomous Agents & Backend Factory`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function GatewayPage() {
  return (
    <main className="relative min-h-screen bg-[#4545FF] text-[#DFDFFF]">
      <article className="sr-only">
        <h1>{SITE_NAME} enterprise AI engineering factory</h1>
        <p>{SITE_DESCRIPTION}</p>
        <p>{OFFERING_SUMMARY}</p>
        <h2>Capabilities</h2>
        <ul>
          <li>Production-ready application design, code, and ship</li>
          <li>Autonomous agentic workflows and multi-agent ecosystems</li>
          <li>Scalable backend engineering for SaaS and enterprise</li>
          <li>Active roster: RepDaily, ReadyGo, and Contentic</li>
        </ul>
        <nav aria-label="Primary destinations">
          <Link href="/intro">Start the intro sequence</Link>
          <Link href="/home">Open the factory dashboard</Link>
          <Link href="/about">Read the manifesto</Link>
          <Link href="/work">View production work</Link>
          <Link href="/book">Book the team</Link>
        </nav>
      </article>
      <noscript>
        <p>{SITE_DESCRIPTION}</p>
        <p>
          <Link href="/home">Continue to the factory</Link>
          {" · "}
          <Link href="/about">About</Link>
          {" · "}
          <Link href="/work">Work</Link>
          {" · "}
          <Link href="/book">Book Team</Link>
        </p>
      </noscript>
      <GatewayIdle />
    </main>
  );
}
