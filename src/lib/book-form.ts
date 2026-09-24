/** Shared Quick note / Pre-brief soft-gate helpers. */

export const MIN_NAME_CHARS = 2;
export const MIN_MESSAGE_CHARS = 40;
export const MIN_BRIEF_WORDS = 3;

/** Basic shape — not DNS. Good enough for mailto commitment. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidName(value: string) {
  return value.trim().length >= MIN_NAME_CHARS;
}

export function isValidEmail(value: string) {
  return EMAIL_SHAPE.test(value.trim());
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
  "opacity-45 transition-opacity duration-[400ms] ease-in-out";
export const fieldOpenClass =
  "opacity-100 transition-opacity duration-[400ms] ease-in-out";

export const fieldErrorClass =
  "book-field-error-flash font-jetbrains mt-1 text-xs tracking-wide";
