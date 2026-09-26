"use client";

import { useRef, useState } from "react";
import { bookPage } from "@/content/pages/book";
import {
  fieldErrorClass,
  MAX_ACCESS_NOTE_CHARS,
} from "@/lib/book-form";
import {
  linkRowIsInvalid,
  linkTag,
  MAX_LINK_NAME_CHARS,
  MAX_LINKS,
  MAX_URL_CHARS,
  newLinkRow,
  normaliseUrl,
  type BookLinkRow,
} from "@/lib/book-links";
import { cn } from "@/lib/cn";

const fieldClass =
  "font-jetbrains min-h-11 w-full rounded-[4px] border border-border-ide bg-background px-3 py-2 text-sm text-foreground transition-[background-color,color,border-color,opacity] duration-[400ms] ease-in-out placeholder:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const mailtoClass =
  "font-jetbrains text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const labelClass = "type-label";

const { links: linksCopy, access: accessCopy } = bookPage;

type BookLinksProps = {
  links: BookLinkRow[];
  onChange: (links: BookLinkRow[]) => void;
  max?: number;
  /** Override helper; defaults to Pre-brief “Up to 5.” copy. */
  helper?: string;
  needsAccess: boolean;
  onNeedsAccessChange: (value: boolean) => void;
  accessNote: string;
  onAccessNoteChange: (value: string) => void;
  /** When true, show errors for non-empty invalid rows (submit attempt). */
  showErrors?: boolean;
  idPrefix?: string;
};

export function BookLinks({
  links,
  onChange,
  max = MAX_LINKS,
  helper = linksCopy.helper,
  needsAccess,
  onNeedsAccessChange,
  accessNote,
  onAccessNoteChange,
  showErrors = false,
  idPrefix = "book-link",
}: BookLinksProps) {
  const urlRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});

  const atMax = links.length >= max;
  const maxLabel = `${max} links max`;
  const showAccess = links.some((row) => row.url.trim().length > 0);

  function updateRow(id: string, patch: Partial<BookLinkRow>) {
    onChange(
      links.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function handleUrlBlur(row: BookLinkRow, raw: string) {
    setBlurred((current) => ({ ...current, [row.id]: true }));
    const trimmed = raw.trim();
    if (!trimmed) return;
    const normalised = normaliseUrl(trimmed);
    if (normalised) {
      updateRow(row.id, { url: normalised });
    }
  }

  function removeRow(index: number) {
    if (links.length <= 1) return;
    const next = links.filter((_, i) => i !== index);
    onChange(next);
    const focusIndex = Math.max(0, index - 1);
    queueMicrotask(() => {
      urlRefs.current[focusIndex]?.focus();
    });
  }

  function addRow() {
    if (atMax) return;
    const row = newLinkRow();
    onChange([...links, row]);
    queueMicrotask(() => {
      urlRefs.current[links.length]?.focus();
    });
  }

  function showRowError(row: BookLinkRow) {
    return (showErrors || blurred[row.id]) && linkRowIsInvalid(row);
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <p className={labelClass}>{linksCopy.label}</p>
        <p className="type-label text-syn-comment mt-1 font-normal normal-case tracking-normal">
          {helper}
        </p>
      </div>

      <ul className="flex min-w-0 flex-col gap-4" role="list">
        {links.map((row, index) => {
          const n = index + 1;
          const urlId = `${idPrefix}-url-${row.id}`;
          const nameId = `${idPrefix}-name-${row.id}`;
          const errorId = `${idPrefix}-error-${row.id}`;
          const invalid = showRowError(row);
          const normalised = normaliseUrl(row.url);
          const tag = normalised ? linkTag(normalised) : null;

          return (
            <li key={row.id} className="min-w-0">
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex min-w-0 flex-col gap-2">
                  <label htmlFor={urlId} className={labelClass}>
                    Link {n}
                  </label>
                  <input
                    ref={(el) => {
                      urlRefs.current[index] = el;
                    }}
                    id={urlId}
                    name={`${idPrefix}-url-${n}`}
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    maxLength={MAX_URL_CHARS}
                    value={row.url}
                    onChange={(e) =>
                      updateRow(row.id, {
                        url: e.target.value.slice(0, MAX_URL_CHARS),
                      })
                    }
                    onBlur={(e) => handleUrlBlur(row, e.target.value)}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? errorId : undefined}
                    className={fieldClass}
                  />
                  {invalid ? (
                    <p id={errorId} className={fieldErrorClass} role="alert">
                      {linksCopy.urlError}
                    </p>
                  ) : null}
                  {tag && !invalid ? (
                    <span className="type-label text-syn-comment inline-flex w-fit rounded-[4px] border border-border-ide px-2 py-0.5 font-normal">
                      {tag}
                    </span>
                  ) : null}
                </div>

                <div className="flex min-w-0 items-end gap-3">
                  <div className="flex min-w-[140px] flex-1 flex-col gap-2">
                    <label htmlFor={nameId} className={labelClass}>
                      {linksCopy.nameLabel}
                    </label>
                    <input
                      id={nameId}
                      name={`${idPrefix}-name-${n}`}
                      type="text"
                      maxLength={MAX_LINK_NAME_CHARS}
                      placeholder={linksCopy.namePlaceholder}
                      value={row.name}
                      onChange={(e) =>
                        updateRow(row.id, {
                          name: e.target.value.slice(0, MAX_LINK_NAME_CHARS),
                        })
                      }
                      className={fieldClass}
                    />
                  </div>

                  {links.length > 1 ? (
                    <button
                      type="button"
                      aria-label={`Remove link ${n}`}
                      onClick={() => removeRow(index)}
                      className={cn(
                        mailtoClass,
                        "inline-flex size-11 shrink-0 items-center justify-center no-underline",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]",
                      )}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {atMax ? (
        <p className="type-label text-syn-comment font-normal">{maxLabel}</p>
      ) : (
        <button
          type="button"
          onClick={addRow}
          className={cn(mailtoClass, "inline-flex min-h-11 items-center self-start")}
        >
          {linksCopy.addLabel}
        </button>
      )}

      {showAccess ? (
        <div className="flex flex-col gap-3">
          <label className="font-jetbrains flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={needsAccess}
              onChange={(e) => onNeedsAccessChange(e.target.checked)}
              className="size-4 rounded-[4px] border border-border-ide accent-[var(--foreground)]"
            />
            <span className={labelClass}>{accessCopy.label}</span>
          </label>

          {needsAccess ? (
            <div className="flex flex-col gap-2">
              <label htmlFor={`${idPrefix}-access`} className={labelClass}>
                {accessCopy.noteLabel}
              </label>
              <textarea
                id={`${idPrefix}-access`}
                rows={3}
                maxLength={MAX_ACCESS_NOTE_CHARS}
                value={accessNote}
                onChange={(e) =>
                  onAccessNoteChange(
                    e.target.value.slice(0, MAX_ACCESS_NOTE_CHARS),
                  )
                }
                className={`${fieldClass} min-h-[5.5rem] resize-y py-3`}
              />
              <p className="type-label text-syn-comment font-normal tabular-nums">
                {accessNote.length.toLocaleString("en-GB")} /{" "}
                {MAX_ACCESS_NOTE_CHARS.toLocaleString("en-GB")}
              </p>
              <p className="type-label text-syn-comment font-normal normal-case tracking-normal">
                {accessCopy.helper}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
