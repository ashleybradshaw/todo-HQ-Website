import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Helix-style double-orbit spinner (LDRS-inspired, owned CSS — no ldrs package).
 * Decorative; parent region provides the accessible name.
 */
export function HelixSpinner({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn("helix-spinner text-foreground", className)}
      style={style}
      aria-hidden="true"
    >
      <span className="helix-spinner__track">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className="helix-spinner__slice" />
        ))}
      </span>
    </span>
  );
}
