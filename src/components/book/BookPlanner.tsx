"use client";

import { useMemo, useState, type FormEvent } from "react";
import { TypeComment } from "@/components/TypeComment";
import { bookPage } from "@/content/pages/book";
import {
  fieldErrorClass,
  fieldOpenClass,
  fieldQuietClass,
  isValidBrief,
  isValidEmail,
  isValidName,
} from "@/lib/book-form";
import { cn } from "@/lib/cn";
import { CONTACT_EMAIL } from "@/lib/site";

const fieldClass =
  "font-jetbrains min-h-11 w-full rounded-[4px] border border-border-ide bg-background px-3 py-2 text-sm text-foreground transition-[background-color,color,border-color,opacity] duration-[400ms] ease-in-out placeholder:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const labelClass = "type-label";

const navBtn =
  "font-jetbrains relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current px-4 py-2 text-xs font-bold tracking-wider transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40";

/** Same tactile lift as blog index / article cards (translateY on hover). */
const liftTileClass =
  "blog-note-link font-jetbrains flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-border-ide bg-background px-3 py-3 text-center text-xs font-bold tracking-wider focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

const { planner, howHeardOptions } = bookPage;
const TOTAL_STEPS = planner.steps.length;

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function LiftTile({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        liftTileClass,
        pressed
          ? "border-foreground bg-foreground text-background"
          : "text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function bookingFromType(type?: string) {
  if (type === "coffee" || type === "hard-talk") return type;
  return "";
}

export function BookPlanner({ bookingType }: { bookingType?: string }) {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(() => bookingFromType(bookingType));
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [brief, setBrief] = useState("");
  const [hasBrief, setHasBrief] = useState<"" | "yes" | "no">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [composeHint, setComposeHint] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showStep4Errors, setShowStep4Errors] = useState(false);
  const [touched4, setTouched4] = useState({
    name: false,
    email: false,
    howHeard: false,
  });

  const stepMeta = planner.steps[step - 1];
  const progress = (step / TOTAL_STEPS) * 100;

  const nameOk = isValidName(name);
  const emailOk = isValidEmail(email);
  const howHeardOk = Boolean(howHeard);
  const briefOk = isValidBrief(brief);

  const budgetOpen = Boolean(timeline);
  const needsOpen = Boolean(budget);
  const hasBriefOpen = briefOk;
  const emailOpen = nameOk;
  const companyOpen = emailOk;
  const howHeardOpen = emailOk;

  const canAdvance = useMemo(() => {
    if (step === 1) return Boolean(booking);
    if (step === 2) return Boolean(timeline && budget && needs.length > 0);
    if (step === 3) return briefOk && Boolean(hasBrief);
    return nameOk && emailOk && howHeardOk;
  }, [
    step,
    booking,
    timeline,
    budget,
    needs,
    briefOk,
    hasBrief,
    nameOk,
    emailOk,
    howHeardOk,
  ]);

  function toggleNeed(value: string) {
    setNeeds((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function buildSummary() {
    const heard =
      howHeardOptions.find((option) => option.value === howHeard)?.label ??
      howHeard;
    const needLabels = needs
      .map((value) => labelFor(planner.needsOptions, value))
      .join(", ");

    return [
      `Booking: ${labelFor(planner.bookingOptions, booking)}`,
      `Timeline: ${labelFor(planner.timelineOptions, timeline)}`,
      `Budget: ${labelFor(planner.budgetOptions, budget)}`,
      `Needs: ${needLabels}`,
      "",
      "Brief:",
      brief.trim(),
      `Has brief: ${hasBrief === "yes" ? planner.hasBriefYes : planner.hasBriefNo}`,
      "",
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      company.trim() ? `Company: ${company.trim()}` : null,
      `How heard: ${heard}`,
    ]
      .filter((line) => line !== null)
      .join("\n");
  }

  function onFinish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComposeHint(false);
    setShowStep4Errors(true);

    if (!nameOk || !emailOk || !howHeardOk) {
      return;
    }

    const text = buildSummary();
    setSummary(text);

    const subject = encodeURIComponent(
      `${planner.subjectPrefix} ${labelFor(planner.bookingOptions, booking) || name.trim()}`,
    );
    const body = encodeURIComponent(text);
    const href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      window.location.href = href;
      window.setTimeout(() => setComposeHint(true), 1200);
    } catch {
      setComposeHint(true);
    }
  }

  function show4Error(key: keyof typeof touched4) {
    return showStep4Errors || touched4[key];
  }

  const primaryReady = canAdvance;

  return (
    <section aria-labelledby="book-planner-heading">
      <TypeComment text={planner.eyebrow} className="text-syn-comment" />
      <h2
        id="book-planner-heading"
        className="type-heading mt-3 text-balance tracking-tight"
      >
        {planner.title}
      </h2>
      <p className="type-body mt-4 max-w-xl">{planner.intro}</p>

      <div
        className="mt-8 h-1 w-full overflow-hidden rounded-[4px] border border-border-ide bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)]"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step}
        aria-label={`Planner step ${step} of ${TOTAL_STEPS}`}
      >
        <div
          className="h-full bg-foreground transition-[width] duration-[400ms] ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="type-label text-syn-comment mt-2 font-normal">
        Step {step} / {TOTAL_STEPS}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] sm:items-start">
        <div className="min-w-0">
          <h3 className="type-subhead tracking-tight">{stepMeta.title}</h3>
          <p className="type-body-sm mt-2 text-syn-comment">{stepMeta.hint}</p>

          {step === 1 ? (
            <div
              className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
              role="group"
              aria-label={stepMeta.title}
            >
              {planner.bookingOptions.map((option) => (
                <LiftTile
                  key={option.value}
                  label={option.label}
                  pressed={booking === option.value}
                  onClick={() => setBooking(option.value)}
                />
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-6 flex flex-col gap-6">
              <div className={fieldOpenClass}>
                <p className={labelClass}>Timeline</p>
                <div
                  className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
                  role="group"
                >
                  {planner.timelineOptions.map((option) => (
                    <LiftTile
                      key={option.value}
                      label={option.label}
                      pressed={timeline === option.value}
                      onClick={() => setTimeline(option.value)}
                    />
                  ))}
                </div>
              </div>
              <div className={budgetOpen ? fieldOpenClass : fieldQuietClass}>
                <p className={labelClass}>Budget band</p>
                <div
                  className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
                  role="group"
                >
                  {planner.budgetOptions.map((option) => (
                    <LiftTile
                      key={option.value}
                      label={option.label}
                      pressed={budget === option.value}
                      onClick={() => setBudget(option.value)}
                    />
                  ))}
                </div>
              </div>
              <div className={needsOpen ? fieldOpenClass : fieldQuietClass}>
                <p className={labelClass}>Needs</p>
                <div
                  className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
                  role="group"
                >
                  {planner.needsOptions.map((option) => (
                    <LiftTile
                      key={option.value}
                      label={option.label}
                      pressed={needs.includes(option.value)}
                      onClick={() => toggleNeed(option.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-6 flex flex-col gap-5">
              <div className={cn("flex flex-col gap-2", fieldOpenClass)}>
                <label htmlFor="book-planner-brief" className={labelClass}>
                  {planner.briefLabel}
                </label>
                <textarea
                  id="book-planner-brief"
                  rows={5}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder={planner.briefPlaceholder}
                  className={`${fieldClass} min-h-[8.5rem] resize-y py-3`}
                />
                {!briefOk ? (
                  <p className="type-label text-syn-comment mt-1 font-normal">
                    {planner.errorBriefShort}
                  </p>
                ) : null}
              </div>
              <div className={hasBriefOpen ? fieldOpenClass : fieldQuietClass}>
                <p className={labelClass}>{planner.hasBriefLabel}</p>
                <div
                  className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
                  role="group"
                >
                  {(
                    [
                      ["yes", planner.hasBriefYes],
                      ["no", planner.hasBriefNo],
                    ] as const
                  ).map(([value, label]) => (
                    <LiftTile
                      key={value}
                      label={label}
                      pressed={hasBrief === value}
                      onClick={() => setHasBrief(value)}
                    />
                  ))}
                </div>
              </div>
              <div
                role="note"
                className={cn(
                  "rounded-[4px] border border-dashed border-border-ide px-4 py-6",
                  hasBriefOpen ? fieldOpenClass : fieldQuietClass,
                )}
              >
                <p className="type-label">{planner.dropzoneLabel}</p>
                <p className="type-body-sm text-syn-comment mt-2">
                  {planner.dropzoneHint}
                </p>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <form
              id="book-planner-finish"
              className="mt-6 flex flex-col gap-5"
              onSubmit={onFinish}
              noValidate
            >
              <div className={cn("flex flex-col gap-2", fieldOpenClass)}>
                <label htmlFor="book-planner-name" className={labelClass}>
                  {planner.nameLabel}
                </label>
                <input
                  id="book-planner-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() =>
                    setTouched4((current) => ({ ...current, name: true }))
                  }
                  aria-invalid={show4Error("name") && !nameOk}
                  aria-describedby={
                    show4Error("name") && !nameOk
                      ? "book-planner-name-error"
                      : undefined
                  }
                  className={fieldClass}
                />
                {show4Error("name") && !nameOk ? (
                  <p
                    id="book-planner-name-error"
                    className={fieldErrorClass}
                    role="alert"
                  >
                    {planner.errorNameShort}
                  </p>
                ) : null}
              </div>
              <div
                className={cn(
                  "flex flex-col gap-2",
                  emailOpen ? fieldOpenClass : fieldQuietClass,
                )}
              >
                <label htmlFor="book-planner-email" className={labelClass}>
                  {planner.emailLabel}
                </label>
                <input
                  id="book-planner-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setTouched4((current) => ({ ...current, email: true }))
                  }
                  aria-invalid={show4Error("email") && !emailOk}
                  aria-describedby={
                    show4Error("email") && !emailOk
                      ? "book-planner-email-error"
                      : undefined
                  }
                  className={fieldClass}
                />
                {show4Error("email") && !emailOk ? (
                  <p
                    id="book-planner-email-error"
                    className={fieldErrorClass}
                    role="alert"
                  >
                    {planner.errorEmailInvalid}
                  </p>
                ) : null}
              </div>
              <div
                className={cn(
                  "flex flex-col gap-2",
                  companyOpen ? fieldOpenClass : fieldQuietClass,
                )}
              >
                <label htmlFor="book-planner-company" className={labelClass}>
                  {planner.companyLabel}{" "}
                  <span className="text-syn-comment normal-case tracking-normal">
                    {planner.companyOptional}
                  </span>
                </label>
                <input
                  id="book-planner-company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div
                className={cn(
                  "flex flex-col gap-2",
                  howHeardOpen ? fieldOpenClass : fieldQuietClass,
                )}
              >
                <label htmlFor="book-planner-heard" className={labelClass}>
                  {planner.howHeardLabel}
                </label>
                <select
                  id="book-planner-heard"
                  name="howHeard"
                  required
                  value={howHeard}
                  onChange={(e) => setHowHeard(e.target.value)}
                  onBlur={() =>
                    setTouched4((current) => ({ ...current, howHeard: true }))
                  }
                  aria-invalid={show4Error("howHeard") && !howHeardOk}
                  aria-describedby={
                    show4Error("howHeard") && !howHeardOk
                      ? "book-planner-heard-error"
                      : undefined
                  }
                  className={fieldClass}
                >
                  <option value="" disabled>
                    {planner.howHeardPlaceholder}
                  </option>
                  {howHeardOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {show4Error("howHeard") && !howHeardOk ? (
                  <p
                    id="book-planner-heard-error"
                    className={fieldErrorClass}
                    role="alert"
                  >
                    {planner.errorHowHeard}
                  </p>
                ) : null}
              </div>
            </form>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={cn(navBtn, "bg-transparent")}
              disabled={step === 1}
              onClick={() => setStep((current) => Math.max(1, current - 1))}
            >
              {planner.backLabel}
            </button>
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                className={cn(
                  navBtn,
                  "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-syn-keyword",
                )}
                disabled={!primaryReady}
                onClick={() =>
                  setStep((current) => Math.min(TOTAL_STEPS, current + 1))
                }
              >
                <span className="relative z-10">{planner.nextLabel}</span>
                {primaryReady ? (
                  <>
                    <span aria-hidden="true" className="spray-shine-wash" />
                    <span aria-hidden="true" className="spray-shine-edge" />
                  </>
                ) : null}
              </button>
            ) : (
              <button
                type="submit"
                form="book-planner-finish"
                className={cn(
                  navBtn,
                  "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-syn-keyword",
                )}
                disabled={!primaryReady}
              >
                <span className="relative z-10">{planner.submitLabel}</span>
                {primaryReady ? (
                  <>
                    <span aria-hidden="true" className="spray-shine-wash" />
                    <span aria-hidden="true" className="spray-shine-edge" />
                  </>
                ) : null}
              </button>
            )}
          </div>

          {composeHint || summary ? (
            <div className="mt-6 rounded-[4px] border border-border-ide p-4">
              {composeHint ? (
                <p
                  className="type-label text-syn-comment font-normal"
                  role="status"
                >
                  {planner.composeHint}
                </p>
              ) : null}
              {summary ? (
                <>
                  <p className="type-label mt-2">{planner.successLabel}</p>
                  <pre className="type-body-sm mt-3 whitespace-pre-wrap font-mono">
                    {summary}
                  </pre>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside
          className="hidden min-h-[12rem] items-center justify-center rounded-[4px] border border-dashed border-border-ide bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] px-4 py-8 sm:flex"
          aria-hidden="true"
        >
          <p className="type-label text-syn-comment text-center font-normal">
            {stepMeta.mediaLabel}
          </p>
        </aside>
      </div>
    </section>
  );
}
