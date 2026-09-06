import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type GridFrameProps = {
  children: ReactNode;
  className?: string;
};

export function GridFrame({ children, className }: GridFrameProps) {
  return (
    <div
      className={cn(
        "relative mx-auto min-h-full w-full max-w-[1440px]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[50px] w-px bg-[repeating-linear-gradient(to_bottom,var(--grid-line)_0_4px,transparent_4px_10px)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[143px] w-px bg-[repeating-linear-gradient(to_bottom,var(--grid-line)_0_4px,transparent_4px_10px)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[50px] w-px bg-[repeating-linear-gradient(to_bottom,var(--grid-line)_0_4px,transparent_4px_10px)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[143px] w-px bg-[repeating-linear-gradient(to_bottom,var(--grid-line)_0_4px,transparent_4px_10px)]"
      />
      <div className="relative z-10 flex min-h-full flex-col">{children}</div>
    </div>
  );
}
