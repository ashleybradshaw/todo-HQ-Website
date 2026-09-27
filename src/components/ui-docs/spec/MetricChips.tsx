import { cn } from "@/lib/cn";

type MetricChipsProps = {
  /** First cell — bold name. */
  name: string;
  /** Remaining cells — size 16, lead 24, etc. */
  values: readonly string[];
  className?: string;
};

/**
 * Shared-edge chip row: outer radius only, internal hairlines.
 */
export function MetricChips({ name, values, className }: MetricChipsProps) {
  const cells = [name, ...values];
  return (
    <div
      className={cn(
        "border-border-ide inline-flex max-w-full min-w-0 flex-wrap overflow-hidden rounded-[4px] border",
        className,
      )}
    >
      {cells.map((cell, index) => (
        <span
          key={`${cell}-${index}`}
          className={cn(
            "type-label border-border-ide px-2 py-1 text-[10px] tracking-wider sm:text-[11px]",
            index < cells.length - 1 && "border-r",
            index === 0
              ? "font-bold text-foreground"
              : "font-normal text-muted",
          )}
        >
          {cell}
        </span>
      ))}
    </div>
  );
}
