import Link from "next/link";
import { siteData } from "@/data/siteData";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { Reveal } from "@/components/motion/Reveal";

export function SiteFooter() {
  const { metadata, footer } = siteData;

  return (
    <footer className="mt-auto grid-border-t">
      <Reveal>
        <SiteLogo size="footer" />
      </Reveal>
      <div className="flex items-start justify-center gap-[50px] pb-[53px] font-mono text-[16px] text-accent">
        <p>{metadata.copyright}</p>
        <Link href={footer.privacyHref} className="underline">
          {footer.privacyLabel}
        </Link>
        <a href={`mailto:${metadata.email}`}>{metadata.email}</a>
      </div>
    </footer>
  );
}
