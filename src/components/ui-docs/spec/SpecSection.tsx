import type { ReactNode } from "react";
import { TypeComment } from "@/components/TypeComment";
import { cn } from "@/lib/cn";

type SpecSectionProps = {
  id: string;
  eyebrow: string;
  metric: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

/**
 * IDE-frame section: BlogIndex top bar + title/lede + specimen body.
 * Spacing: always mt-6 sm:mt-8 (header sits above; never first-child).
 */
export function SpecSection({
  id,
  eyebrow,
  metric,
  title,
  description,
  children,
  className,
}: SpecSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "border-border-ide mt-6 min-w-0 border sm:mt-8",
        className,
      )}
    >
      <div className="border-border-ide flex items-center justify-between border-b px-6 py-2">
        <TypeComment text={eyebrow} className="text-syn-keyword" />
        <p className="type-label text-syn-comment font-normal">{metric}</p>
      </div>
      <div className="min-w-0 p-6 md:p-10">
        <h2 className="type-title text-foreground min-w-0 break-words tracking-tight">
          {title}
        </h2>
        <p className="type-body text-foreground mt-3 max-w-[688px] min-w-0 break-words">
          {/* // TEST COPY */}
          {description}
        </p>
        <div className="mt-8 min-w-0">{children}</div>
      </div>
    </section>
  );
}
