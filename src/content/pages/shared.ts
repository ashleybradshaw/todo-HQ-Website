/**
 * Shared page blocks — FAQ, Close, nav, footer, common CTAs.
 * // TEST COPY — Autumn draft; replace when signed off.
 */

// TEST COPY
export const faq = {
  eyebrow: "// FAQ",
  title: "Answers before you book.",
  jumpLabel: "Jump to contact",
  jumpHref: "#contact",
  items: [
    {
      id: "timelines",
      question: "How fast can we start?",
      // TEST COPY
      answer:
        "We reply within 3 working days, and most first calls happen within a week. Builds start after intake, once we've agreed the first checkpoint.",
    },
    {
      id: "cost",
      question: "How do you talk about cost?",
      answer:
        "We keep ranges honest. A rough budget in the Pre-brief is enough for a first pass. No inflated quotes and no surprise retainers.",
    },
    {
      id: "remote",
      question: "Do you work remotely?",
      answer:
        "Yes, remote by default. We meet in person when a decision needs everyone in the room, and the rest runs async.",
    },
    {
      id: "payment",
      question: "How does payment work?",
      answer:
        "In milestones tied to checkpoints you can check. You pay for shipped work, not hours.",
    },
    {
      id: "meetings",
      question: "What do meetings look like?",
      answer:
        "Coffee call (15 min) to see if we're a fit. Hard talk (60 min) on the real problem. Builds run on short checkpoint reviews, not weekly status calls.",
    },
    {
      id: "nda",
      question: "Can we sign an NDA?",
      answer:
        "Yes. Send it with your first note and we'll sign it before you share anything sensitive.",
    },
    {
      id: "dont",
      question: "What do you not take on?",
      answer:
        "Design polish with no route to production, open-ended discovery with no end point, and ideas that only exist as a pitch deck.",
    },
    {
      id: "ship",
      question: 'What does "ship" mean here?',
      answer:
        "Running in production with real users, not a prototype parked in staging.",
    },
  ],
} as const;

// TEST COPY
export const close = {
  eyebrow: "// CLOSE",
  title: "Got a hard problem? Bring it to us.",
  subtitle: "Clear start. Quiet process. Paper when it matters.",
  body: "Send a short note or a full brief. Either way, an engineer reads it.",
  ctaLabel: "Book a call",
  ctaHref: "/book",
  secondary: { href: "/work", label: "See our work" },
} as const;

// TEST COPY
export const nav = {
  primary: [
    { href: "/about", label: "About" },
    { href: "/work", label: "Work" },
    { href: "/blog", label: "Blog" },
    { href: "/home", label: "Home" },
    { href: "/book", label: "Book a call" },
  ],
  bookDuo: [
    {
      href: "/book?type=coffee",
      label: "Coffee call (15 min)",
      vibe: "A quick chat to see if we're a fit. No deck needed.",
    },
    {
      href: "/book?type=hard-talk",
      label: "Hard talk (60 min)",
      vibe: "Dig into the real issue, scope the fix.",
    },
  ],
} as const;

// TEST COPY
export const footer = {
  copyright: "© 2026 TODO DESIGN & ENGINEERING",
  x: "X",
  workTogether: "BOOK A CALL",
  workTogetherHref: "/book",
  privacy: "HOW WE USE YOUR DATA – PRIVACY POLICY",
  privacyHref: "/privacy",
} as const;

// TEST COPY
export const ctas = {
  sendABrief: "Send a brief",
  sendABriefHref: "/book#brief",
  bookTheTeam: "Book the team",
  bookTheTeamHref: "/book",
} as const;
