import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

type BoneProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * Ghost block for mock UI — soft foreground wash, 4px radius.
 */
export function Bone({ className, style }: BoneProps) {
  return (
    <div
      className={cn(
        "rounded-[4px] bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)]",
        className,
      )}
      style={style}
      aria-hidden="true"
    />
  );
}
