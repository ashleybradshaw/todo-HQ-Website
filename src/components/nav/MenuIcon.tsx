import { cn } from "@/lib/cn";

/** 2-bar CSS morph → X. 24px glyph; open meets at mid-Y then ±45°. */
export function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="size-6 overflow-visible"
    >
      <path
        d="M5 8 H19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        className={cn(
          "origin-center transition-transform duration-200 ease-out motion-reduce:transition-none",
          open && "translate-y-1 rotate-45",
        )}
        style={{ transformBox: "fill-box" }}
      />
      <path
        d="M5 16 H19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        className={cn(
          "origin-center transition-transform duration-200 ease-out motion-reduce:transition-none",
          open && "-translate-y-1 -rotate-45",
        )}
        style={{ transformBox: "fill-box" }}
      />
    </svg>
  );
}
