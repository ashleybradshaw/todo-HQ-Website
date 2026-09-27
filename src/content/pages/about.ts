/**
 * About page copy.
 * // TEST COPY — Autumn draft; replace when signed off.
 */

import { close, faq } from "@/content/pages/shared";

export const STAT_MOCKS = [
  { figure: "£30M+", label: "Pipeline value", source: "// modeled capacity" },
  {
    figure: "100k+",
    label: "Requests through the floor",
    source: "// production traffic",
  },
  { figure: "12", label: "Products shipped", source: "// roster + clients" },
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

// TEST COPY
export const about = {
  // TEST COPY
  seo: {
    title: "About · //TODO Engineering · AI for regulated teams",
    description:
      "Two engineers who learn complex, regulated domains, then build the AI, apps and systems that run them. How we work, what we take on, FAQs.",
  },

  // TEST COPY
  hero: {
    eyebrow: "// About",
    h1: "We deconstruct complex domains and build AI that works.",
    p1: "//TODO Engineering is a design engineer and an AI engineer. We build apps, CMS and software systems, and products that talk to hardware, for specialised and regulated teams.",
    p2: "Specialised. Esoteric. Regulated. We learn the domain before we write a line, so what we ship solves the right problem and holds up after launch.",
    clientStrip: ["Acme", "Globex", "Initech", "+ more"],
  },

  // TEST COPY
  origin: {
    eyebrow: "// ORIGIN",
    title: "Our own apps came first.",
    body: [
      "RepDaily, Contentic and ReadyGo run on the same process we sell. We take the domain apart, prototype until it's clear, write the spec, then ship to production. Before any code, we map how the domain really works: who uses it, what the rules are, and where it tends to break.",
      "Client work goes through that same process, not a side desk. You get the system we already trust with our own products. At each checkpoint you get something you can use: a domain map, a working prototype, a spec your team can read, and then the build itself.",
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

  // TEST COPY
  operating: {
    eyebrow: "// OPERATING",
    title: "How the work runs.",
    intro:
      "Hard domains punish shortcuts. These rules keep us from solving the wrong problem quickly, and keep what we ship easy to live with after launch.",
    rules: [
      "Build from understanding, not assumptions.",
      "Break the problem down to its parts before we build.",
      "Prototype to learn. Every experiment leaves a deliverable.",
      "AI agents do the heavy lifting. Humans sign off irreversible steps.",
      "Backends and monitoring ship with the interface, not after.",
      "Speed, without architecture we'll have to throw away.",
      "Done means running in production, not a demo link.",
    ],
    uiLink: { href: "/ui", label: "TODO UI" },
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
  },

  // TEST COPY — shared; imported so About stays one object without duplicating strings
  faq,

  // TEST COPY
  stats: STAT_MOCKS,

  // TEST COPY
  floorSim: {
    label: "// FLOOR SIM",
    status: "LIVE",
    caption: "// simulated",
    metrics: LIVE_FLOOR_SIM,
  },

  // TEST COPY — shared
  close,
} as const;
