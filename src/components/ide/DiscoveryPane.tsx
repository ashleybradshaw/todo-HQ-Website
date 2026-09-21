import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

const bookClass =
  "font-jetbrains inline-flex h-11 w-full min-h-11 shrink-0 items-center justify-center rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs text-syn-keyword transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] sm:w-[11.75rem]";

const mailtoClass =
  "text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

export function DiscoveryPane() {
  return (
    <div className="font-jetbrains flex flex-col gap-6 px-4 py-4 text-xs leading-5 lg:text-sm lg:leading-6">
      <div className="space-y-1">
        <p className="text-syn-comment italic">
          {"// discovery.ts — Soft sell · TEST COPY"}
        </p>
        <p className="text-syn-keyword/80">{"export const discovery = {"}</p>
        <p className="text-syn-property/70 pl-4">{"coffee: {"}</p>
        <p className="pl-8">
          <span className="text-syn-property/70">length: </span>
          <span className="text-syn-string font-medium">{'"15 min"'}</span>,
        </p>
        <p className="pl-8">
          <span className="text-syn-property/70">vibe: </span>
          <span className="text-syn-string font-medium">
            {'"Coffee call — chemistry, is this a fit, no deck."'}
          </span>
          ,
        </p>
        <p className="text-syn-property/70 pl-4">{"},"}</p>
        <p className="text-syn-property/70 pl-4">{"hardTalk: {"}</p>
        <p className="pl-8">
          <span className="text-syn-property/70">length: </span>
          <span className="text-syn-string font-medium">{'"60 min"'}</span>,
        </p>
        <p className="pl-8">
          <span className="text-syn-property/70">vibe: </span>
          <span className="text-syn-string font-medium">
            {'"Hour hard talk — dig into the real issue, scope the fix."'}
          </span>
          ,
        </p>
        <p className="text-syn-property/70 pl-4">{"},"}</p>
        <p className="pl-4">
          <span className="text-syn-property/70">email: </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={`${mailtoClass} discovery-mailto-nudge`}
          >
            {`"${CONTACT_EMAIL}"`}
          </a>
          ,
        </p>
        <p className="text-syn-keyword/80">{"};"}</p>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-ide pt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-syn-keyword text-xs font-medium">Coffee · 15 min</p>
            <p className="text-syn-comment mt-0.5 text-[10px] lg:text-xs">
              Chemistry, is this a fit, no deck.
            </p>
          </div>
          <Link href="/book?type=coffee" className={bookClass}>
            Book coffee talk →
          </Link>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-syn-keyword text-xs font-medium">
              Hard talk · 60 min
            </p>
            <p className="text-syn-comment mt-0.5 text-[10px] lg:text-xs">
              Dig into the real issue, scope the fix.
            </p>
          </div>
          <Link href="/book?type=hard-talk" className={bookClass}>
            Book hard talk →
          </Link>
        </div>
      </div>
    </div>
  );
}
