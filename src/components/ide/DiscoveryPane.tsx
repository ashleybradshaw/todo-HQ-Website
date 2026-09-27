import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";
import { homePage } from "@/content/pages/home";

const bookClass =
  "font-jetbrains inline-flex h-11 w-full min-h-11 shrink-0 items-center justify-center rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs text-on-tint transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none sm:w-[11.75rem]";

const mailtoClass =
  "text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

const { discovery } = homePage;
const keys = discovery.codeKeys;

export function DiscoveryPane() {
  return (
    <div className="font-jetbrains flex flex-col gap-6 px-4 py-4 text-xs leading-5 lg:text-sm lg:leading-6">
      <div className="space-y-1">
        <p className="text-syn-comment italic">{discovery.fileComment}</p>
        <p className="text-syn-keyword font-medium">{discovery.codeExport}</p>
        <p className="text-syn-property pl-4">{"coffee: {"}</p>
        <p className="pl-8">
          <span className="text-syn-property">{keys.length}: </span>
          <span className="text-syn-string font-medium">
            {`'${discovery.coffee.length}'`}
          </span>
          ,
        </p>
        <p className="pl-8">
          <span className="text-syn-property">{keys.vibe}: </span>
          <span className="text-syn-string font-medium">
            {`"${discovery.coffee.vibe}"`}
          </span>
          ,
        </p>
        <p className="text-syn-property pl-4">{"},"}</p>
        <p className="text-syn-property pl-4">{"hardTalk: {"}</p>
        <p className="pl-8">
          <span className="text-syn-property">{keys.length}: </span>
          <span className="text-syn-string font-medium">
            {`'${discovery.hardTalk.length}'`}
          </span>
          ,
        </p>
        <p className="pl-8">
          <span className="text-syn-property">{keys.vibe}: </span>
          <span className="text-syn-string font-medium">
            {`"${discovery.hardTalk.vibe}"`}
          </span>
          ,
        </p>
        <p className="text-syn-property pl-4">{"},"}</p>
        <p className="pl-4">
          <span className="text-syn-property">{keys.nda}: </span>
          <span className="text-syn-string font-medium">true</span>,
        </p>
        <p className="pl-4">
          <span className="text-syn-property">{keys.email}: </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={`${mailtoClass} text-accent-swap`}
          >
            {`"${CONTACT_EMAIL}"`}
          </a>
          ,
        </p>
        <p className="text-syn-keyword font-medium">{"};"}</p>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-ide pt-4">
        <h2 className="text-syn-keyword text-sm font-medium lg:text-base">
          {discovery.heading}
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-syn-keyword text-xs font-medium">
              {discovery.coffee.cardTitle}
            </p>
            <p className="text-syn-comment mt-0.5 text-[10px] lg:text-xs">
              {discovery.coffee.cardSub}
            </p>
          </div>
          <Link href="/book?type=coffee" className={bookClass}>
            {discovery.coffee.cta}
          </Link>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-syn-keyword text-xs font-medium">
              {discovery.hardTalk.cardTitle}
            </p>
            <p className="text-syn-comment mt-0.5 text-[10px] lg:text-xs">
              {discovery.hardTalk.cardSub}
            </p>
          </div>
          <Link href="/book?type=hard-talk" className={bookClass}>
            {discovery.hardTalk.cta}
          </Link>
        </div>

        <p className="text-syn-property">{discovery.nda}</p>

        {discovery.reply ? (
          <p className="text-syn-comment" data-discovery-reply="">
            {discovery.reply}
          </p>
        ) : null}

        <p>
          <Link
            href={discovery.briefLink.href}
            className="text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none"
          >
            {discovery.briefLink.label}
          </Link>
        </p>
      </div>
    </div>
  );
}
