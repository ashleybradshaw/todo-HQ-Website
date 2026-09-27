import type { Metadata } from "next";
import Link from "next/link";
import { FloorGhostDuo } from "@/components/ide/FloorGhost";
import { NotFoundRoute } from "@/components/NotFoundRoute";
import { notFoundPage } from "@/content/pages/not-found";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: { absolute: notFoundPage.seo.title },
  robots: { index: false, follow: true },
};

const linkClass =
  "type-label font-normal normal-case tracking-normal underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const ctaClass =
  "type-label inline-flex min-h-11 items-center justify-center rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-on-tint transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

/**
 * Custom 404 — IDE editor pane + FloorGhostDuo beside it (above on mobile).
 */
export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out">
      <div className="relative z-10 mx-auto flex max-w-[960px] flex-col items-center gap-10 lg:flex-row lg:items-end lg:justify-center lg:gap-12">
        {/* Ghosts above editor on mobile; beside (left) on lg+. Eyes use powder fill. */}
        <div
          className="flex shrink-0 justify-center text-foreground"
          style={{ ["--floor-ghost-eye" as string]: "var(--background)" }}
        >
          <FloorGhostDuo />
        </div>

        <div className="flex w-full max-w-[560px] flex-col gap-6">
          <div>
            {/* TEST COPY */}
            <h1 className="type-heading text-balance">{notFoundPage.h1}</h1>
            {/* TEST COPY */}
            <p className="type-body mt-3 text-foreground">{notFoundPage.body}</p>
          </div>

          <section
            aria-label={notFoundPage.editorAria}
            className="border-border-ide w-full overflow-hidden rounded-[4px] border bg-background"
          >
            <div className="border-border-ide flex items-center gap-2 border-b px-3 py-2">
              <span
                className="font-jetbrains rounded-[4px] border border-border-ide px-2 py-0.5 text-xs tracking-wide text-foreground"
                aria-hidden="true"
              >
                {notFoundPage.tabLabel}
              </span>
            </div>
            <NotFoundRoute />
          </section>

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
        </div>
      </div>
    </main>
  );
}
