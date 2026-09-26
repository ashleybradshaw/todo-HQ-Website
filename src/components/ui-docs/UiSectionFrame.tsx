"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type UiSectionFrameProps = {
  comment: string;
  example: ReactNode;
  code: string;
  className?: string;
};

export function UiSectionFrame({
  comment,
  example,
  code,
  className,
}: UiSectionFrameProps) {
  const [tab, setTab] = useState<"example" | "code">("example");

  return (
    <div className={cn("min-w-0", className)}>
      <p className="type-label text-syn-comment mb-4 max-w-full break-words whitespace-normal">
        {comment}
      </p>
      <div
        role="tablist"
        aria-label="Example or code"
        className="mb-3 flex gap-1 border-b border-border-ide"
      >
        {(["example", "code"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`ui-frame-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`ui-frame-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className={cn(
              "font-jetbrains cursor-pointer px-3 py-2 text-xs tracking-wider uppercase transition-opacity duration-[400ms] ease-in-out focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
              tab === id
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted hover:opacity-80",
            )}
            onClick={() => setTab(id)}
          >
            {id}
          </button>
        ))}
      </div>
      <div
        id="ui-frame-panel-example"
        role="tabpanel"
        aria-labelledby="ui-frame-tab-example"
        hidden={tab !== "example"}
        className="min-w-0"
      >
        {example}
      </div>
      <div
        id="ui-frame-panel-code"
        role="tabpanel"
        aria-labelledby="ui-frame-tab-code"
        hidden={tab !== "code"}
        className="min-w-0"
      >
        <pre className="overflow-x-auto rounded-[4px] border border-border-ide bg-foreground/5 p-3 text-xs leading-5 break-words whitespace-pre-wrap">
          <code className="font-jetbrains text-foreground">{code}</code>
        </pre>
      </div>
    </div>
  );
}
