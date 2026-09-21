export const aboutPage = {
  eyebrow: "ABOUT //",
  title: "Most teams just write code. We build the entire factory.",
  metaDescription:
    "How //TODO Engineering operates an internal software factory — multi-agent systems, production handoff, and standards for product and engineering leads.",
  lede: [
    "//TODO Engineering designs, builds, and ships production applications, agent workflows, and backends for product and engineering teams that need systems that hold up after launch.",
    "We operate the same factory for our own roster and for client work: intake, multi-agent implementation with human gates, and a clean handoff into production.",
  ],
  standardsHeading: "Engineering standards",
  standards: [
    {
      label: "01",
      title: "Internal software factory",
      body: "Repeatable process, not one-off freelance. The same production system that ships our apps is the system we run for clients.",
    },
    {
      label: "02",
      title: "Multi-agent systems",
      body: "AI workflow architecture is a core capability: autonomous agents, orchestrated pipelines, and human-in-the-loop gates where the work demands it.",
    },
    {
      label: "03",
      title: "Production, not prototypes",
      body: "We design, build, and ship applications that hold up in production — backends included. Velocity without a disposable architecture.",
    },
  ],
  factoryHeading: "The factory",
  factoryProof:
    "Proof is in production: RepDaily, ReadyGo, and Contentic. The same roster, the same pipeline — available to product and engineering leads who need the work to ship.",
  ctas: [
    { href: "/work", label: "[ Work ]" },
    { href: "/book", label: "[ Book Team ]" },
    { href: "/home", label: "[ Factory ]" },
  ],
} as const;
