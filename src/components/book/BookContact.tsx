"use client";

import { useState, type FormEvent } from "react";
import { TypeComment } from "@/components/TypeComment";
import { bookPage } from "@/content/pages/book";
import { CONTACT_EMAIL } from "@/lib/site";

const fieldClass =
  "font-jetbrains min-h-11 w-full rounded-[4px] border border-border-ide bg-background px-3 py-2 text-sm text-foreground transition-[background-color,color,border-color] duration-[400ms] ease-in-out placeholder:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const labelClass = "type-label";

const mailtoClass =
  "font-jetbrains text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const submitClass =
  "font-jetbrains relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold tracking-wider text-syn-keyword transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50";

const { contact, howHeardOptions } = bookPage;

function messagePrefill(type?: string): string {
  if (type === "coffee") return contact.coffeePrefill;
  if (type === "hard-talk") return contact.hardTalkPrefill;
  return "";
}

export function BookContact({ bookingType }: { bookingType?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [message, setMessage] = useState(() => messagePrefill(bookingType));
  const [composeHint, setComposeHint] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComposeHint(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();
    const heard =
      howHeardOptions.find((option) => option.value === howHeard)?.label ??
      howHeard;

    if (!trimmedName || !trimmedEmail || !trimmedMessage || !howHeard) {
      return;
    }

    const subject = encodeURIComponent(
      `${contact.subjectPrefix} ${trimmedName}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${trimmedName}`,
        `Email: ${trimmedEmail}`,
        trimmedPhone ? `Phone: ${trimmedPhone}` : null,
        `How heard: ${heard}`,
        "",
        contact.bodyHeading,
        trimmedMessage,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    );

    const href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      window.location.href = href;
      window.setTimeout(() => setComposeHint(true), 1200);
    } catch {
      setComposeHint(true);
    }
  }

  return (
    <section
      id="contact"
      className="mt-16 scroll-mt-28 border-t border-border-ide pt-12"
      aria-labelledby="book-contact-heading"
    >
      <TypeComment text={contact.eyebrow} className="text-syn-comment" />
      <h2
        id="book-contact-heading"
        className="type-heading mt-3 text-balance tracking-tight"
      >
        {contact.title}
      </h2>
      <p className="type-body mt-4 max-w-xl">{contact.intro}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] sm:items-start">
        <form
          className="flex flex-col gap-5"
          onSubmit={onSubmit}
          noValidate
        >
          <div className="flex flex-col gap-2">
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
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
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
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
            <label htmlFor="book-contact-heard" className={labelClass}>
              {contact.howHeardLabel}
            </label>
            <select
              id="book-contact-heard"
              name="howHeard"
              required
              value={howHeard}
              onChange={(e) => setHowHeard(e.target.value)}
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
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="book-contact-message" className={labelClass}>
              {contact.messageLabel}
            </label>
            <textarea
              id="book-contact-message"
              name="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${fieldClass} min-h-[8.5rem] resize-y py-3`}
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <button type="submit" className={submitClass}>
              <span className="relative z-10">{contact.submitLabel}</span>
              <span aria-hidden="true" className="spray-shine-wash" />
              <span aria-hidden="true" className="spray-shine-edge" />
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={`${mailtoClass} text-accent-swap`}
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          {composeHint ? (
            <p className="type-label text-syn-comment font-normal" role="status">
              {contact.composeHint}
            </p>
          ) : null}
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
