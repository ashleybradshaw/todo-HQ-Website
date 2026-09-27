import { StackIconRow } from "@/components/ide/StackIconRow";
import { homePage } from "@/content/pages/home";

const { offer } = homePage;

function pipelineParts(line: string) {
  const sep = " — ";
  const index = line.indexOf(sep);
  if (index < 0) {
    return { label: line, rest: "" };
  }
  return {
    label: line.slice(0, index),
    rest: line.slice(index),
  };
}

export function OfferPane() {
  const agi = pipelineParts(offer.agiFlowLine);
  const lp = pipelineParts(offer.lpPipelineLine);

  return (
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

      <section aria-labelledby="pipelines-heading">
        <h2
          id="pipelines-heading"
          className="text-syn-keyword text-sm font-medium lg:text-base"
        >
          {offer.pipelinesHeading}
        </h2>
        <div className="mt-2 space-y-1.5">
          <p className="text-syn-property">
            <span className="text-syn-bracket">{agi.label}</span>
            {agi.rest}
          </p>
          <p className="text-syn-property">
            <span className="text-syn-bracket">{lp.label}</span>
            {lp.rest}
          </p>
        </div>
      </section>
    </div>
  );
}
