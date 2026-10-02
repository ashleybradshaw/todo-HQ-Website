import type { ReactNode } from "react";
import { PageHero } from "@/components/PageHero";
import { cn } from "@/lib/cn";

export type PageShellVariant = "index" | "essay";

export type PageShellProps = {
  eyebrow?: string;
  title?: ReactNode;
  lede?: string;
  children?: ReactNode;
  /**
   * index — max-w-[1336px] (/work, /blog)
   * essay — max-w-[800px] (/about, /book, both detail pages)
   */
  variant?: PageShellVariant;
  /** @deprecated Prefer variant. true → index. */
  wide?: boolean;
  overflow?: "x-hidden" | "hidden";
  background?: ReactNode;
  /**
   * Essay only. True wraps children in the 688 copy column.
   * Detail pages set false so 752 media and 688 copy share the track.
   */
  constrainCopy?: boolean;
  /** Wraps the track so reading progress covers the page. */
  anchorId?: string;
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
};

export function PageShell({
  eyebrow,
  title,
  lede,
  children,
  variant,
  wide = false,
  overflow = "x-hidden",
  background,
  constrainCopy = true,
  anchorId,
}: PageShellProps) {
  const shell = resolveVariant(variant, wide);
  const showHero = Boolean(title) && Boolean(eyebrow) && lede != null;

  const body =
    shell === "essay" && constrainCopy ? (
      <div
        className={cn(
          "mx-auto w-full max-w-[688px] text-left",
          showHero && "mt-10",
        )}
      >
        {children}
      </div>
    ) : (
      <div className={showHero ? "mt-10" : undefined}>{children}</div>
    );

  return (
    <main
      id="main"
      tabIndex={-1}
      className={cn(
        "relative min-h-screen bg-background pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out",
        shell === "index" && "px-6",
        overflow === "hidden" ? "overflow-hidden" : "overflow-x-hidden",
      )}
    >
      {background}
      <div
        id={anchorId}
        className={cn(
          "relative z-10 mx-auto",
          OUTER_MAX[shell],
          shell === "essay" && "px-6",
        )}
      >
        {showHero ? (
          <PageHero eyebrow={eyebrow!} title={title!} lede={lede!} />
        ) : null}
        {body}
      </div>
    </main>
  );
}
