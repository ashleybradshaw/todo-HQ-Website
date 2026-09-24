export const bookPage = {
  eyebrow: "// Book",
  title: "Bring the factory to the problem.",
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

  contact: {
    eyebrow: "// Quick note",
    title: "Start with a short note.",
    intro:
      "Name, email, and what has to ship. Opens your mail client with a draft — or write the team directly.",
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
    submitLabel: "Open mail draft →",
    composeHint: "If nothing opened, use the email link above.",
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
    submitLabel: "Open planner draft →",
    composeHint: "If nothing opened, copy the summary below or email the team directly.",
    successLabel: "Draft ready",
    subjectPrefix: "Planner //TODO —",
    errorNameShort: "Name needs at least 2 characters.",
    errorEmailInvalid: "Enter a valid email.",
    errorHowHeard: "Pick how you found us.",
    errorBriefShort: "Brief needs a bit more — about a sentence.",
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
        hint: "Name the outcome. A brief helps — a file upload is not required.",
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
    dropzoneLabel: "Drop a brief here later",
    dropzoneHint: "Placeholder only — no upload on this pass. Attach files in the mail draft.",
    nameLabel: "Name",
    emailLabel: "Email",
    companyLabel: "Company",
    companyOptional: "(optional)",
    howHeardLabel: "How did you hear about TODO?",
    howHeardPlaceholder: "Select one",
  },

  faq: {
    eyebrow: "// FAQ",
    title: "Answers before you book.",
    jumpLabel: "Jump to contact",
    jumpHref: "#contact",
    items: [
      {
        id: "timelines",
        question: "How fast can we start?",
        answer:
          "Coffee and hard talks book within a week when the calendar is open. Full builds start after intake — we name the first gate before agents touch the stack.",
      },
      {
        id: "cost",
        question: "How do you talk about cost?",
        answer:
          "We keep ranges honest. A budget band in the planner is enough for a first pass; we do not do price theater or surprise retainers.",
      },
      {
        id: "remote",
        question: "Do you work remote?",
        answer:
          "Yes. The factory runs remote by default. We meet when a gate needs faces in the room; otherwise the stations stay async.",
      },
      {
        id: "payment",
        question: "How does payment work?",
        answer:
          "Milestones tied to gates you can verify. Invoices track shipped work, not hours spent in a chatbot.",
      },
      {
        id: "meetings",
        question: "What do meetings look like?",
        answer:
          "Coffee is a chemistry check. Hard talk is a 60-minute dig into the real issue. Build work uses short gate reviews, not weekly status theater.",
      },
      {
        id: "nda",
        question: "Can we sign an NDA?",
        answer:
          "Yes when you need one. Send the paper with the first note and we route it before any sensitive brief leaves your side.",
      },
      {
        id: "dont",
        question: "What do you not take on?",
        answer:
          "One-off design polish with no ship path, endless discovery without a gate, and work that only exists as a pitch deck. We build systems that leave the floor.",
      },
      {
        id: "ship",
        question: "What does “ship” mean here?",
        answer:
          "A build that runs in production with real users on the other side of the glass — not a prototype parked in a staging folder.",
      },
    ] as const,
  },
} as const;
