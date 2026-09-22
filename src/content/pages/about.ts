export const STAT_MOCKS = [
  { figure: "$50B+", label: "Pipeline value" },
  { figure: "500M+", label: "Requests through the floor" },
  { figure: "50+", label: "Production handoffs" },
] as const;

export const aboutPage = {
  eyebrow: "// About",
  title: "Most teams just write code. We build the entire factory.",
  metaDescription:
    "How //TODO Engineering operates an internal software factory — multi-agent systems, production handoff, and standards for product and engineering leads.",
  lede: [
    "//TODO Engineering designs, builds, and ships production applications, agent workflows, and backends for product and engineering teams that need systems that hold up after launch.",
    "We operate the same factory for our own roster and for client work: intake, multi-agent implementation with human gates, and a clean handoff into production.",
  ],
  clientPlaceholders: ["Acme", "Globex", "Initech", "+ more"],
  origin: {
    eyebrow: "// ORIGIN",
    title: "The factory came first.",
    body: [
      "The roster shipped on one pipeline before any client work did. Intake, multi-agent implementation, and a production handoff — the same sequence, every time.",
      "Client work runs that factory, not a side desk. Product and engineering leads get the system we already use to ship our own apps.",
    ],
    /** TEMP — replace with final origin still */
    mediaSrc: "/about/origin-test.webp",
    mediaAlt: "Origin — temporary still",
  },
  operatingRules: {
    eyebrow: "// OPERATING",
    title: "How the factory runs.",
    mediaLabel: "Floor",
    /** TEMP — same pilot still as origin; replace with floor plate */
    mediaSrc: "/about/origin-test.webp",
    mediaAlt: "Floor — temporary still",
    rules: [
      "One pipeline for roster and client work — no side desk.",
      "Intake before agents. Clarify the ship target, then open the floor.",
      "Multi-agent implementation with human gates on irreversible steps.",
      "Production handoff is the exit criterion — not a demo URL.",
      "Backends and observability ship with the surface, not after.",
      "Velocity without disposable architecture.",
      "Proof stays in the roster: apps that hold up after launch.",
    ],
  },
  stats: STAT_MOCKS,
  workTogether: {
    title: "Bring the factory to the next problem.",
    ctaLabel: "Work Together",
    ctaHref: "/book",
    secondary: { href: "/work", label: "[ Work ]" },
  },
} as const;
