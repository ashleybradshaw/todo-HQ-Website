import Link from "next/link";
import { notFoundPage } from "@/content/pages/not-found";
import { cn } from "@/lib/cn";

const linkClass =
  "type-body-sm inline-flex min-h-11 items-center underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const ctaClass =
  "type-label inline-flex min-h-11 items-center justify-center rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-on-tint transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

export function NotFoundNav() {
  return (
    <nav
      className="flex flex-wrap items-center gap-4"
      aria-label={notFoundPage.navAria}
    >
      {notFoundPage.links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(link.primary ? ctaClass : linkClass)}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
