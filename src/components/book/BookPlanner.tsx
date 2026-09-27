"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
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
  isValidBrief,
  isValidEmail,
  isValidName,
  MAX_BRIEF_CHARS,
  scrollMtHeaderClass,
  suggestEmail,
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

const legendClass = "type-label p-0";

const navBtn =
  "font-jetbrains relative inline-flex min-h-11 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-current px-4 py-2 text-xs font-bold tracking-wider transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40";

/** Same tactile lift as blog index / article cards (translateY on hover). */
const liftTileClass =
  "blog-note-link font-jetbrains flex min-h-11 cursor-pointer items-center justify-center rounded-[4px] border border-border-ide bg-background px-3 py-3 text-center text-xs font-bold tracking-wider focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

/** Form column — full essay width (media aside removed; no empty 2nd grid track). */
const formColumnClass = "mt-8 w-full min-w-0";

const { planner, howHeardOptions } = bookPage;
const TOTAL_STEPS = planner.steps.length;

const suggestionMailtoClass =
  "font-jetbrains text-syn-string underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]";

const ID = {
  heading: "brief-planner-heading",
  stepHeading: "brief-step-heading",
  brief: "brief-brief",
  name: "brief-name",
  nameError: "brief-name-error",
  email: "brief-email",
  emailError: "brief-email-error",
  emailSuggestion: "brief-email-suggestion",
  emailSuggestionLive: "brief-email-suggestion-live",
  company: "brief-company",
  heard: "brief-heard",
  heardError: "brief-heard-error",
  finish: "brief-planner-finish",
  linkPrefix: "brief-link",
  timelineLegend: "brief-timeline-legend",
  budgetLegend: "brief-budget-legend",
  needsLegend: "brief-needs-legend",
  hasBriefLegend: "brief-has-brief-legend",
} as const;

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

type PanelState = {
  variant: "opened" | "too-long";
  subject: string;
  body: string;
} | null;

type BookPlannerProps = {
  bookingType?: string;
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};

export function BookPlanner({
  bookingType,
  name,
  email,
  onNameChange,
  onEmailChange,
}: BookPlannerProps) {
  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(() => bookingFromType(bookingType));
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [brief, setBrief] = useState("");
  const [hasBrief, setHasBrief] = useState<"" | "yes" | "no">("");
  const [links, setLinks] = useState<BookLinkRow[]>(() => initialLinkRows(1));
  const [needsAccess, setNeedsAccess] = useState(false);
  const [accessNote, setAccessNote] = useState("");
  const [company, setCompany] = useState("");
  const [howHeard, setHowHeard] = useState("");
  const [panel, setPanel] = useState<PanelState>(null);
  const [showStep4Errors, setShowStep4Errors] = useState(false);
  const [showLinkErrors, setShowLinkErrors] = useState(false);
  const [briefTouched, setBriefTouched] = useState(false);
  const [emailSuggestionLive, setEmailSuggestionLive] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
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
  const linksOk = !linksHaveInvalidRows(links);
  const emailSuggestion = emailOk ? suggestEmail(email) : null;

  const budgetOpen = Boolean(timeline);
  const needsOpen = Boolean(budget);
  const hasBriefOpen = briefOk;
  const emailOpen = nameOk;
  const companyOpen = emailOk;
  const howHeardOpen = emailOk;

  useEffect(() => {
    if (!emailSuggestion) {
      setEmailSuggestionLive("");
      return;
    }
    setEmailSuggestionLive(
      bookPage.emailSuggestion.replace("{suggestion}", emailSuggestion),
    );
  }, [emailSuggestion]);

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

  function goToStep(next: number) {
    setStep(next);
    queueMicrotask(() => focusHeading(stepHeadingRef.current));
  }

  function onBack() {
    goToStep(Math.max(1, step - 1));
  }

  function onNext() {
    if (step === 3) {
      setBriefTouched(true);
    }
    if (step === 3 && !linksOk) {
      setShowLinkErrors(true);
      const invalidLink = firstInvalidLinkIndex(links);
      if (invalidLink >= 0) {
        const focusId = `${ID.linkPrefix}-url-${links[invalidLink].id}`;
        queueMicrotask(() => {
          document.getElementById(focusId)?.focus();
        });
      }
      return;
    }
    goToStep(Math.min(TOTAL_STEPS, step + 1));
  }

  /** Keep focus off Next when step-3 links are invalid so we can move it to the field. */
  function onNextMouseDown(event: MouseEvent<HTMLButtonElement>) {
    if (step === 3 && !linksOk) {
      event.preventDefault();
    }
  }

  function onEdit() {
    setPanel(null);
    queueMicrotask(() => focusHeading(headingRef.current));
  }

  function buildSummary() {
    const heard =
      howHeardOptions.find((option) => option.value === howHeard)?.label ??
      howHeard;
    const needLabels = needs
      .map((value) => labelFor(planner.needsOptions, value))
      .join(", ");

    const linksBlock = formatLinksForEmail(
      links,
      needsAccess ? accessNote : undefined,
    );

    return [
      `${planner.draftLabels.booking} ${labelFor(planner.bookingOptions, booking)}`,
      `${planner.draftLabels.timeline} ${labelFor(planner.timelineOptions, timeline)}`,
      `${planner.draftLabels.budget} ${labelFor(planner.budgetOptions, budget)}`,
      `${planner.draftLabels.needs} ${needLabels}`,
      "",
      planner.draftLabels.brief,
      brief.trim(),
      `Written brief: ${hasBrief === "yes" ? planner.hasBriefYes : planner.hasBriefNo}`,
      linksBlock ? "" : null,
      linksBlock || null,
      "",
      `${planner.draftLabels.name} ${name.trim()}`,
      `${planner.draftLabels.email} ${email.trim()}`,
      company.trim()
        ? `${planner.draftLabels.company} ${company.trim()}`
        : null,
      `${planner.draftLabels.howHeard} ${heard}`,
    ]
      .filter((line) => line !== null)
      .join("\n");
  }

  function onFinish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowStep4Errors(true);

    if (!nameOk || !emailOk || !howHeardOk) {
      const order: string[] = [];
      if (!nameOk) order.push(ID.name);
      if (!emailOk) order.push(ID.email);
      if (!howHeardOk) order.push(ID.heard);
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

    // Links already validated on step 3 Next — never bounce back to step 3.
    const text = buildSummary();
    const subject = `${planner.subjectPrefix} ${name.trim()}`;
    const { href, tooLong } = buildMailto(subject, text);

    if (tooLong) {
      setPanel({ variant: "too-long", subject, body: text });
      return;
    }

    try {
      window.location.href = href;
    } catch {
      // Panel still shows — we cannot know if mail opened.
    }
    setPanel({ variant: "opened", subject, body: text });
  }

  function show4Error(key: keyof typeof touched4) {
    return showStep4Errors || touched4[key];
  }

  function applyEmailSuggestion() {
    if (!emailSuggestion) return;
    onEmailChange(emailSuggestion);
    setEmailSuggestionLive("");
    queueMicrotask(() => emailInputRef.current?.focus());
  }

  const primaryReady = canAdvance;
  const finishReady = nameOk && emailOk && howHeardOk && linksOk;

  if (panel) {
    return (
      <section aria-labelledby={ID.heading}>
        <TypeComment text={planner.eyebrow} className="text-syn-comment" />
        <h2
          ref={headingRef}
          id={ID.heading}
          tabIndex={-1}
          className={cn(
            "type-heading mt-3 text-balance tracking-tight outline-none",
            scrollMtHeaderClass,
          )}
        >
          {planner.title}
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
      <TypeComment text={planner.eyebrow} className="text-syn-comment" />
      <h2
        ref={headingRef}
        id={ID.heading}
        tabIndex={-1}
        className={cn(
          "type-heading mt-3 text-balance tracking-tight outline-none",
          scrollMtHeaderClass,
        )}
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
      <p className={cn(fieldHelperClass, "mt-2")}>
        Step {step} / {TOTAL_STEPS}
      </p>

      <div className={formColumnClass}>
        <div className="min-w-0">
          <h3
            ref={stepHeadingRef}
            id={ID.stepHeading}
            tabIndex={-1}
            className={cn(
              "type-subhead tracking-tight outline-none",
              scrollMtHeaderClass,
            )}
          >
            {stepMeta.title}
          </h3>
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
              <fieldset className={cn("min-w-0 border-0 p-0", fieldOpenClass)}>
                <legend id={ID.timelineLegend} className={legendClass}>
                  Timeline
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {planner.timelineOptions.map((option) => (
                    <LiftTile
                      key={option.value}
                      label={option.label}
                      pressed={timeline === option.value}
                      onClick={() => setTimeline(option.value)}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset
                className={cn(
                  "min-w-0 border-0 p-0",
                  budgetOpen ? fieldOpenClass : fieldQuietClass,
                )}
              >
                <legend id={ID.budgetLegend} className={legendClass}>
                  Budget
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {planner.budgetOptions.map((option) => (
                    <LiftTile
                      key={option.value}
                      label={option.label}
                      pressed={budget === option.value}
                      onClick={() => setBudget(option.value)}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset
                className={cn(
                  "min-w-0 border-0 p-0",
                  needsOpen ? fieldOpenClass : fieldQuietClass,
                )}
              >
                <legend id={ID.needsLegend} className={legendClass}>
                  Needs
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {planner.needsOptions.map((option) => (
                    <LiftTile
                      key={option.value}
                      label={option.label}
                      pressed={needs.includes(option.value)}
                      onClick={() => toggleNeed(option.value)}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-6 flex flex-col gap-5">
              <div className={cn("flex flex-col gap-2", fieldOpenClass)}>
                <label htmlFor={ID.brief} className={labelClass}>
                  {planner.briefLabel}
                </label>
                <textarea
                  id={ID.brief}
                  rows={5}
                  maxLength={MAX_BRIEF_CHARS}
                  value={brief}
                  onChange={(e) =>
                    setBrief(e.target.value.slice(0, MAX_BRIEF_CHARS))
                  }
                  onBlur={() => setBriefTouched(true)}
                  placeholder={planner.briefPlaceholder}
                  className={`${fieldClass} min-h-[8.5rem] resize-y py-3`}
                />
                <p className={cn(fieldHelperClass, "tabular-nums")}>
                  {brief.length.toLocaleString("en-GB")} /{" "}
                  {MAX_BRIEF_CHARS.toLocaleString("en-GB")}
                </p>
                {briefTouched && !briefOk ? (
                  <p className={cn(fieldHelperClass, "mt-1")}>
                    {planner.errorBriefShort}
                  </p>
                ) : null}
              </div>
              <fieldset
                className={cn(
                  "min-w-0 border-0 p-0",
                  hasBriefOpen ? fieldOpenClass : fieldQuietClass,
                )}
              >
                <legend id={ID.hasBriefLegend} className={legendClass}>
                  {planner.hasBriefLabel}
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              </fieldset>
              <div className={hasBriefOpen ? fieldOpenClass : fieldQuietClass}>
                <BookLinks
                  links={links}
                  onChange={setLinks}
                  max={5}
                  needsAccess={needsAccess}
                  onNeedsAccessChange={setNeedsAccess}
                  accessNote={accessNote}
                  onAccessNoteChange={setAccessNote}
                  showErrors={showLinkErrors}
                  idPrefix={ID.linkPrefix}
                />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <form
              id={ID.finish}
              className="mt-6 flex flex-col gap-5"
              onSubmit={onFinish}
              noValidate
              autoComplete="off"
            >
              <div className={cn("flex flex-col gap-2", fieldOpenClass)}>
                <label htmlFor={ID.name} className={labelClass}>
                  {planner.nameLabel}
                </label>
                <input
                  id={ID.name}
                  name="brief-visitor-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  onBlur={(e) => {
                    if (e.currentTarget.value !== name) {
                      onNameChange(e.currentTarget.value);
                    }
                    setTouched4((current) => ({ ...current, name: true }));
                  }}
                  aria-invalid={show4Error("name") && !nameOk}
                  aria-describedby={
                    show4Error("name") && !nameOk ? ID.nameError : undefined
                  }
                  className={fieldClass}
                />
                {show4Error("name") && !nameOk ? (
                  <p id={ID.nameError} className={fieldErrorClass} role="alert">
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
                <label htmlFor={ID.email} className={labelClass}>
                  {planner.emailLabel}
                </label>
                <input
                  ref={emailInputRef}
                  id={ID.email}
                  name="brief-visitor-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  onBlur={(e) => {
                    if (e.currentTarget.value !== email) {
                      onEmailChange(e.currentTarget.value);
                    }
                    setTouched4((current) => ({ ...current, email: true }));
                  }}
                  aria-invalid={show4Error("email") && !emailOk}
                  aria-describedby={
                    [
                      show4Error("email") && !emailOk ? ID.emailError : null,
                      emailSuggestion ? ID.emailSuggestion : null,
                    ]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  className={fieldClass}
                />
                {show4Error("email") && !emailOk ? (
                  <p id={ID.emailError} className={fieldErrorClass} role="alert">
                    {bookPage.errorEmailFormat}
                  </p>
                ) : null}
                {emailSuggestion ? (
                  <p id={ID.emailSuggestion} className={fieldHelperClass}>
                    {bookPage.emailSuggestion.split("{suggestion}")[0]}
                    <button
                      type="button"
                      className={suggestionMailtoClass}
                      onClick={applyEmailSuggestion}
                    >
                      {emailSuggestion}
                    </button>
                    {bookPage.emailSuggestion.split("{suggestion}")[1]}
                  </p>
                ) : null}
                <p
                  id={ID.emailSuggestionLive}
                  className="sr-only"
                  aria-live="polite"
                >
                  {emailSuggestionLive}
                </p>
              </div>
              <div
                className={cn(
                  "flex flex-col gap-2",
                  companyOpen ? fieldOpenClass : fieldQuietClass,
                )}
              >
                <label htmlFor={ID.company} className={labelClass}>
                  {planner.companyLabel}{" "}
                  <span className="text-syn-comment normal-case tracking-normal">
                    {planner.companyOptional}
                  </span>
                </label>
                <input
                  id={ID.company}
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
                <label htmlFor={ID.heard} className={labelClass}>
                  {planner.howHeardLabel}
                </label>
                <select
                  id={ID.heard}
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
                      ? ID.heardError
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
                  <p id={ID.heardError} className={fieldErrorClass} role="alert">
                    {planner.errorHowHeard}
                  </p>
                ) : null}
              </div>
            </form>
          ) : null}

          <div className="mt-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className={cn(navBtn, "bg-transparent")}
                disabled={step === 1}
                onClick={onBack}
              >
                {planner.backLabel}
              </button>
              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  className={cn(
                    navBtn,
                    "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-on-tint",
                  )}
                  disabled={!primaryReady}
                  onMouseDown={onNextMouseDown}
                  onClick={onNext}
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
                <>
                  <button
                    type="submit"
                    form={ID.finish}
                    className={cn(
                      navBtn,
                      "bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-on-tint",
                    )}
                  >
                    <span className="relative z-10">{planner.submitLabel}</span>
                    {finishReady ? (
                      <>
                        <span aria-hidden="true" className="spray-shine-wash" />
                        <span aria-hidden="true" className="spray-shine-edge" />
                      </>
                    ) : null}
                  </button>
                  <BookCopyEmail />
                </>
              )}
            </div>
            {step === TOTAL_STEPS ? (
              <p className={fieldHelperClass}>{planner.submitHelper}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
