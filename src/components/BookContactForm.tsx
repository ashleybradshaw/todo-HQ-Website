"use client";

import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL } from "@/lib/site";

const fieldClass =
  "font-jetbrains min-h-11 w-full rounded-[4px] border border-border-ide bg-background px-3 py-2 text-sm text-foreground transition-[background-color,color,border-color] duration-[400ms] ease-in-out placeholder:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const labelClass = "font-jetbrains text-xs tracking-wide uppercase";

const mailtoClass =
  "font-jetbrains text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const submitClass =
  "font-jetbrains inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-2 text-xs text-syn-keyword transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50";

function messagePrefill(type?: string): string {
  if (type === "coffee") {
    return "Coffee talk (15 min) — chemistry check. Looking to see if this is a fit.";
  }
  if (type === "hard-talk") {
    return "Hard talk (60 min) — dig into the real issue and scope the fix. What has to ship:";
  }
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
      trimmedCompany
        ? `Book //TODO — ${trimmedCompany}`
        : `Book //TODO — ${trimmedName}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${trimmedName}`,
        `Email: ${trimmedEmail}`,
        trimmedCompany ? `Company: ${trimmedCompany}` : null,
        "",
        "What has to ship:",
        trimmedMessage,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    );

    const href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    try {
      window.location.href = href;
      // If the client blocks compose, surface the fallback link.
      window.setTimeout(() => setComposeHint(true), 1200);
    } catch {
      setComposeHint(true);
    }
  }

  return (
    <div className="mt-12 border-t border-border-ide pt-10">
      <p className="font-jetbrains text-xs tracking-wide uppercase">
        Contact strip
      </p>
      <p className="mt-3 max-w-xl text-base leading-relaxed">
        Short form — opens your mail client with the details filled in. Or email
        the team directly.
      </p>

      <form className="mt-8 flex max-w-xl flex-col gap-5" onSubmit={onSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="book-name" className={labelClass}>
            Name
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
            Email
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
            Company{" "}
            <span className="text-syn-comment normal-case tracking-normal">
              (optional)
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
            What has to ship
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
            Open mail draft →
          </button>
          <a href={`mailto:${CONTACT_EMAIL}`} className={`${mailtoClass} discovery-mailto-nudge`}>
            {CONTACT_EMAIL}
          </a>
        </div>

        {composeHint ? (
          <p className="font-jetbrains text-syn-comment text-xs" role="status">
            If nothing opened, use the email link above.
          </p>
        ) : null}
      </form>
    </div>
  );
}
