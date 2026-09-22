import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PageShellVariant = "index" | "essay" | "essayMedia";

export type PageShellProps = {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
  /**
   * index — max-w-[1336px] (/work, /blog index)
   * essay — outer max-w-[800px], copy max-w-[688px] (/about, /book, blog article chrome)
   * essayMedia — outer max-w-[1336px], copy max-w-[688px], media track full width (/work/[slug])
   */
  variant?: PageShellVariant;
  /** @deprecated Prefer variant. true → index. */
  wide?: boolean;
  /** display = Unbounded type-display; mono = JetBrains case title */
  titleStyle?: "display" | "mono";
  /** Overrides default title token/alignment (e.g. Essay drill: type-title + center). */
  titleClassName?: string;
  /** Extra class on the eyebrow label (e.g. text-center for Essay soft-align). */
  eyebrowClassName?: string;
  overflow?: "x-hidden" | "hidden";
  background?: ReactNode;
  /** Caps eyebrow, title, and lede. Defaults by variant. */
  headerClassName?: string;
  /** Optional trail above the eyebrow/title (Work/Blog detail). */
  breadcrumbs?: ReactNode;
  /** Extra class on the lede wrapper. */
  ledeClassName?: string;
};

function resolveVariant(
  variant: PageShellVariant | undefined,
  wide: boolean,
): PageShellVariant {
  if (variant) return variant;
  return wide ? "index" : "essay";
}

const OUTER_MAX: Record<PageShellVariant, string> = {
  index: "max-w-[1336px]",
  essay: "max-w-[800px]",
  essayMedia: "max-w-[1336px]",
};

const COPY_MAX: Record<PageShellVariant, string | undefined> = {
  index: undefined,
  essay: "w-full max-w-[688px] mx-auto",
  essayMedia: "w-full max-w-[688px] mx-auto",
};

export function PageShell({
  eyebrow,
  title,
  lede,
  children,
  variant,
  wide = false,
  titleStyle = "display",
  titleClassName,
  eyebrowClassName,
  overflow = "x-hidden",
  background,
  headerClassName,
  breadcrumbs,
  ledeClassName,
}: PageShellProps) {
  const shell = resolveVariant(variant, wide);
  const copyMax = COPY_MAX[shell];

  return (
    <main
      className={cn(
        "relative min-h-screen bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out",
        overflow === "hidden" ? "overflow-hidden" : "overflow-x-hidden",
      )}
    >
      {background}
      <div className={cn("relative z-10 mx-auto", OUTER_MAX[shell])}>
        <div className={cn(copyMax, headerClassName)}>
          {breadcrumbs}
          {eyebrow ? (
            <p
              className={cn(
                "type-label",
                breadcrumbs ? "mt-6" : undefined,
                eyebrowClassName,
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          {eyebrow ? <div className="border-border-ide mt-3 border-t" /> : null}
          <h1
            className={cn(
              breadcrumbs && !eyebrow ? "mt-6" : "mt-4",
              titleStyle === "mono"
                ? "type-label tracking-[-0.01em]"
                : "type-display tracking-tight",
              titleClassName,
            )}
          >
            {title}
          </h1>
          {lede ? (
            <div
              className={cn(
                "type-body mt-6",
                ledeClassName,
              )}
            >
              {lede}
            </div>
          ) : null}
        </div>
        {shell === "essay" && copyMax ? (
          <div className={copyMax}>{children}</div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
