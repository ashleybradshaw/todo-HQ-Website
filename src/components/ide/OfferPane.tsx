import { StackIconRow } from "@/components/ide/StackIconRow";

export function OfferPane() {
  return (
    <div className="font-jetbrains flex flex-col gap-5 px-4 py-4 text-xs leading-5 lg:text-sm lg:leading-6">
      <p className="text-syn-comment italic">
        {"# offer.md — Soft sell · TEST COPY"}
      </p>

      <section aria-labelledby="offer-heading">
        <h2
          id="offer-heading"
          className="text-syn-keyword text-sm font-medium lg:text-base"
        >
          Our offer
        </h2>
        <p className="text-syn-string mt-2 font-medium">
          We take a magic moment — the thing that should feel inevitable — and
          turn it into a shipped product: landing, app, or both.
        </p>
      </section>

      <section aria-labelledby="how-heading">
        <h2
          id="how-heading"
          className="text-syn-keyword text-sm font-medium lg:text-base"
        >
          How we work
        </h2>
        <ol className="text-syn-property mt-2 list-decimal space-y-1.5 pl-5">
          <li>Find the moment worth building.</li>
          <li>Flat design → coded frontend (Figma / Cursor).</li>
          <li>Human gate, then ship (Vercel / stores).</li>
          <li>Backend + native when the product earns it.</li>
        </ol>
      </section>

      <section aria-labelledby="stack-heading">
        <h2
          id="stack-heading"
          className="text-syn-keyword mb-3 text-sm font-medium lg:text-base"
        >
          Stack
        </h2>
        <StackIconRow />
      </section>

      <section aria-labelledby="pipelines-heading">
        <h2
          id="pipelines-heading"
          className="text-syn-keyword text-sm font-medium lg:text-base"
        >
          Pipelines
        </h2>
        <div className="mt-2 space-y-1.5">
          <p className="text-syn-property">
            <span className="text-syn-bracket">{"`agiFlow`"}</span>
            {" — Brief → research agents → draft → human gate → ship."}
          </p>
          <p className="text-syn-property">
            <span className="text-syn-bracket">{"`lpPipeline`"}</span>
            {" — Offer → layout → copy pass → QA → launch."}
          </p>
        </div>
      </section>
    </div>
  );
}
