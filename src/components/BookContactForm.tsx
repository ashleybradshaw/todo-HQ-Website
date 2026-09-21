"use client";

import { useState, type FormEvent } from "react";
import { bookPage } from "@/content/pages/book";
import { CONTACT_EMAIL } from "@/lib/site";

const fieldClass =
  "font-jetbrains min-h-11 w-full rounded-[4px] border border-border-ide bg-background px-3 py-2 text-sm text-foreground transition-[background-color,color,border-color] duration-[400ms] ease-in-out placeholder:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const labelClass = "font-jetbrains text-xs tracking-wide uppercase";

const mailtoClass =
  "font-jetbrains text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const submitClass =
  "font-jetbrains inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs font-bold text-syn-keyword transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50";

const { form } = bookPage;

function messagePrefill(type?: string): string {
  if (type === "coffee") return form.coffeePrefill;
  if (type === "hard-talk") return form.hardTalkPrefill;
  return "";
}

export function BookContactForm({
  bookingType,
}: {
  bookingType?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState(() => messagePrefill(bookingType));
  const [composeHint, setComposeHint] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComposeHint(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCompany = company.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return;
    }

    const subject = encodeURIComponent(
      `${form.subjectPrefix} ${trimmedCompany || trimmedName}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${trimmedName}`,
        `Email: ${trimmedEmail}`,
        trimmedCompany ? `Company: ${trimmedCompany}` : null,
        "",
        form.bodyHeading,
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
    <div className="mt-12 border-t border-border-ide pt-10">
      <p className="font-jetbrains text-xs tracking-wide uppercase">
        {form.stripLabel}
      </p>
      <p className="mt-3 max-w-xl text-base leading-relaxed">{form.stripIntro}</p>

      <form
        className="mt-8 flex max-w-xl flex-col gap-5"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="book-name" className={labelClass}>
            {form.nameLabel}
          </label>
          <input
            id="book-name"
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
          <label htmlFor="book-email" className={labelClass}>
            {form.emailLabel}
          </label>
          <input
            id="book-email"
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
          <label htmlFor="book-company" className={labelClass}>
            {form.companyLabel}{" "}
            <span className="text-syn-comment normal-case tracking-normal">
              {form.companyOptional}
            </span>
          </label>
          <input
            id="book-company"
            name="company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="book-message" className={labelClass}>
            {form.messageLabel}
          </label>
          <textarea
            id="book-message"
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
            {form.submitLabel}
          </button>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={`${mailtoClass} text-accent-swap`}
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        {composeHint ? (
          <p className="font-jetbrains text-syn-comment text-xs" role="status">
            {form.composeHint}
          </p>
        ) : null}
      </form>
    </div>
  );
}
