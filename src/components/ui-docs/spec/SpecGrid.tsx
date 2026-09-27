import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SpecGridProps = {
  children: ReactNode;
  /** lg column count — default 3; Colour uses 4. */
  cols?: 3 | 4;
  className?: string;
};

/**
 * Responsive specimen grid: 1 → 2 → 3|4.
 */
export function SpecGrid({ children, cols = 3, className }: SpecGridProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2",
        cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
