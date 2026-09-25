"use client";

import { useEffect, useId, useRef, useState } from "react";
import { bookPage } from "@/content/pages/book";
import { copyText } from "@/lib/book-links";
import { CONTACT_EMAIL } from "@/lib/site";

const mailtoClass =
  "font-jetbrains text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const btnClass =
  "font-jetbrains relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold tracking-wider text-syn-keyword transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const { panel } = bookPage;

type BookDraftPanelProps = {
  variant: "opened" | "too-long";
  subject: string;
  body: string;
  preview?: string;
  onEdit: () => void;
};

export function BookDraftPanel({
  variant,
  subject,
  body,
  preview,
  onEdit,
}: BookDraftPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState("");
  const liveId = useId();
  const headingId = useId();
  const resetTimer = useRef<number | null>(null);

  const copy = variant === "opened" ? panel.opened : panel.tooLong;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  async function onCopyDraft() {
    const text = [`To: ${CONTACT_EMAIL}`, `Subject: ${subject}`, "", body].join(
      "\n",
    );
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setLive(bookPage.copyEmail.liveCopied);
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
      resetTimer.current = window.setTimeout(() => {
        setCopied(false);
        setLive("");
      }, 2000);
    } else {
      setLive(bookPage.copyEmail.liveFallback);
    }
  }

  return (
    <div
      role="status"
      aria-labelledby={headingId}
      className="book-draft-panel mt-6 rounded-[4px] border border-border-ide bg-background p-4 opacity-100"
    >
      <h3
        ref={headingRef}
        id={headingId}
        tabIndex={-1}
        className="type-subhead tracking-tight outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
      >
        {copy.title}
      </h3>
      <p className="type-body-sm mt-2 text-syn-comment">{copy.body}</p>

      {preview ? (
        <div className="mt-4">
          <p className="type-label">{panel.previewLabel}</p>
          <pre className="type-body-sm mt-2 max-h-64 overflow-auto whitespace-pre-wrap font-mono text-foreground">
            {preview}
          </pre>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className={btnClass} onClick={onCopyDraft}>
          <span className="relative z-10">
            {copied ? panel.copyDraftDone : panel.copyDraftLabel}
          </span>
        </button>
        <button type="button" className={mailtoClass} onClick={onEdit}>
          {panel.editLabel}
        </button>
      </div>
      <span id={liveId} className="sr-only" aria-live="polite">
        {live}
      </span>
    </div>
  );
}
