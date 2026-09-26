/**
 * CSS custom-property names only — values always read live from the DOM.
 * // TEST COPY
 */

export type TokenGroup =
  | "core"
  | "status"
  | "syntax"
  | "blog"
  | "derived"
  | "selection";

export type TokenEntry = {
  /** Human label shown in the swatch grid. */
  name: string;
  /** Primary CSS custom property without `var()` (drives the swatch fill). */
  token: string;
  /** Extra tokens listed on the same card (same colour role). */
  alsoTokens?: readonly string[];
  group: TokenGroup;
  /** Optional note (e.g. status naming gap). */
  note?: string;
};

export const TOKEN_REGISTRY: readonly TokenEntry[] = [
  {
    name: "Powder / canvas",
    token: "--bg-canvas",
    alsoTokens: ["--background"],
    group: "core",
  },
  { name: "Electric / text", token: "--foreground", group: "core" },
  { name: "Logo", token: "--brand-logo", group: "core" },
  { name: "Muted text", token: "--text-muted", group: "core" },
  { name: "Text on tint", token: "--text-on-tint", group: "core" },
  {
    name: "Status online (uses --syn-string)",
    token: "--syn-string",
    group: "status",
    note: "Telemetry ONLINE tone — no dedicated --status-online token.",
  },
  {
    name: "Status building (uses --foreground)",
    token: "--foreground",
    group: "status",
    note: "Telemetry BUILDING tone — no dedicated --status-building token.",
  },
  {
    name: "Status pending",
    token: "--status-pending",
    group: "status",
    note: "Never sprayed — stays brand amber.",
  },
  { name: "Syn keyword", token: "--syn-keyword", group: "syntax" },
  { name: "Syn property", token: "--syn-property", group: "syntax" },
  { name: "Syn string", token: "--syn-string", group: "syntax" },
  { name: "Syn number", token: "--syn-number", group: "syntax" },
  { name: "Syn comment", token: "--syn-comment", group: "syntax" },
  { name: "Syn bracket", token: "--syn-bracket", group: "syntax" },
  { name: "Blog · projects", token: "--blog-cat-projects", group: "blog" },
  { name: "Blog · leaps", token: "--blog-cat-leaps", group: "blog" },
  { name: "Blog · agents", token: "--blog-cat-agents", group: "blog" },
  { name: "Blog · deep cuts", token: "--blog-cat-deep-cuts", group: "blog" },
  {
    name: "Border IDE (15% text)",
    token: "--border-ide",
    group: "derived",
  },
  {
    name: "Page bridge (32/68)",
    token: "--page-bridge",
    group: "derived",
  },
  {
    name: "Media elev shadow",
    token: "--media-elev-shadow",
    group: "derived",
  },
  {
    name: "Media elev bloom",
    token: "--media-elev-bloom",
    group: "derived",
  },
  { name: "Selection bg", token: "--selection-bg", group: "selection" },
  { name: "Selection fg", token: "--selection-fg", group: "selection" },
] as const;

/** Type classes defined in globals.css — metrics read live from specimens. */
export const TYPE_CLASSES = [
  "type-display",
  "type-title",
  "type-heading",
  "type-subhead",
  "type-body",
  "type-prose",
  "type-body-sm",
  "type-meta",
  "type-caption",
  "type-label",
  "type-code",
] as const;

export type TypeClassName = (typeof TYPE_CLASSES)[number];

/** Common Tailwind spacing steps used on factory pages — no CSS spacing tokens. */
export const SPACING_STEPS = [
  { token: "1", rem: "0.25rem", px: "4px" },
  { token: "2", rem: "0.5rem", px: "8px" },
  { token: "3", rem: "0.75rem", px: "12px" },
  { token: "4", rem: "1rem", px: "16px" },
  { token: "6", rem: "1.5rem", px: "24px" },
  { token: "8", rem: "2rem", px: "32px" },
  { token: "12", rem: "3rem", px: "48px" },
  { token: "16", rem: "4rem", px: "64px" },
] as const;

export const UI_DOCS_VERSION = "v1.0";
export const UI_DOCS_UPDATED = "26 Sep 2026";
