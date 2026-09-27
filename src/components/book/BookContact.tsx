"use client";

import { useRef, useState, type FormEvent } from "react";
import { BookCopyEmail } from "@/components/book/BookCopyEmail";
import { BookDraftPanel } from "@/components/book/BookDraftPanel";
import { BookLinks } from "@/components/book/BookLinks";
import { TypeComment } from "@/components/TypeComment";
import { bookPage } from "@/content/pages/book";
import {
  fieldErrorClass,
  fieldHelperClass,
  fieldOpenClass,
  fieldQuietClass,
  focusHeading,
  isValidEmail,
  isValidMessage,
  isValidName,
  MAX_MESSAGE_CHARS,
  scrollMtHeaderClass,
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
  "font-jetbrains relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold tracking-wider text-on-tint transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

/** Same tactile lift as blog index / article cards (translateY on hover). */
const liftTileClass =
  "blog-note-link font-jetbrains flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-border-ide bg-background px-3 py-3 text-center text-xs font-bold tracking-wider focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

/** Form column width matches prior 1.2fr track in the media-slot grid. */
const formColumnClass =
  "mt-8 grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] sm:items-start";

const { contact, howHeardOptions } = bookPage;

const ID = {
  heading: "quick-contact-heading",
  name: "quick-name",
  nameError: "quick-name-error",
  email: "quick-email",
  emailError: "quick-email-error",
  phone: "quick-phone",
  heard: "quick-heard",
  heardError: "quick-heard-error",
  message: "quick-message",
  messageError: "quick-message-error",
  messageCount: "quick-message-count",
  linkPrefix: "quick-link",
} as const;

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

type BookContactProps = {
  bookingType?: string;
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};

export function BookContact({
  bookingType,
  name,
  email,
  onNameChange,
  onEmailChange,
}: BookContactProps) {
  const [phone, setPhone] = useState("");
  const [callback, setCallback] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [message, setMessage] = useState(() => messagePrefill(bookingType));
  const [prefillType, setPrefillType] = useState(bookingType);
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
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Coffee / Hard talk: fill Quick note message only when empty — never overwrite typed text.
  if (bookingType !== prefillType) {
    setPrefillType(bookingType);
    const prefill = messagePrefill(bookingType);
    if (prefill && message.trim() === "") {
      setMessage(prefill);
    }
  }
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

  function onEdit() {
    setPanel(null);
    queueMicrotask(() => focusHeading(headingRef.current));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowAllErrors(true);

    if (!formReady) {
      const invalidLink = firstInvalidLinkIndex(links);
      const order: string[] = [];
      if (!nameOk) order.push(ID.name);
      if (!emailOk) order.push(ID.email);
      if (!howHeardOk) order.push(ID.heard);
      if (!messageOk) order.push(ID.message);
      if (invalidLink >= 0) {
        order.push(`${ID.linkPrefix}-url-${links[invalidLink].id}`);
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
      <section aria-labelledby={ID.heading}>
        <TypeComment text={contact.eyebrow} className="text-syn-comment" />
        <h2
          ref={headingRef}
          id={ID.heading}
          tabIndex={-1}
          className={cn(
            "type-heading mt-3 text-balance tracking-tight outline-none",
            scrollMtHeaderClass,
          )}
        >
          {contact.title}
        </h2>
        <BookDraftPanel
          variant={panel.variant}
          subject={panel.subject}
          body={panel.body}
          preview={panel.body}
          onEdit={onEdit}
        />
      </section>
    );
  }

  return (
    <section aria-labelledby={ID.heading}>
      <TypeComment text={contact.eyebrow} className="text-syn-comment" />
      <h2
        ref={headingRef}
        id={ID.heading}
        tabIndex={-1}
        className={cn(
          "type-heading mt-3 text-balance tracking-tight outline-none",
          scrollMtHeaderClass,
        )}
      >
        {contact.title}
      </h2>
      <p className="type-body mt-4 max-w-xl">{contact.intro}</p>

      <div className={formColumnClass}>
        <form
          className="flex min-w-0 flex-col gap-5"
          onSubmit={onSubmit}
          noValidate
          autoComplete="off"
        >
          <div className={cn("flex flex-col gap-2", fieldOpenClass)}>
            <label htmlFor={ID.name} className={labelClass}>
              {contact.nameLabel}
            </label>
            <input
              id={ID.name}
              name="quick-visitor-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={(e) => {
                // Playwright/Chromium can update the DOM without React onChange;
                // commit whatever is in the field so the next render does not wipe it.
                if (e.currentTarget.value !== name) {
                  onNameChange(e.currentTarget.value);
                }
                markTouched("name");
              }}
              aria-invalid={showError("name") && !nameOk}
              aria-describedby={
                showError("name") && !nameOk ? ID.nameError : undefined
              }
              className={fieldClass}
            />
            {showError("name") && !nameOk ? (
              <p id={ID.nameError} className={fieldErrorClass} role="alert">
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
            <label htmlFor={ID.email} className={labelClass}>
              {contact.emailLabel}
            </label>
            <input
              id={ID.email}
              name="quick-visitor-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={(e) => {
                if (e.currentTarget.value !== email) {
                  onEmailChange(e.currentTarget.value);
                }
                markTouched("email");
              }}
              aria-invalid={showError("email") && !emailOk}
              aria-describedby={
                showError("email") && !emailOk ? ID.emailError : undefined
              }
              className={fieldClass}
            />
            {showError("email") && !emailOk ? (
              <p id={ID.emailError} className={fieldErrorClass} role="alert">
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
            <label htmlFor={ID.phone} className={labelClass}>
              {contact.phoneLabel}{" "}
              <span className="text-syn-comment normal-case tracking-normal">
                {contact.phoneOptional}
              </span>
            </label>
            <input
              id={ID.phone}
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className={optionalOpen ? fieldOpenClass : fieldQuietClass}>
            <p className={labelClass} id="quick-callback-label">
              {contact.callbackLabel}{" "}
              <span className="text-syn-comment normal-case tracking-normal">
                {contact.callbackOptional}
              </span>
            </p>
            <div
              className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
              role="group"
              aria-labelledby="quick-callback-label"
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
            <label htmlFor={ID.heard} className={labelClass}>
              {contact.howHeardLabel}
            </label>
            <select
              id={ID.heard}
              name="howHeard"
              required
              value={howHeard}
              onChange={(e) => setHowHeard(e.target.value)}
              onBlur={() => markTouched("howHeard")}
              aria-invalid={showError("howHeard") && !howHeardOk}
              aria-describedby={
                showError("howHeard") && !howHeardOk ? ID.heardError : undefined
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
              <p id={ID.heardError} className={fieldErrorClass} role="alert">
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
            <label htmlFor={ID.message} className={labelClass}>
              {contact.messageLabel}
            </label>
            <textarea
              id={ID.message}
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
                  ? ID.messageError
                  : ID.messageCount
              }
              className={`${fieldClass} min-h-[8.5rem] resize-y py-3`}
            />
            <p id={ID.messageCount} className={cn(fieldHelperClass, "tabular-nums")}>
              {message.length.toLocaleString("en-GB")} /{" "}
              {MAX_MESSAGE_CHARS.toLocaleString("en-GB")}
            </p>
            {showError("message") && !messageOk ? (
              <p id={ID.messageError} className={fieldErrorClass} role="alert">
                {contact.errorMessageShort}
              </p>
            ) : null}
          </div>

          <div className={messageOpen ? fieldOpenClass : fieldQuietClass}>
            <BookLinks
              links={links}
              onChange={setLinks}
              max={3}
              helper={bookPage.links.helperQuick}
              needsAccess={needsAccess}
              onNeedsAccessChange={setNeedsAccess}
              accessNote={accessNote}
              onAccessNoteChange={setAccessNote}
              showErrors={showAllErrors}
              idPrefix={ID.linkPrefix}
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
          <p className={fieldHelperClass}>{contact.submitHelper}</p>
        </form>
      </div>
    </section>
  );
}
