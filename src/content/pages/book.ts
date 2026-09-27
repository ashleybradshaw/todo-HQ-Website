/**
 * Book page copy.
 * // TEST COPY
 */

export const bookPage = {
  // TEST COPY
  seo: {
    title: "Book a call",
    description:
      "Bring //TODO Engineering a hard problem. Send a quick note or a four-step pre-brief, and an engineer replies within 3 working days.",
  },
  eyebrow: "// Book",
  // TEST COPY
  title: "Bring us the hard problem.",
  /** @deprecated Prefer bookPage.seo.description */
  metaDescription:
    "Bring //TODO Engineering a hard problem. Send a quick note or a four-step pre-brief, and an engineer replies within 3 working days.",
  // TEST COPY
  lede: "We work with product and engineering leads who need an app, a system or AI built and running in production. Send a short note or a proper brief. An engineer reads both.",
  pathLead: "Two ways in. Pick one.",

  // TEST COPY
  paths: {
    quick: {
      id: "quick" as const,
      label: "Quick note",
      helper: "About 30 seconds. We reply and set up a call.",
      hash: "quick",
    },
    brief: {
      id: "brief" as const,
      label: "Pre-brief",
      helper: "About 3 minutes. Four steps, so the first call starts from a real brief.",
      hash: "brief",
    },
  },

  // TEST COPY
  howHeardOptions: [
    { value: "referral", label: "Referral" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "x", label: "X" },
    { value: "roster", label: "One of our apps" },
    { value: "conference", label: "Conference" },
    { value: "other", label: "Other" },
  ] as const,

  // TEST COPY
  links: {
    label: "Links (optional)",
    /** Pre-brief default. Quick note passes helperQuick. */
    helper: "Deck, Figma, Drive, GitHub, Notion, a live site. Up to 5.",
    helperQuick: "Deck, Figma, Drive, GitHub, Notion, a live site. Up to 3.",
    urlError: "Enter a web link, like https://example.com",
    namePlaceholder: "Pitch deck",
    nameLabel: "Link name (optional)",
    addLabel: "+ Add link",
  },

  // TEST COPY
  access: {
    label: "Some of these need access",
    helper:
      "Set Drive or Figma to 'anyone with the link can view', or share with team@todo.engineering. Never paste passwords here. If we need one, send it separately.",
    noteLabel: "How do we get in?",
  },

  // TEST COPY
  panel: {
    opened: {
      title: "Your draft is ready",
      // TEST COPY: reply time
      body: "Check your email app and press Send. Nothing opened? Copy the draft text and send it to team@todo.engineering. We reply within 3 working days.",
    },
    tooLong: {
      title: "Your draft is too long to open",
      body: "Some email apps cut long drafts short. Copy the draft text and paste it into a new email to team@todo.engineering.",
    },
    copyDraftLabel: "Copy draft text",
    copyDraftDone: "Copied ✓",
    copyDraftLive: "Draft copied",
    editLabel: "Edit details",
    previewLabel: "What's in your draft",
  },

  // TEST COPY
  copyEmail: {
    buttonLabel: "Copy address",
    copiedLabel: "Copied ✓",
    liveCopied: "Email address copied",
    liveFallback: "Press Ctrl or Cmd + C to copy",
  },

  // TEST COPY
  contact: {
    eyebrow: "// Quick note",
    title: "Start with a short note.",
    intro:
      "Your name, email and a line or two on the problem. We turn it into an email draft you check and send.",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    phoneOptional: "(optional)",
    callbackLabel: "Best time to call back",
    callbackOptional: "(optional, UK time)",
    callbackOptions: [
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Evening" },
    ] as const,
    howHeardLabel: "How did you hear about us?",
    howHeardPlaceholder: "Select one",
    messageLabel: "Message",
    submitLabel: "Create email draft →",
    submitHelper:
      "Opens your email app with everything filled in. Nothing is sent until you press Send.",
    subjectPrefix: "Quick note //TODO —",
    bodyHeading: "Message:",
    errorNameShort: "Name needs at least 2 characters.",
    errorEmailInvalid: "Enter a valid email.",
    errorHowHeard: "Pick one so we know how you found us.",
    errorMessageShort: "Add a bit more. A sentence is enough.",
    coffeePrefill:
      "Coffee call (15 min). A quick chat to see if we're a fit. About us:",
    hardTalkPrefill:
      "Hard talk (60 min). Dig into the real problem and scope the fix. What has to ship:",
  },

  // TEST COPY
  planner: {
    eyebrow: "// Pre-brief",
    title: "Scope it before we talk.",
    intro:
      "Four short steps. We turn your answers into an email draft, so the first call starts with a real brief.",
    backLabel: "Back",
    nextLabel: "Next →",
    submitLabel: "Create email draft →",
    submitHelper:
      "Opens your email app with everything filled in. Nothing is sent until you press Send.",
    subjectPrefix: "Pre-brief //TODO —",
    errorNameShort: "Name needs at least 2 characters.",
    errorEmailInvalid: "Enter a valid email.",
    errorHowHeard: "Pick one so we know how you found us.",
    errorBriefShort: "Add a few more words. Three is the minimum.",
    steps: [
      {
        id: "booking",
        title: "What are you booking?",
        hint: "Pick the closest fit. We can change it on the call.",
      },
      {
        id: "scope",
        title: "Scope",
        hint: "Timeline, rough budget, and what you need from us. Pick as many needs as apply.",
      },
      {
        id: "brief",
        title: "The brief",
        hint: "What should exist when we're done? Add links if you have them. No files needed.",
      },
      {
        id: "contact",
        title: "Contact",
        hint: "Where we send the reply.",
      },
    ] as const,
    bookingOptions: [
      { value: "coffee", label: "Coffee call (15 min)" },
      { value: "hard-talk", label: "Hard talk (60 min)" },
      { value: "full-build", label: "Full build" },
      { value: "agent-workflow", label: "AI agents or workflow" },
      { value: "not-sure", label: "Not sure yet" },
    ] as const,
    timelineOptions: [
      { value: "asap", label: "As soon as possible" },
      { value: "this-quarter", label: "This quarter" },
      { value: "exploring", label: "Just exploring" },
    ] as const,
    // TEST COPY — budget bands pending master review
    budgetOptions: [
      { value: "under-25k", label: "Under £25k" },
      { value: "25-75k", label: "£25k–£75k" },
      { value: "75-150k", label: "£75k–£150k" },
      { value: "150k-plus", label: "£150k+" },
      { value: "tbd", label: "Still working it out" },
    ] as const,
    needsOptions: [
      { value: "product-ui", label: "Design the product" },
      { value: "app", label: "Build the app" },
      { value: "agents", label: "Add AI agents" },
      { value: "backend", label: "Backend and data" },
      { value: "launch-site", label: "A launch site" },
      { value: "other", label: "Something else" },
    ] as const,
    briefLabel: "What has to ship",
    briefPlaceholder: "The outcome, the constraints, and what would count as done.",
    hasBriefLabel: "Got a written brief or spec?",
    hasBriefYes: "Yes",
    hasBriefNo: "Not yet",
    nameLabel: "Name",
    emailLabel: "Email",
    companyLabel: "Company",
    companyOptional: "(optional)",
    howHeardLabel: "How did you hear about us?",
    howHeardPlaceholder: "Select one",
    // TEST COPY — email draft field prefixes
    draftLabels: {
      booking: "Booking:",
      timeline: "Timeline:",
      budget: "Budget:",
      needs: "Needs:",
      brief: "Brief:",
      name: "Name:",
      email: "Email:",
      company: "Company:",
      howHeard: "Heard via:",
    },
  },
} as const;
