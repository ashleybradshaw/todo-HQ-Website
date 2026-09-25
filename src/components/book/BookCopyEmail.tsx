"use client";

import { useEffect, useId, useRef, useState } from "react";
import { bookPage } from "@/content/pages/book";
import { copyText } from "@/lib/book-links";
import { CONTACT_EMAIL } from "@/lib/site";

const mailtoClass =
  "font-jetbrains text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const { copyEmail } = bookPage;

export function BookCopyEmail() {
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState("");
  const addressRef = useRef<HTMLSpanElement>(null);
  const liveId = useId();
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  async function onCopy() {
    const ok = await copyText(CONTACT_EMAIL);
    if (ok) {
      setCopied(true);
      setLive(copyEmail.liveCopied);
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
      resetTimer.current = window.setTimeout(() => {
        setCopied(false);
        setLive("");
      }, 2000);
      return;
    }

    const el = addressRef.current;
    if (el && typeof window.getSelection === "function") {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    setLive(copyEmail.liveFallback);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        ref={addressRef}
        className="font-jetbrains text-sm text-syn-string text-accent-swap"
      >
        {CONTACT_EMAIL}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className={`${mailtoClass} inline-flex min-h-11 items-center`}
        aria-describedby={liveId}
      >
        {copied ? copyEmail.copiedLabel : copyEmail.buttonLabel}
      </button>
      <span id={liveId} className="sr-only" aria-live="polite">
        {live}
      </span>
    </div>
  );
}
