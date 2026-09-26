"use client";

import { useState } from "react";
import { TypeComment } from "@/components/TypeComment";
import { bookPage } from "@/content/pages/book";
import { cn } from "@/lib/cn";

const { faq } = bookPage;

const jumpClass =
  "font-jetbrains inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold tracking-wider text-on-tint transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

type BookFaqProps = {
  ctaLabel?: string;
  ctaHref?: string;
  /** Off on /book — form is already above. Work/About keep a booking CTA. */
  showCta?: boolean;
};

export function BookFaq({
  ctaLabel = faq.jumpLabel,
  ctaHref = faq.jumpHref,
  showCta = true,
}: BookFaqProps) {
  const [openId, setOpenId] = useState<string | null>(faq.items[0]?.id ?? null);

  return (
    <section
      id="faq"
      className="mt-16 scroll-mt-28 border-t border-border-ide pt-12"
      aria-labelledby="book-faq-heading"
    >
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] sm:items-start sm:gap-8">
        <div className="min-w-0">
          <TypeComment text={faq.eyebrow} className="text-syn-comment" />
          <h2
            id="book-faq-heading"
            className="type-heading mt-3 text-balance tracking-tight"
          >
            {faq.title}
          </h2>
          {showCta ? (
            <a href={ctaHref} className={cn(jumpClass, "mt-8")}>
              {ctaLabel}
            </a>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          {faq.items.map((item) => {
            const open = openId === item.id;
            const panelId = `book-faq-panel-${item.id}`;
            const buttonId = `book-faq-button-${item.id}`;

            return (
              <div
                key={item.id}
                className="rounded-[4px] border border-border-ide"
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  className="font-jetbrains flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left text-sm font-bold tracking-wide transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
                  onClick={() =>
                    setOpenId((current) => (current === item.id ? null : item.id))
                  }
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 inline-block size-0 shrink-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-current transition-transform duration-[400ms] ease-in-out",
                      open ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!open}
                  className="border-t border-border-ide px-4 py-3"
                >
                  <p className="type-body-sm">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
