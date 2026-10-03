import Link from "next/link";
import { cn } from "@/lib/cn";

export type BreadcrumbParent = {
  href: string;
  label: string;
};

export type BreadcrumbsProps = {
  parent: BreadcrumbParent;
  current: string;
  className?: string;
  id?: string;
};

const crumbLinkClass =
  "inline-flex min-h-6 items-center underline transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

/**
 * Shared trail: Parent → Current (JetBrains type-meta).
 * Indexes keep their own labels — no crumbs.
 */
export function Breadcrumbs({
  parent,
  current,
  className,
  id,
}: BreadcrumbsProps) {
  return (
    <nav
      id={id}
      aria-label="Breadcrumb"
      className={cn("type-meta min-w-0 max-w-full", className)}
    >
      <ol className="flex flex-nowrap items-baseline justify-center gap-x-2 gap-y-1 text-center sm:flex-wrap">
        <li className="shrink-0">
          <Link href={parent.href} className={crumbLinkClass}>
            {parent.label}
          </Link>
        </li>
        <li aria-hidden="true" className="shrink-0">
          →
        </li>
        <li
          className="min-w-0 truncate sm:overflow-visible sm:whitespace-normal sm:text-pretty"
          title={current}
          aria-current="page"
        >
          {current}
        </li>
      </ol>
    </nav>
  );
}
