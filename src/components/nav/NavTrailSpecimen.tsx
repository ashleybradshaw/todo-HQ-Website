import Link from "next/link";

/**
 * Static look of the nav crumb and progress rule.
 * Does not call setTrail, so the site nav on this page stays unchanged.
 */
export function NavTrailSpecimen() {
  return (
    <div
      data-nav-trail-specimen=""
      className="border-border-ide relative flex min-w-0 flex-wrap items-center gap-4 border px-4 py-3"
    >
      <nav
        aria-label="Specimen breadcrumb"
        className="font-jetbrains flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted"
      >
        <ol className="flex min-w-0 flex-wrap items-center gap-2">
          <li className="shrink-0">
            <Link
              href="/work"
              className="inline-flex min-h-6 items-center hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
            >
              Work
            </Link>
          </li>
          <li className="shrink-0" aria-hidden="true">
            →
          </li>
          <li className="min-w-0">Specimen</li>
        </ol>
      </nav>
      <div
        aria-hidden="true"
        className="bg-brand-logo pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left"
        style={{ transform: "scaleX(0.4)" }}
      />
    </div>
  );
}
