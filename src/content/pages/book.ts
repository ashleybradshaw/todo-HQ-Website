/**
 * Book page copy.
 * // TEST COPY
 */

export const bookPage = {
  // TEST COPY
  seo: {
    title: "Book Team",
    description:
      "Book //TODO Engineering — tell product and engineering leads what has to ship. Contact strip, project planner, and FAQ for coffee or hard talk.",
  },
  eyebrow: "// Book",
  title: "Bring the factory to the problem.",
  /** @deprecated Prefer bookPage.seo.description */
  metaDescription:
    "Book //TODO Engineering — tell product and engineering leads what has to ship. Contact strip, project planner, and FAQ for coffee or hard talk.",
  lede: "//TODO Engineering works with product and engineering leads who need AI workflow architecture or a full-stack application in production. Tell us what has to ship.",
  pathLead: "Two ways in. Pick the one that fits.",

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
      helper: "About 3 minutes. Four steps, so our first call starts with a real brief.",
      hash: "brief",
    },
  },

  howHeardOptions: [
    { value: "referral", label: "Referral" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "x", label: "X" },
    { value: "roster", label: "Roster product" },
    { value: "conference", label: "Conference" },
    { value: "other", label: "Other" },
  ] as const,

  links: {
    label: "Links (optional)",
    /** Pre-brief default. Quick note passes helperQuick. */
    helper: "Deck, Figma, Drive, GitHub, Notion, a live site. Up to 5.",
    helperQuick: "Deck, Figma, Drive, GitHub, Notion, a live site. Up to 3.",
    urlError: "Enter a web link (https://…)",
    namePlaceholder: "Pitch deck",
    nameLabel: "Name (optional)",
    addLabel: "+ Add link",
  },

  access: {
    label: "Some of these need access",
    helper:
      "Set Drive or Figma to 'anyone with the link can view', or share access with team@todo.engineering. Never paste passwords here. If you need to share one, send it separately.",
    noteLabel: "How do we get in?",
  },

  panel: {
    opened: {
      title: "Your draft is ready",
      // TEST COPY: reply time for Ashley to confirm
      body: "Check your email app and press Send. We reply within 2 working days.",
    },
    tooLong: {
      title: "Your draft is too long to open",
      body: "Some email apps cut long drafts short. Copy it and paste it into a new email to team@todo.engineering.",
    },
    copyDraftLabel: "Copy email text",
    copyDraftDone: "Copied ✓",
    editLabel: "Edit details",
    previewLabel: "What's in your draft",
  },

  copyEmail: {
    buttonLabel: "Copy email",
    copiedLabel: "Copied ✓",
    liveCopied: "Email address copied",
    liveFallback: "Press Ctrl or Cmd + C to copy",
  },

  contact: {
    eyebrow: "// Quick note",
    title: "Start with a short note.",
    intro:
      "Name, email, and what has to ship. We turn it into an email draft you can check and send.",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    phoneOptional: "(optional)",
    callbackLabel: "Best time to call back",
    callbackOptional: "(optional, UK)",
    callbackOptions: [
      { value: "morning", label: "Morning" },
      { value: "afternoon", label: "Afternoon" },
      { value: "evening", label: "Evening" },
    ] as const,
    howHeardLabel: "How did you hear about TODO?",
    howHeardPlaceholder: "Select one",
    messageLabel: "Message",
    submitLabel: "Create email draft →",
    submitHelper:
      "Opens your email app with everything filled in. Nothing is sent until you press Send.",
    subjectPrefix: "Book //TODO —",
    bodyHeading: "Message:",
    mediaLabel: "Still · contact",
    errorNameShort: "Name needs at least 2 characters.",
    errorEmailInvalid: "Enter a valid email.",
    errorHowHeard: "Pick how you found us.",
    errorMessageShort: "Message needs a bit more — about a sentence.",
    coffeePrefill:
      "Coffee talk (15 min) — chemistry check. Looking to see if this is a fit.",
    hardTalkPrefill:
      "Hard talk (60 min) — dig into the real issue and scope the fix. What has to ship:",
  },

  planner: {
    eyebrow: "// Pre-brief",
    title: "Scope the next lap.",
    intro:
      "Four short steps. We turn the answers into a mail draft so the first conversation starts with a real brief.",
    backLabel: "Back",
    nextLabel: "Next →",
    submitLabel: "Create email draft →",
    submitHelper:
      "Opens your email app with everything filled in. Nothing is sent until you press Send.",
    subjectPrefix: "Planner //TODO —",
    errorNameShort: "Name needs at least 2 characters.",
    errorEmailInvalid: "Enter a valid email.",
    errorHowHeard: "Pick how you found us.",
    errorBriefShort: "A few more words help — at least three.",
    steps: [
      {
        id: "booking",
        title: "What are you booking?",
        hint: "Pick the door that fits. We can always retarget on the call.",
        mediaLabel: "Still · step 1",
      },
      {
        id: "scope",
        title: "Scope signals",
        hint: "Timeline, budget band, and what the floor needs to own.",
        mediaLabel: "Still · step 2",
      },
      {
        id: "brief",
        title: "Brief",
        hint: "Name the outcome. Add links if you have them. No files needed.",
        mediaLabel: "Still · step 3",
      },
      {
        id: "contact",
        title: "Contact",
        hint: "Where we send the reply and how you found the factory.",
        mediaLabel: "Still · step 4",
      },
    ] as const,
    bookingOptions: [
      { value: "coffee", label: "Coffee talk (15)" },
      { value: "hard-talk", label: "Hard talk (60)" },
      { value: "full-build", label: "Full build" },
      { value: "agent-workflow", label: "Agent / workflow system" },
      { value: "not-sure", label: "Not sure" },
    ] as const,
    timelineOptions: [
      { value: "asap", label: "ASAP" },
      { value: "this-quarter", label: "This quarter" },
      { value: "exploring", label: "Exploring" },
    ] as const,
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
    briefPlaceholder: "Outcome, constraint, and the gate that cannot be faked.",
    hasBriefLabel: "Got a brief?",
    hasBriefYes: "Yes",
    hasBriefNo: "Not yet",
    nameLabel: "Name",
    emailLabel: "Email",
    companyLabel: "Company",
    companyOptional: "(optional)",
    howHeardLabel: "How did you hear about TODO?",
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
      howHeard: "How heard:",
    },
  },
} as const;
