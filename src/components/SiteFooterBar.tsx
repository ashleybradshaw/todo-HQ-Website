import Link from "next/link";
import { FooterClock } from "@/components/FooterClock";
import { footer } from "@/content/pages/shared";
import { SOCIAL } from "@/lib/site";

const linkClass =
  "inline-flex min-h-6 min-w-6 items-center underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

/** Static footer chrome + clock island (no pathname logic). */
export function SiteFooterBar() {
  return (
    <footer className="border-border-ide bg-bg-canvas text-foreground relative z-10 border-t transition-[background-color,color,border-color] duration-[400ms] ease-in-out">
      <div className="font-jetbrains flex flex-col gap-3 px-4 py-4 text-[10px] tracking-wide uppercase sm:px-6 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6 lg:gap-y-2 lg:text-xs">
        <p>{footer.copyright}</p>
        {SOCIAL.x ? (
          <p>
            <a
              href={SOCIAL.x}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {footer.x}
            </a>
          </p>
        ) : null}
        <FooterClock />
        <Link href={footer.workTogetherHref} className={linkClass}>
          {footer.workTogether}
        </Link>
        <Link href={footer.privacyHref} className={linkClass}>
          {footer.privacy}
        </Link>
      </div>
    </footer>
  );
}
