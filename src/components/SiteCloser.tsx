import { BookFaq } from "@/components/book/BookFaq";
import { SignalStrip } from "@/components/about/SignalStrip";
import { WorkTogetherBand } from "@/components/about/WorkTogetherBand";
import { ctas } from "@/content/pages/shared";

/**
 * Route matrix for shared FAQ / floor strip / Close.
 * Drive placement from here — pages pass `route`, not ad-hoc combinations.
 */
export const SITE_CLOSER_MATRIX = {
  about: { faq: true, faqCta: true, signalStrip: true, close: true },
  book: { faq: true, faqCta: false, signalStrip: false, close: false },
  work: { faq: false, faqCta: false, signalStrip: true, close: true },
  "work-detail": {
    faq: false,
    faqCta: false,
    signalStrip: false,
    close: true,
  },
  blog: { faq: false, faqCta: false, signalStrip: true, close: true },
  "blog-detail": {
    faq: false,
    faqCta: false,
    signalStrip: false,
    close: true,
  },
} as const;

export type SiteCloserRoute = keyof typeof SITE_CLOSER_MATRIX;

type SiteCloserProps = {
  route: SiteCloserRoute;
};

/**
 * Shared FAQ + proof strip + Close above the universal footer.
 * Omit on home / gateway / intro by not mounting this component.
 */
export function SiteCloser({ route }: SiteCloserProps) {
  const blocks = SITE_CLOSER_MATRIX[route];

  return (
    <>
      {blocks.faq ? (
        <BookFaq
          showCta={blocks.faqCta}
          ctaLabel={ctas.sendABrief}
          ctaHref={ctas.sendABriefHref}
        />
      ) : null}
      {blocks.signalStrip ? <SignalStrip /> : null}
      {blocks.close ? <WorkTogetherBand /> : null}
    </>
  );
}
