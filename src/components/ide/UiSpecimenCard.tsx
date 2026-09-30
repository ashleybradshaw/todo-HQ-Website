import Link from "next/link";
import { homePage } from "@/content/pages/home";
import { HOME_FRAME } from "@/components/ide/homeFrame";

const SWATCHES = [
  "--foreground",
  "--bg-canvas",
  "--brand-logo",
  "--syn-string",
  "--syn-number",
  "--blog-cat-agents",
] as const;

const buttonClass =
  "inline-flex min-h-11 w-fit items-center justify-center rounded-[4px] border border-transparent bg-foreground px-4 font-jetbrains text-xs font-bold tracking-wider text-bg-canvas uppercase transition-[background-color,border-color,color] duration-[400ms] ease-in-out hover:bg-[color-mix(in_srgb,var(--foreground)_90%,var(--bg-canvas))] focus-visible:ring-[3px] focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-bg-canvas focus-visible:outline-none";

/** Token specimen — follows Spray because every fill and type color is a token. */
function Specimen() {
  return (
    <div
      aria-hidden="true"
      className="border-border-ide bg-background flex flex-col gap-3 border p-4"
    >
      <div className="flex gap-1.5">
        {SWATCHES.map((token) => (
          <span
            key={token}
            className="border-border-ide size-8 border"
            style={{ backgroundColor: `var(${token})` }}
          />
        ))}
      </div>
      <p className="font-unbounded text-foreground text-3xl leading-none font-bold">
        Aa
      </p>
      <p className="font-jetbrains text-syn-body text-xs">
        const factory = &quot;ship&quot;;
      </p>
    </div>
  );
}

/** Blog-card entrance to /ui. Sits under the IDE, not inside it. */
export function UiSpecimenCard() {
  const { uiCard } = homePage;

  return (
    <section className={`${HOME_FRAME} pb-16`}>
      <article className="blog-note-link border-border-ide grid max-w-3xl grid-cols-1 gap-5 border p-4 sm:p-5 md:grid-cols-[16rem_1fr] md:items-center">
        <Specimen />
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className="type-subhead tracking-tight">{uiCard.title}</h2>
          <p className="type-body-sm text-balance">{uiCard.sub}</p>
          <Link href={uiCard.href} className={buttonClass}>
            {uiCard.cta}
          </Link>
        </div>
      </article>
    </section>
  );
}
