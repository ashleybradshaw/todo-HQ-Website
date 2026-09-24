"use client";

import { useMemo, useState, type FormEvent } from "react";
import { TypeComment } from "@/components/TypeComment";
import { bookPage } from "@/content/pages/book";
import { cn } from "@/lib/cn";
import { CONTACT_EMAIL } from "@/lib/site";

const fieldClass =
  "font-jetbrains min-h-11 w-full rounded-[4px] border border-border-ide bg-background px-3 py-2 text-sm text-foreground transition-[background-color,color,border-color] duration-[400ms] ease-in-out placeholder:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const labelClass = "type-label";

const navBtn =
  "font-jetbrains relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current px-4 py-2 text-xs font-bold tracking-wider transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-50";

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

export function BookPlanner() {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState("");
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

  const stepMeta = planner.steps[step - 1];
  const progress = (step / TOTAL_STEPS) * 100;

  const canAdvance = useMemo(() => {
    if (step === 1) return Boolean(booking);
    if (step === 2) return Boolean(timeline && budget && needs.length > 0);
    if (step === 3) return Boolean(brief.trim() && hasBrief);
    return true;
  }, [step, booking, timeline, budget, needs, brief, hasBrief]);

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

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !trimmedEmail || !howHeard) {
      return;
    }

    const text = buildSummary();
    setSummary(text);

    const subject = encodeURIComponent(
      `${planner.subjectPrefix} ${labelFor(planner.bookingOptions, booking) || trimmedName}`,
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
              className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2"
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
              <div>
                <p className={labelClass}>Timeline</p>
                <div
                  className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
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
              <div>
                <p className={labelClass}>Budget band</p>
                <div
                  className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
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
              <div>
                <p className={labelClass}>Needs</p>
                <div
                  className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
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
              <div className="flex flex-col gap-2">
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
              </div>
              <div>
                <p className={labelClass}>{planner.hasBriefLabel}</p>
                <div
                  className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
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
                className="rounded-[4px] border border-dashed border-border-ide px-4 py-6"
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
              <div className="flex flex-col gap-2">
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
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-2">
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
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-2">
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
              <div className="flex flex-col gap-2">
                <label htmlFor="book-planner-heard" className={labelClass}>
                  {planner.howHeardLabel}
                </label>
                <select
                  id="book-planner-heard"
                  name="howHeard"
                  required
                  value={howHeard}
                  onChange={(e) => setHowHeard(e.target.value)}
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
                disabled={!canAdvance}
                onClick={() =>
                  setStep((current) => Math.min(TOTAL_STEPS, current + 1))
                }
              >
                <span className="relative z-10">{planner.nextLabel}</span>
                <span aria-hidden="true" className="spray-shine-wash" />
                <span aria-hidden="true" className="spray-shine-edge" />
              </button>
            ) : (
              <button
                type="submit"
                form="book-planner-finish"
                className={cn(
                  navBtn,
                  "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-syn-keyword",
                )}
              >
                <span className="relative z-10">{planner.submitLabel}</span>
                <span aria-hidden="true" className="spray-shine-wash" />
                <span aria-hidden="true" className="spray-shine-edge" />
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
          className="flex min-h-[12rem] items-center justify-center rounded-[4px] border border-dashed border-border-ide bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] px-4 py-8"
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
