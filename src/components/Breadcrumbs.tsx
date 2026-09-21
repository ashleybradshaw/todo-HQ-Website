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
  "underline transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

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
      className={cn("type-meta", className)}
    >
      <ol className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <li>
          <Link href={parent.href} className={crumbLinkClass}>
            {parent.label}
          </Link>
        </li>
        <li aria-hidden="true">→</li>
        <li className="min-w-0 text-pretty" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  );
}
