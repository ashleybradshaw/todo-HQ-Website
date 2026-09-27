/** Shared Quick note / Pre-brief soft-gate helpers. */

export const MIN_NAME_CHARS = 2;
export const MIN_MESSAGE_CHARS = 40;
export const MIN_BRIEF_WORDS = 3;
export const MAX_MESSAGE_CHARS = 1000;
export const MAX_BRIEF_CHARS = 1000;
export const MAX_ACCESS_NOTE_CHARS = 300;
export const MIN_PHONE_DIGITS = 7;
export const MAX_PHONE_DIGITS = 15;

/** Basic shape — not DNS. Good enough for mailto commitment. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Common mailbox / TLD typos → corrections (no library). */
const EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "yahooo.com": "yahoo.com",
  "icloud.co": "icloud.com",
};

export function isValidName(value: string) {
  return value.trim().length >= MIN_NAME_CHARS;
}

/**
 * Email format: needs @ and a dotted domain (e.g. name@company.com).
 * Empty fails — required fields use this after trim.
 */
export function isValidEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const at = trimmed.indexOf("@");
  if (at <= 0) return false;
  const domain = trimmed.slice(at + 1);
  if (!domain.includes(".")) return false;
  return EMAIL_SHAPE.test(trimmed);
}

/**
 * Optional phone. Empty is valid.
 * Allowed: digits, spaces, ( ) -, and a single leading +.
 * Digit count must be 7–15.
 */
export function isValidPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) return false;
  if ((trimmed.match(/\+/g) ?? []).length > 1) return false;
  if (trimmed.includes("+") && !trimmed.startsWith("+")) return false;
  const digits = trimmed.replace(/\D/g, "");
  return (
    digits.length >= MIN_PHONE_DIGITS && digits.length <= MAX_PHONE_DIGITS
  );
}

/**
 * Suggest a corrected address for common domain typos.
 * Returns null when no suggestion, or when it would match the input.
 */
export function suggestEmail(value: string): string | null {
  const trimmed = value.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return null;
  const local = trimmed.slice(0, at);
  if (!local) return null;
  const domainRaw = trimmed.slice(at + 1);
  if (!domainRaw) return null;

  const domain = domainRaw.toLowerCase();
  let fixed = EMAIL_DOMAIN_TYPOS[domain] ?? domain;

  if (fixed === domain) {
    if (fixed.endsWith(".con")) fixed = `${fixed.slice(0, -4)}.com`;
    else if (fixed.endsWith(".cmo")) fixed = `${fixed.slice(0, -4)}.com`;
    else if (fixed.endsWith(".co.ukk")) fixed = `${fixed.slice(0, -7)}.co.uk`;
  }

  if (fixed === domain) return null;
  const suggestion = `${local}@${fixed}`;
  if (suggestion.toLowerCase() === trimmed.toLowerCase()) return null;
  return suggestion;
}

export function isValidMessage(value: string) {
  return value.trim().length >= MIN_MESSAGE_CHARS;
}

/** Pre-brief step 3 — at least three words. */
export function isValidBrief(value: string) {
  return (
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean).length >= MIN_BRIEF_WORDS
  );
}

/** Soft unlock: still focusable; visual quiet until the prior gate opens. */
export const fieldQuietClass =
  "text-muted transition-[color,opacity] duration-[400ms] ease-in-out";
export const fieldOpenClass =
  "text-foreground transition-[color,opacity] duration-[400ms] ease-in-out";

export const fieldErrorClass =
  "book-field-error-flash font-jetbrains mt-1 text-xs tracking-wide";

/** Helper / hint copy under labels — sentence case (not type-label / uppercase). */
export const fieldHelperClass =
  "font-jetbrains text-xs font-normal leading-4 tracking-normal text-syn-comment normal-case";

/** Scroll clearance under the fixed site header (`--site-header-offset`). */
export const scrollMtHeaderClass = "scroll-mt-header";

/** Focus a step/form heading and scroll it into view (honours reduced motion). */
export function focusHeading(el: HTMLElement | null) {
  if (!el) return;
  el.focus({ preventScroll: true });
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
