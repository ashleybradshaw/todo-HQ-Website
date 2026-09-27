import Link from "next/link";
import { StackIconRow } from "@/components/ide/StackIconRow";
import { IdePaneCollapse } from "@/components/ide/IdePaneCollapse";
import { homePage } from "@/content/pages/home";

const { offer } = homePage;

/** Approximate source-line count for the collapse label (structured pane). */
const OFFER_LINE_COUNT =
  2 +
  offer.services.length * 2 +
  offer.howWeWorkSteps.length +
  offer.stackGroups.length +
  4;

export function OfferPane() {
  return (
    <IdePaneCollapse lineCount={OFFER_LINE_COUNT}>
    <div className="font-jetbrains flex flex-col gap-5 px-4 py-4 text-xs leading-5 lg:text-sm lg:leading-6">
      <p className="text-syn-comment italic">{offer.fileComment}</p>

      <section aria-labelledby="offer-heading">
        <h2
          id="offer-heading"
          className="text-syn-keyword text-sm font-medium lg:text-base"
        >
          {offer.ourOfferHeading}
        </h2>
        <p className="text-syn-string mt-2 font-medium">{offer.ourOfferBody}</p>
      </section>

      <dl className="space-y-3">
        {offer.services.map((service) => (
          <div key={service.name}>
            <dt className="text-syn-keyword font-medium">{service.name}</dt>
            <dd className="text-syn-property mt-0.5">{service.line}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="how-heading">
        <h2
          id="how-heading"
          className="text-syn-keyword text-sm font-medium lg:text-base"
        >
          {offer.howWeWorkHeading}
        </h2>
        <ol className="text-syn-property mt-2 list-decimal space-y-1.5 pl-5">
          {offer.howWeWorkSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="stack-heading">
        <h2
          id="stack-heading"
          className="text-syn-keyword mb-3 text-sm font-medium lg:text-base"
        >
          {offer.stackHeading}
        </h2>
        <StackIconRow />
      </section>

      <section aria-labelledby="proof-heading">
        <h2
          id="proof-heading"
          className="text-syn-keyword text-sm font-medium lg:text-base"
        >
          {offer.proofHeading}
        </h2>
        <p className="text-syn-property mt-2">{offer.proofLine}</p>
      </section>

      <p>
        <Link
          href={offer.cta.href}
          className="text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
        >
          {offer.cta.label}
        </Link>
      </p>
    </div>
    </IdePaneCollapse>
  );
}
