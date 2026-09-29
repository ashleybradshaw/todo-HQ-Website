/**
 * /home IDE surface copy.
 * // TEST COPY
 */

import type { ProjectStatus } from "@/lib/projects";

// TEST COPY
export const homePage = {
  // TEST COPY
  seo: {
    title: "AI product engineering factory", // TEST COPY
    description:
      "Two engineers and AI agents run one line from hard problem to shipped product: apps, systems and hardware. Human checkpoints. RepDaily is live.", // TEST COPY
  },

  // TEST COPY — /home Open Graph + Twitter card
  og: {
    title: "Hard problems in. Working software out.", // TEST COPY
    subtitle:
      "A small product factory: two engineers, AI agents, five human checkpoints.", // TEST COPY
  },

  // TEST COPY
  landmarks: {
    editorAria: "Editor", // TEST COPY
    sidecarAria: "Shift log and projects", // TEST COPY
  },

  // TEST COPY — page hero above the IDE
  hero: {
    h1: "Hard problems in. Working software out.", // TEST COPY
    /** Two block lines; line 2 can wrap after "Working" on small viewports. */
    h1Lines: ["Hard problems in.", "Working software out."] as const, // TEST COPY
    h1Line2: {
      word: "Working", // TEST COPY
      rest: "software out.", // TEST COPY — kept nowrap so "out." never stands alone
    },
    lead: "The AI Design and Engineering Product Factory.", // TEST COPY
    primaryCta: { label: "About the factory", href: "/about" }, // TEST COPY
    secondaryCta: { label: "See the work", href: "/work" }, // TEST COPY
    /** Soft axis labels for the hero flow field. */
    flowIn: "in", // TEST COPY
    flowOut: "out", // TEST COPY
  },

  // TEST COPY — three-column feature strip
  strip: {
    aria: "What comes off the line", // TEST COPY
    items: [
      {
        title: "Apps", // TEST COPY
        body: "Shipped apps for iOS, Android and web. Not demos.", // TEST COPY
      },
      {
        title: "Systems", // TEST COPY
        body: "The CMS and internal tools your team runs on.", // TEST COPY
      },
      {
        title: "Hardware", // TEST COPY
        body: "Products that pair with devices over BLE, with edge AI.", // TEST COPY
      },
    ],
  },

  // TEST COPY — contained IDE chrome
  chrome: {
    aria: "IDE window", // TEST COPY
    pathAria: "File path", // TEST COPY
    pathRoot: "todo-hq", // TEST COPY
    pathFolder: "content", // TEST COPY
    pathSeparator: "›", // TEST COPY
    statusBranch: "main", // TEST COPY
    languageByTab: {
      todo: "Markdown", // TEST COPY
      offer: "Markdown", // TEST COPY
      discovery: "TypeScript", // TEST COPY
    },
    /** {n} = 1-based padded stage index, {total} = stage count. */
    pipelineLabel: "checkpoint {n}/{total}", // TEST COPY
    agentsPrefix: "agents (sim)", // TEST COPY
    /** {n} = total line count in the pane. */
    showAllLines: "Show all {n} lines", // TEST COPY
    showFewerLines: "Show fewer lines", // TEST COPY
  },

  // TEST COPY — README.md content (rendered as source code in the editor)
  todoHq: {
    fileComment:
      "<!-- designed by devs. built by designers. don't tell the linter. -->", // TEST COPY
    hook: "todo-hq", // TEST COPY
    whoWeAre:
      "One design engineer and one backend and AI engineer, working with agents.", // TEST COPY
    whatWeDoBest: "We run a small product factory. Every build goes down the same line.", // TEST COPY
    primaryCta: { label: "About", href: "/about" }, // TEST COPY
    secondaryCta: { label: "Blog", href: "/blog" }, // TEST COPY

    whatWeBuildHeading: "Output", // TEST COPY
    whatWeBuild: [
      "Apps, systems and hardware-connected products. Specs in services.md.", // TEST COPY
    ],

    whoWeShipForHeading: "Who it's for", // TEST COPY
    whoWeShipFor: [
      "Enterprise and regulated teams.", // TEST COPY  [NEEDS: sectors to name, if any]
      "The problems that take a whole meeting just to explain.", // TEST COPY
    ],

    howWeWorkHeading: "How we work", // TEST COPY
    howWeWork: [
      "On your line: inside your stack, with your team", // TEST COPY
      "On ours: end to end, signed off at each checkpoint", // TEST COPY
    ],

    pipelineHeading: "The line", // TEST COPY
    pipelineIntro:
      "Five checkpoints, same order, every build. Our own products go first.", // TEST COPY
    pipeline: [
      { fn: "findMoment()", line: "Find the moment worth building." }, // TEST COPY
      { fn: "checkMarket()", line: "Check the market. Someone has to want it." }, // TEST COPY
      { fn: "shipMvp()", line: "Ship the MVP, a homepage and light marketing." }, // TEST COPY
      { fn: "buildInPublic()", line: "Build v1.5 in public." }, // TEST COPY
      { fn: "parkOrPush()", line: "No users: parked. Users: back on the line." }, // TEST COPY
    ],
    methodologyAria: "runLine(): replay the shift log", // TEST COPY
    methodologyLabel: "runLine()", // TEST COPY

    inProductionHeading: "On the line", // TEST COPY
    /** Table rows derived from PROJECTS; these are the column headers and labels. */
    inProductionColumns: { project: "Product", status: "Status" }, // TEST COPY
    inProductionStatus: {
      shipped: "Shipped", // TEST COPY
      live: "Live", // TEST COPY
      building: "In build", // TEST COPY
      pipeline: "In pipeline", // TEST COPY
    } satisfies Record<ProjectStatus, string>,
    /** Optional per-slug detail; falls back to inProductionStatus. */
    inProductionDetail: {
      repdaily: "Live on the App Store and Google Play", // TEST COPY
      readygo: "MVP in build", // TEST COPY
    } as Record<string, string>,
    /** Kept for sr-only / schema sync; the table is derived from PROJECTS. */
    inProduction: ["RepDaily", "ReadyGo", "Contentic"], // TEST COPY

    promise: "Build from understanding, not assumptions.", // TEST COPY
  },

  // TEST COPY — services.md
  offer: {
    fileComment: "# services.md", // TEST COPY
    ourOfferHeading: "What comes off the line", // TEST COPY
    ourOfferBody:
      "Apps, systems and hardware-connected products, designed and coded by the same two people. No handover gap between the design file and production.", // TEST COPY
    services: [
      { name: "Apps", line: "iOS, Android and web. First screen to store release." }, // TEST COPY
      { name: "Systems", line: "CMS and internal software for content, data and operations." }, // TEST COPY
      { name: "Hardware", line: "Apps that pair over BLE and run models at the edge." }, // TEST COPY
      {
        name: "AI",
        line: "Agents do one job each, with human QC before anything ships.",
      }, // TEST COPY
    ],
    howWeWorkHeading: "How a build runs", // TEST COPY
    howWeWorkSteps: [
      "Hard talk. We take the domain apart and find the part that matters.", // TEST COPY
      "Spec and checkpoints agreed before work starts. NDA first if you need one.", // TEST COPY
      "Design and code in one pass. Figma to production.", // TEST COPY
      "QC at each checkpoint. It ships when you sign off.", // TEST COPY
      "Hand over, or keep building.", // TEST COPY  [NEEDS: handover terms (repo ownership, docs)]
    ],
    stackHeading: "Tooling", // TEST COPY
    stackAria: "Tooling", // TEST COPY
    /** Tool ids match StackIconRow STACK ids and /public/stack/*.svg. Empty groups don't render. */
    stackGroups: [
      { id: "design", label: "Design", tools: ["figma"] }, // TEST COPY
      {
        id: "build",
        label: "Build",
        tools: ["cursor", "openai", "claude", "swift", "xcode", "android", "nodejs"],
      }, // TEST COPY
      { id: "data", label: "Data", tools: ["postgresql", "redis"] }, // TEST COPY
      { id: "ship", label: "Ship", tools: ["vercel", "github", "docker"] }, // TEST COPY
      { id: "hardware", label: "Hardware", tools: [] as string[] }, // TEST COPY  [NEEDS: BLE / edge AI tools to show as icons]
    ],
    proofHeading: "Proof", // TEST COPY
    proofLine:
      "RepDaily: designed and built by two people in 103 days.", // TEST COPY
    cta: { label: "Talk it through →", href: "/book" }, // TEST COPY
  },

  // TEST COPY — book.ts (mini /book)
  discovery: {
    fileComment: "// book.ts: two ways in. pick one.", // TEST COPY
    heading: "Bring us the hard problem.", // TEST COPY
    codeExport: "export const book = {",
    codeKeys: { length: "length", vibe: "for", nda: "nda", email: "email" },
    coffee: {
      length: "15 min", // TEST COPY
      vibe: "fit check", // TEST COPY
      cardTitle: "Coffee call (15 min)", // TEST COPY
      cardSub: "A quick chat to see if we're a fit. No deck needed.", // TEST COPY
      cta: "Book a coffee call →", // TEST COPY
    },
    hardTalk: {
      length: "60 min", // TEST COPY
      vibe: "the real problem", // TEST COPY
      cardTitle: "Hard talk (60 min)", // TEST COPY
      cardSub: "Dig into the real issue, scope the fix.", // TEST COPY
      cta: "Book a hard talk →", // TEST COPY
    },
    nda: "Need an NDA? Send it first. We sign before you share.", // TEST COPY
    /** Render only when non-empty. */
    reply: "", // TEST COPY  [NEEDS: reply time] e.g. "An engineer reads it and replies within N working days."
    briefLink: { label: "Or send a written brief →", href: "/book#brief" }, // TEST COPY
  },

  // TEST COPY
  ideTabs: {
    aria: "Homepage sections", // TEST COPY
    tabs: {
      todo: "README.md", // TEST COPY
      offer: "services.md", // TEST COPY
      discovery: "book.ts", // TEST COPY
    },
  },

  // TEST COPY
  statusStrip: {
    ariaPrefix: "Editor status: ", // TEST COPY
    /** Live position; {line} and {col} are replaced at runtime. */
    lnCol: "Ln {line}, Col {col}",
    utf8: "UTF-8",
  },

  // TEST COPY
  projectCards: {
    sectionAria: "Projects", // TEST COPY
    header: "on the line", // TEST COPY
    viewLink: "View", // TEST COPY
    items: [
      {
        slug: "repdaily",
        name: "RepDaily",
        blurb: "Camera push-up tracking. Live on iOS and Android.", // TEST COPY
      },
      {
        slug: "readygo",
        name: "ReadyGo",
        blurb: "Pre-ride and pre-run planning. MVP now in build.", // TEST COPY
      },
      {
        slug: "contentic",
        name: "Contentic",
        blurb: "Content ops for intake, review and publish. Live.", // TEST COPY
      },
    ],
  },

  // TEST COPY — sidecar telemetry panel (live); status bar keeps a quiet checkpoint chip
  telemetry: {
    sectionAria: "Factory telemetry. Agent count is a simulation.", // TEST COPY
    header: "telemetry", // TEST COPY
    keys: {
      agents: "agents (sim)", // TEST COPY
      infra: "line", // TEST COPY
      sprint: "current run", // TEST COPY
      checkpoint: "checkpoint", // TEST COPY
    },
    infra: {
      online: "ONLINE", // TEST COPY
      building: "IN BUILD", // TEST COPY
      pending: "QUEUED", // TEST COPY
    },
    status: {
      shipped: "shipped", // TEST COPY
      building: "in build", // TEST COPY
      live: "live", // TEST COPY
      pipeline: "in pipeline", // TEST COPY
    },
    rosterPrefix: "On the line: ", // TEST COPY
  },

  // TEST COPY — README outline in sidecar (lg+)
  outline: {
    sectionAria: "README outline", // TEST COPY
    header: "outline", // TEST COPY
  },

  // TEST COPY — shift.log stages
  pipelineRunner: {
    sectionAria: "Production line, five checkpoints", // TEST COPY
    header: "shift.log", // TEST COPY
    compiling: "[ AGENT_COMPILING... ]", // TEST COPY
    mode: {
      reboot: "REBOOT", // TEST COPY
      pinned: "PINNED", // TEST COPY
      live: "LIVE", // TEST COPY
    },
    rebootLogs: [
      "> RESTARTING THE LINE...", // TEST COPY
      "> clearing the last run...", // TEST COPY
      "> checkpoints ok.", // TEST COPY
    ],
    stages: [
      {
        id: "moment",
        code: "01",
        phase: "FIND",
        name: "THE_MOMENT",
        logs: ["Something should feel obvious.", "It doesn't yet."], // TEST COPY
      },
      {
        id: "check",
        code: "02",
        phase: "CHECK",
        name: "THE_MARKET",
        logs: ["Ideas: many", "People who want it: checking...", "QC: PASS"], // TEST COPY
      },
      {
        id: "mvp",
        code: "03",
        phase: "SHIP",
        name: "THE_MVP",
        logs: ["App + homepage + light marketing", "Shipping core features"], // TEST COPY
        hasProgress: true,
      },
      {
        id: "public",
        code: "04",
        phase: "BUILD",
        name: "V1.5_IN_PUBLIC",
        logs: ["Building in the open", "Watching real usage"], // TEST COPY
      },
      {
        id: "park",
        code: "05",
        phase: "DECIDE",
        name: "PARK_OR_PUSH",
        logs: ["No users → parked", "Users → back on the line"], // TEST COPY
      },
    ] as const,
  },
} as const;
