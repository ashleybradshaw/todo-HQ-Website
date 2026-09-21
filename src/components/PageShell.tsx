import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PageShellProps = {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
  /** Work index and project detail ≈1336; About / Book ≈800 */
  wide?: boolean;
  /** display = Unbounded marketing H1; mono = jetbrains case title */
  titleStyle?: "display" | "mono";
  overflow?: "x-hidden" | "hidden";
  background?: ReactNode;
  /** Caps eyebrow, title, and lede. Children keep the shell width. */
  headerClassName?: string;
};

export function PageShell({
  eyebrow,
  title,
  lede,
  children,
  wide = false,
  titleStyle = "display",
  overflow = "x-hidden",
  background,
  headerClassName,
}: PageShellProps) {
  return (
    <main
      className={cn(
        "relative min-h-screen bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out",
        overflow === "hidden" ? "overflow-hidden" : "overflow-x-hidden",
      )}
    >
      {background}
      <div
        className={cn(
          "relative z-10 mx-auto",
          wide ? "max-w-[1336px]" : "max-w-[800px]",
        )}
      >
        <div className={cn(headerClassName)}>
          {eyebrow ? (
            <p className="font-jetbrains text-xs font-bold tracking-wide uppercase">
              {eyebrow}
            </p>
          ) : null}
          {eyebrow ? <div className="border-border-ide mt-3 border-t" /> : null}
          <h1
            className={cn(
              titleStyle === "mono"
                ? "font-jetbrains mt-4 text-[28px] leading-9 font-bold tracking-[-0.01em] uppercase"
                : "font-unbounded mt-4 text-4xl font-bold tracking-tight md:text-6xl",
            )}
          >
            {title}
          </h1>
          {lede ? (
            <div className="mt-6 text-lg leading-relaxed [&_p]:max-w-2xl">
              {lede}
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </main>
  );
}
