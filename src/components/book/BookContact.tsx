"use client";

import { useState, type FormEvent } from "react";
import { BookCopyEmail } from "@/components/book/BookCopyEmail";
import { BookDraftPanel } from "@/components/book/BookDraftPanel";
import { BookLinks } from "@/components/book/BookLinks";
import { TypeComment } from "@/components/TypeComment";
import { bookPage } from "@/content/pages/book";
import {
  fieldErrorClass,
  fieldOpenClass,
  fieldQuietClass,
  isValidEmail,
  isValidMessage,
  isValidName,
  MAX_MESSAGE_CHARS,
} from "@/lib/book-form";
import {
  buildMailto,
  firstInvalidLinkIndex,
  formatLinksForEmail,
  linksHaveInvalidRows,
  initialLinkRows,
  type BookLinkRow,
} from "@/lib/book-links";
import { cn } from "@/lib/cn";

const fieldClass =
  "font-jetbrains min-h-11 w-full rounded-[4px] border border-border-ide bg-background px-3 py-2 text-sm text-foreground transition-[background-color,color,border-color,opacity] duration-[400ms] ease-in-out placeholder:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const labelClass = "type-label";

const submitClass =
  "font-jetbrains relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold tracking-wider text-syn-keyword transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

/** Same tactile lift as blog index / article cards (translateY on hover). */
const liftTileClass =
  "blog-note-link font-jetbrains flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-border-ide bg-background px-3 py-3 text-center text-xs font-bold tracking-wider focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

const { contact, howHeardOptions } = bookPage;

function messagePrefill(type?: string): string {
  if (type === "coffee") return contact.coffeePrefill;
  if (type === "hard-talk") return contact.hardTalkPrefill;
  return "";
}

type Touched = {
  name: boolean;
  email: boolean;
  howHeard: boolean;
  message: boolean;
};

type PanelState = {
  variant: "opened" | "too-long";
  subject: string;
  body: string;
} | null;

export function BookContact({ bookingType }: { bookingType?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [callback, setCallback] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [message, setMessage] = useState(() => messagePrefill(bookingType));
  const [links, setLinks] = useState<BookLinkRow[]>(() => initialLinkRows(1));
  const [needsAccess, setNeedsAccess] = useState(false);
  const [accessNote, setAccessNote] = useState("");
  const [panel, setPanel] = useState<PanelState>(null);
  const [touched, setTouched] = useState<Touched>({
    name: false,
    email: false,
    howHeard: false,
    message: false,
  });
  const [showAllErrors, setShowAllErrors] = useState(false);

  const nameOk = isValidName(name);
  const emailOk = isValidEmail(email);
  const howHeardOk = Boolean(howHeard);
  const messageOk = isValidMessage(message);
  const linksOk = !linksHaveInvalidRows(links);

  const emailOpen = nameOk;
  const optionalOpen = emailOk;
  const howHeardOpen = emailOk;
  const messageOpen = howHeardOk;
  const formReady = nameOk && emailOk && howHeardOk && messageOk && linksOk;

  function markTouched(key: keyof Touched) {
    setTouched((current) => ({ ...current, [key]: true }));
  }

  function showError(key: keyof Touched) {
    return showAllErrors || touched[key];
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowAllErrors(true);

    if (!formReady) {
      const invalidLink = firstInvalidLinkIndex(links);
      const order: string[] = [];
      if (!nameOk) order.push("book-contact-name");
      if (!emailOk) order.push("book-contact-email");
      if (!howHeardOk) order.push("book-contact-heard");
      if (!messageOk) order.push("book-contact-message");
      if (invalidLink >= 0) {
        order.push(`book-contact-link-url-${links[invalidLink].id}`);
      }
      queueMicrotask(() => {
        for (const id of order) {
          const el = document.getElementById(id);
          if (el) {
            el.focus();
            return;
          }
        }
      });
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();
    const heard =
      howHeardOptions.find((option) => option.value === howHeard)?.label ??
      howHeard;
    const callbackLabel =
      contact.callbackOptions.find((option) => option.value === callback)
        ?.label ?? callback;

    const linksBlock = formatLinksForEmail(
      links,
      needsAccess ? accessNote : undefined,
    );

    const subject = `${contact.subjectPrefix} ${trimmedName}`;
    const body = [
      `Name: ${trimmedName}`,
      `Email: ${trimmedEmail}`,
      trimmedPhone ? `Phone: ${trimmedPhone}` : null,
      callbackLabel ? `Best time to call back (UK): ${callbackLabel}` : null,
      `How heard: ${heard}`,
      "",
      contact.bodyHeading,
      trimmedMessage,
      linksBlock ? "" : null,
      linksBlock || null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    const { href, tooLong } = buildMailto(subject, body);

    if (tooLong) {
      setPanel({ variant: "too-long", subject, body });
      return;
    }

    try {
      window.location.href = href;
    } catch {
      // Panel still shows — we cannot know if mail opened.
    }
    setPanel({ variant: "opened", subject, body });
  }

  if (panel) {
    return (
      <section aria-labelledby="book-contact-heading">
        <TypeComment text={contact.eyebrow} className="text-syn-comment" />
        <h2
          id="book-contact-heading"
          className="type-heading mt-3 text-balance tracking-tight"
        >
          {contact.title}
        </h2>
        <BookDraftPanel
          variant={panel.variant}
          subject={panel.subject}
          body={panel.body}
          onEdit={() => setPanel(null)}
        />
      </section>
    );
  }

  return (
    <section aria-labelledby="book-contact-heading">
      <TypeComment text={contact.eyebrow} className="text-syn-comment" />
      <h2
        id="book-contact-heading"
        className="type-heading mt-3 text-balance tracking-tight"
      >
        {contact.title}
      </h2>
      <p className="type-body mt-4 max-w-xl">{contact.intro}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] sm:items-start">
        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <div className={cn("flex flex-col gap-2", fieldOpenClass)}>
            <label htmlFor="book-contact-name" className={labelClass}>
              {contact.nameLabel}
            </label>
            <input
              id="book-contact-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => markTouched("name")}
              aria-invalid={showError("name") && !nameOk}
              aria-describedby={
                showError("name") && !nameOk ? "book-contact-name-error" : undefined
              }
              className={fieldClass}
            />
            {showError("name") && !nameOk ? (
              <p id="book-contact-name-error" className={fieldErrorClass} role="alert">
                {contact.errorNameShort}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "flex flex-col gap-2",
              emailOpen ? fieldOpenClass : fieldQuietClass,
            )}
          >
            <label htmlFor="book-contact-email" className={labelClass}>
              {contact.emailLabel}
            </label>
            <input
              id="book-contact-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched("email")}
              aria-invalid={showError("email") && !emailOk}
              aria-describedby={
                showError("email") && !emailOk
                  ? "book-contact-email-error"
                  : undefined
              }
              className={fieldClass}
            />
            {showError("email") && !emailOk ? (
              <p
                id="book-contact-email-error"
                className={fieldErrorClass}
                role="alert"
              >
                {contact.errorEmailInvalid}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "flex flex-col gap-2",
              optionalOpen ? fieldOpenClass : fieldQuietClass,
            )}
          >
            <label htmlFor="book-contact-phone" className={labelClass}>
              {contact.phoneLabel}{" "}
              <span className="text-syn-comment normal-case tracking-normal">
                {contact.phoneOptional}
              </span>
            </label>
            <input
              id="book-contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className={optionalOpen ? fieldOpenClass : fieldQuietClass}>
            <p className={labelClass}>
              {contact.callbackLabel}{" "}
              <span className="text-syn-comment normal-case tracking-normal">
                {contact.callbackOptional}
              </span>
            </p>
            <div
              className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
              role="group"
              aria-label={contact.callbackLabel}
            >
              {contact.callbackOptions.map((option) => {
                const pressed = callback === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() =>
                      setCallback((current) =>
                        current === option.value ? "" : option.value,
                      )
                    }
                    className={cn(
                      liftTileClass,
                      pressed
                        ? "border-foreground bg-foreground text-background"
                        : "text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              "flex flex-col gap-2",
              howHeardOpen ? fieldOpenClass : fieldQuietClass,
            )}
          >
            <label htmlFor="book-contact-heard" className={labelClass}>
              {contact.howHeardLabel}
            </label>
            <select
              id="book-contact-heard"
              name="howHeard"
              required
              value={howHeard}
              onChange={(e) => setHowHeard(e.target.value)}
              onBlur={() => markTouched("howHeard")}
              aria-invalid={showError("howHeard") && !howHeardOk}
              aria-describedby={
                showError("howHeard") && !howHeardOk
                  ? "book-contact-heard-error"
                  : undefined
              }
              className={fieldClass}
            >
              <option value="" disabled>
                {contact.howHeardPlaceholder}
              </option>
              {howHeardOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {showError("howHeard") && !howHeardOk ? (
              <p
                id="book-contact-heard-error"
                className={fieldErrorClass}
                role="alert"
              >
                {contact.errorHowHeard}
              </p>
            ) : null}
          </div>

          <div
            className={cn(
              "flex flex-col gap-2",
              messageOpen ? fieldOpenClass : fieldQuietClass,
            )}
          >
            <label htmlFor="book-contact-message" className={labelClass}>
              {contact.messageLabel}
            </label>
            <textarea
              id="book-contact-message"
              name="message"
              required
              rows={5}
              maxLength={MAX_MESSAGE_CHARS}
              value={message}
              onChange={(e) =>
                setMessage(e.target.value.slice(0, MAX_MESSAGE_CHARS))
              }
              onBlur={() => markTouched("message")}
              aria-invalid={showError("message") && !messageOk}
              aria-describedby={
                showError("message") && !messageOk
                  ? "book-contact-message-error"
                  : "book-contact-message-count"
              }
              className={`${fieldClass} min-h-[8.5rem] resize-y py-3`}
            />
            <p
              id="book-contact-message-count"
              className="type-label text-syn-comment font-normal tabular-nums"
            >
              {message.length.toLocaleString("en-GB")} /{" "}
              {MAX_MESSAGE_CHARS.toLocaleString("en-GB")}
            </p>
            {showError("message") && !messageOk ? (
              <p
                id="book-contact-message-error"
                className={fieldErrorClass}
                role="alert"
              >
                {contact.errorMessageShort}
              </p>
            ) : null}
          </div>

          <div className={messageOpen ? fieldOpenClass : fieldQuietClass}>
            <BookLinks
              links={links}
              onChange={setLinks}
              max={1}
              single
              needsAccess={needsAccess}
              onNeedsAccessChange={setNeedsAccess}
              accessNote={accessNote}
              onAccessNoteChange={setAccessNote}
              showErrors={showAllErrors}
              idPrefix="book-contact-link"
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="submit" className={submitClass}>
              <span className="relative z-10">{contact.submitLabel}</span>
              {formReady ? (
                <>
                  <span aria-hidden="true" className="spray-shine-wash" />
                  <span aria-hidden="true" className="spray-shine-edge" />
                </>
              ) : null}
            </button>
            <BookCopyEmail />
          </div>
          <p className="type-label text-syn-comment font-normal normal-case tracking-normal">
            {contact.submitHelper}
          </p>
        </form>

        <aside
          className="flex min-h-[12rem] items-center justify-center rounded-[4px] border border-dashed border-border-ide bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] px-4 py-8"
          aria-hidden="true"
        >
          <p className="type-label text-syn-comment text-center font-normal">
            {contact.mediaLabel}
          </p>
        </aside>
      </div>
    </section>
  );
}
