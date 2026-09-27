import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SpecBoxProps = {
  variant?: "master" | "variant";
  caption?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Specimen holder — dashed master or solid variant border.
 */
export function SpecBox({
  variant = "variant",
  caption,
  children,
  className,
}: SpecBoxProps) {
  return (
    <div
      className={cn(
        "border-border-ide relative min-w-0 rounded-[4px] border p-4",
        variant === "master" && "border-dashed",
        className,
      )}
    >
      {caption ? (
        <p className="type-label text-muted mb-3">{caption}</p>
      ) : null}
      {children}
    </div>
  );
}
