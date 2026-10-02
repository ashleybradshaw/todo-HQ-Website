import type { ReactNode } from "react";
import { TypeComment } from "@/components/TypeComment";
import { cn } from "@/lib/cn";

export type PageShellVariant = "index" | "essay" | "essayMedia";

export type PageShellProps = {
  eyebrow?: string;
  title: ReactNode;
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
  /** Sits in the title column, above the h1 (case-study logo). */
  beforeTitle?: ReactNode;
  /** Second column beside the title at lg (case-study spec). Stacks under it below lg. */
  aside?: ReactNode;
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
  beforeTitle,
  aside,
  ledeClassName,
}: PageShellProps) {
  const shell = resolveVariant(variant, wide);
  const copyMax = COPY_MAX[shell];
  const header = (
    <>
      {breadcrumbs}
      {eyebrow ? (
        <TypeComment
          text={eyebrow}
          className={cn(breadcrumbs ? "mt-6" : undefined, eyebrowClassName)}
        />
      ) : null}
      {eyebrow ? <div className="border-border-ide mt-3 border-t" /> : null}
      {beforeTitle}
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
        <div className={cn("type-body mt-6", ledeClassName)}>{lede}</div>
      ) : null}
    </>
  );

  return (
    <main
      id="main"
      tabIndex={-1}
      className={cn(
        "relative min-h-screen bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out",
        overflow === "hidden" ? "overflow-hidden" : "overflow-x-hidden",
      )}
    >
      {background}
      <div className={cn("relative z-10 mx-auto", OUTER_MAX[shell])}>
        {aside ? (
          <div
            className={cn(
              "lg:border-border-ide lg:grid lg:grid-cols-[minmax(0,688px)_minmax(0,1fr)] lg:items-start lg:gap-10 lg:border-b",
              headerClassName,
            )}
          >
            <div className="min-w-0 max-w-[688px]">{header}</div>
            <div className="border-border-ide mt-8 border-t pt-2 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              {aside}
            </div>
          </div>
        ) : (
          <div className={cn(copyMax, headerClassName)}>{header}</div>
        )}
        {shell === "essay" && copyMax ? (
          <div className={copyMax}>{children}</div>
        ) : (
          children
        )}
      </div>
    </main>
  );
}
