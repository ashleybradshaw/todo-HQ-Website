import Link from "next/link";
import { FooterClock } from "@/components/FooterClock";

const GITHUB_URL = "https://github.com/todo-engineering";
const X_URL = "https://x.com/todo_engineering";

const linkClass =
  "underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

/** Static footer chrome + clock island (no pathname logic). */
export function SiteFooterBar() {
  return (
    <footer className="border-border-ide bg-bg-canvas text-foreground relative z-10 border-t transition-[background-color,color,border-color] duration-[400ms] ease-in-out">
      <div className="font-jetbrains flex flex-col gap-3 px-4 py-4 text-[10px] tracking-wide uppercase sm:px-6 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6 lg:gap-y-2 lg:text-xs">
        <p>© 2026 TODO DESIGN & ENGINEERING</p>
        <p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GITHUB
          </a>
          {" · "}
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            X
          </a>
        </p>
        <FooterClock />
        <Link href="/book" className={linkClass}>
          WORK TOGETHER
        </Link>
        <Link href="/privacy" className={linkClass}>
          HOW WE USE YOUR DATA – PRIVACY POLICY
        </Link>
      </div>
    </footer>
  );
}
