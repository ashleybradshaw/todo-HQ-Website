import type { Metadata } from "next";
import Link from "next/link";
import { GatewayIdle } from "@/components/GatewayIdle";
import { landingPage } from "@/content/pages/landing";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: landingPage.seo.title,
  description: landingPage.seo.description,
  path: "/",
});

export default function GatewayPage() {
  const { srOnly, noscript } = landingPage;

  return (
    <main id="main" tabIndex={-1} className="landing-shell relative min-h-screen bg-[#4545FF] text-[#DFDFFF]">
      <article className="sr-only">
        <h1>{srOnly.h1}</h1>
        <p>{srOnly.description}</p>
        <p>{srOnly.offering}</p>
        <h2>{srOnly.capabilitiesHeading}</h2>
        <ul>
          {srOnly.capabilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <nav aria-label={srOnly.navAria}>
          {srOnly.nav.map((link) => (
            <Link key={link.href} href={link.href} tabIndex={-1}>
              {link.label}
            </Link>
          ))}
        </nav>
      </article>
      <noscript>
        <p>{noscript.description}</p>
        <p>
          {noscript.links.map((link, index) => (
            <span key={link.href}>
              {index > 0 ? " · " : null}
              <Link href={link.href}>{link.label}</Link>
            </span>
          ))}
        </p>
      </noscript>
      <GatewayIdle />
    </main>
  );
}
