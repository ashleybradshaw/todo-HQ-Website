import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Mirage-style stream spinner (LDRS-inspired, owned CSS — no ldrs package).
 * Decorative; parent region provides the accessible name.
 */
export function MirageSpinner({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn("mirage-spinner text-foreground", className)}
      style={style}
      aria-hidden="true"
    >
      <span className="mirage-spinner__track">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="mirage-spinner__dot" />
        ))}
      </span>
    </span>
  );
}
