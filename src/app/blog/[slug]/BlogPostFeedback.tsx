"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

const RATINGS = ["Good", "Fine", "Boring"] as const;
type Rating = (typeof RATINGS)[number];

const RATING_EVENT = "todo-blog-rate";

const controlClass =
  "inline-flex cursor-pointer items-center justify-center rounded-[4px] border border-current px-3 py-1.5 font-jetbrains text-xs font-bold tracking-wider uppercase transition-[opacity,color,background-color] duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

function storageKey(slug: string) {
  return `todo-blog-rate:${slug}`;
}

function canonicalPostUrl(slug: string) {
  return new URL(`/blog/${slug}`, window.location.origin).toString();
}

function isRating(value: string | null): value is Rating {
  return RATINGS.includes(value as Rating);
}

function subscribeRating(callback: () => void) {
  window.addEventListener(RATING_EVENT, callback);
  window.addEventListener("storage", callback);
  queueMicrotask(callback);
  return () => {
    window.removeEventListener(RATING_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readRating(slug: string): Rating | null {
  try {
    const stored = window.localStorage.getItem(storageKey(slug));
    return isRating(stored) ? stored : null;
  } catch {
    return null;
  }
}

function canNativeShare() {
  return typeof navigator.share === "function";
}

async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("clipboard timeout")), 800);
        }),
      ]);
      return;
    }
  } catch {
    // Permissions, insecure context, or a hung Clipboard API — use the fallback.
  }

  const input = document.createElement("input");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export function BlogPostFeedback({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const statusId = useId();
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number>(0);
  const rating = useSyncExternalStore(
    subscribeRating,
    () => readRating(slug),
    () => null,
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(copiedTimer.current);
    };
  }, []);

  const copyLink = useCallback(async () => {
    const url = canonicalPostUrl(slug);
    try {
      await writeClipboard(url);
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Leave the control as Copy link if both clipboard paths fail.
    }
  }, [slug]);

  const share = useCallback(async () => {
    const url = canonicalPostUrl(slug);
    if (canNativeShare()) {
      try {
        await navigator.share({ title, url, text: title });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }
    await copyLink();
  }, [copyLink, slug, title]);

  const vote = useCallback(
    (next: Rating) => {
      if (readRating(slug)) {
        return;
      }
      try {
        window.localStorage.setItem(storageKey(slug), next);
      } catch {
        // Private mode or quota — still lock this session via the event.
      }
      window.dispatchEvent(new Event(RATING_EVENT));
    },
    [slug],
  );

  return (
    <div id="blog-post-feedback" className="mt-12 border-t border-border-ide pt-8">
      <section aria-labelledby={`${statusId}-share`}>
        <h2
          id={`${statusId}-share`}
          className="font-jetbrains text-sm font-bold"
        >
          Share
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            className={controlClass}
            onClick={() => {
              void copyLink();
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            className={controlClass}
            onClick={() => {
              void share();
            }}
          >
            Share
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? "Copied" : ""}
        </p>
      </section>

      <section className="mt-8" aria-labelledby={`${statusId}-rate`}>
        <h2
          id={`${statusId}-rate`}
          className="font-jetbrains text-sm font-bold"
        >
          Rate this note
        </h2>
        {rating ? (
          <p className="mt-3 font-jetbrains text-sm" aria-live="polite">
            Thanks — that&apos;s noted.
          </p>
        ) : (
          <div
            className="mt-3 flex flex-wrap gap-3"
            role="group"
            aria-label="Good, Fine, or Boring"
          >
            {RATINGS.map((option) => (
              <button
                key={option}
                type="button"
                className={controlClass}
                onClick={() => vote(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
