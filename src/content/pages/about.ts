export const STAT_MOCKS = [
  { figure: "$50B+", label: "Pipeline value", source: "// modeled capacity" },
  {
    figure: "500M+",
    label: "Requests through the floor",
    source: "// production traffic",
  },
  { figure: "50+", label: "Production handoffs", source: "// roster + clients" },
] as const;

/** Simulated floor telemetry — panel titled // FLOOR SIM; not real analytics. */
export const LIVE_FLOOR_SIM = [
  {
    id: "api-min",
    label: "api/min",
    min: 120,
    max: 480,
    step: 12,
    format: "int",
  },
  {
    id: "agents-on",
    label: "agents on",
    min: 4,
    max: 18,
    step: 1,
    format: "int",
  },
  {
    id: "mcp-calls",
    label: "mcp calls",
    min: 80,
    max: 320,
    step: 8,
    format: "int",
  },
  {
    id: "tokens",
    label: "tokens",
    min: 120_000,
    max: 980_000,
    step: 12_000,
    format: "compact",
  },
  {
    id: "tools-hot",
    label: "tools hot",
    min: 2,
    max: 14,
    step: 1,
    format: "int",
  },
  {
    id: "shipped",
    label: "shipped",
    min: 1,
    max: 9,
    step: 1,
    format: "int",
  },
  {
    id: "queue",
    label: "queue",
    min: 0,
    max: 24,
    step: 1,
    format: "int",
  },
  {
    id: "gate-passes",
    label: "gate passes",
    min: 6,
    max: 42,
    step: 2,
    format: "int",
  },
] as const;

export type LiveFloorMetric = (typeof LIVE_FLOOR_SIM)[number];
export type LiveFloorFormat = LiveFloorMetric["format"];

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
    media: [
      {
        src: "/about/origin-01.webp",
        alt: "Two helmeted founders in black tie counting cash in a helicopter over a city skyline",
      },
      {
        src: "/about/origin-02.webp",
        alt: "Helmeted founder in black tie at a desk as a money counter sprays notes",
      },
    ],
  },
  operatingRules: {
    eyebrow: "// OPERATING",
    title: "How the factory runs.",
    mediaLabel: "Floor",
    media: [
      {
        src: "/about/operating-01.webp",
        alt: "Helmeted founder at a Wall St Chronicle desk buried in banknotes",
      },
      {
        src: "/about/operating-02.webp",
        alt: "Two helmeted founders in black tie holding whisky glasses in a wood-panelled club",
      },
    ],
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
    eyebrow: "// CLOSE",
    title: "Bring the factory to the next problem.",
    subtitle: "Clear start. Quiet process. Paper when it matters.",
    body: "We sign NDAs when you need them. A budget range in mind keeps scope honest — we don’t do price theater.",
    ctaLabel: "Work Together",
    ctaHref: "/book",
    secondary: { href: "/work", label: "See our work" },
  },
} as const;
