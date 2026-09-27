/**
 * /home IDE surface copy.
 * // TEST COPY
 */

import type { ProjectStatus } from "@/lib/projects";

// TEST COPY
export const homePage = {
  // TEST COPY
  seo: {
    title: "Design and AI engineering studio", // TEST COPY
    description:
      "Two engineers who design and build apps, CMS and software systems, and hardware-connected products for regulated teams. RepDaily is live. Book a call.", // TEST COPY
  },

  // TEST COPY
  landmarks: {
    editorAria: "Editor", // TEST COPY
    sidecarAria: "Pipeline and projects", // TEST COPY
  },

  // TEST COPY — page hero above the IDE
  hero: {
    h1: "Hard problems in. Working software out.", // TEST COPY
    lead: "We take complex domains apart and build what runs them.", // TEST COPY
    primaryCta: { label: "Learn about us", href: "/about" }, // TEST COPY
    secondaryCta: { label: "See the work", href: "/work" }, // TEST COPY
  },

  // TEST COPY — three-column feature strip
  strip: {
    items: [
      {
        title: "Apps", // TEST COPY
        body: "iOS, Android and web — first screen to store release.", // TEST COPY
      },
      {
        title: "Systems", // TEST COPY
        body: "CMS and internal software for content, data and operations.", // TEST COPY
      },
      {
        title: "How we ship", // TEST COPY
        body: "Design and code in one pass. Checkpoints you sign off.", // TEST COPY
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
    statusBranch: "⎇ main", // TEST COPY
    statusProblems: "⊘ 0 ⚠ 0", // TEST COPY
    language: "TypeScript", // TEST COPY
    pipelineDot: "●", // TEST COPY
    /** {n} = 1-based padded stage index, {total} = stage count. */
    pipelineLabel: "pipeline {n}/{total}", // TEST COPY
    agentsPrefix: "agents", // TEST COPY
  },

  // TEST COPY — README.md content (rendered as source code in the editor)
  todoHq: {
    fileComment:
      "<!-- designed by devs. built by designers. don't tell the linter. -->", // TEST COPY
    hook: "Hard problems in. Working software out.", // TEST COPY
    whoWeAre:
      "//TODO Engineering is two engineers, one design and one backend and AI, working with agents.", // TEST COPY
    whatWeDoBest: "We take complex domains apart and build what runs them.", // TEST COPY
    primaryCta: { label: "Book a call", href: "/book" }, // TEST COPY
    secondaryCta: { label: "See the work", href: "/work" }, // TEST COPY

    whatWeBuildHeading: "What we build", // TEST COPY
    whatWeBuild: [
      "Apps for iOS, Android and web", // TEST COPY
      "CMS and software systems that run the operation", // TEST COPY
      "Products that talk to hardware (BLE, edge AI)", // TEST COPY
    ],

    whoWeShipForHeading: "Who it's for", // TEST COPY
    whoWeShipFor: [
      "Enterprise and regulated teams.", // TEST COPY  [NEEDS: sectors to name, if any]
      "The problems that take a whole meeting just to explain.", // TEST COPY
    ],

    howWeWorkHeading: "How we work", // TEST COPY
    howWeWork: [
      "Inside your stack, with your team", // TEST COPY
      "Or end to end, signed off at each checkpoint", // TEST COPY
    ],

    pipelineHeading: "How it runs", // TEST COPY
    pipelineIntro:
      "Every product we ship goes through the same five checkpoints. Our own apps go first.", // TEST COPY  [NEEDS: confirm client builds use the same checkpoints]
    pipeline: [
      { fn: "findMoment()", line: "Spot the moment worth building." }, // TEST COPY
      { fn: "checkMarket()", line: "Ideate, then check someone actually wants it." }, // TEST COPY
      { fn: "shipMvp()", line: "MVP, homepage and light marketing, out the door." }, // TEST COPY
      { fn: "buildInPublic()", line: "v1.5, in the open." }, // TEST COPY
      { fn: "parkOrPush()", line: "No users, it's parked. Users, it's back on." }, // TEST COPY
    ],
    methodologyAria: "runPipeline(): replay the pipeline graph", // TEST COPY
    methodologyLabel: "runPipeline()", // TEST COPY

    inProductionHeading: "In production", // TEST COPY
    /** Table rows derived from PROJECTS; these are the column headers and labels. */
    inProductionColumns: { project: "Project", status: "Status" }, // TEST COPY
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
    ourOfferHeading: "What we build", // TEST COPY
    ourOfferBody:
      "Apps, systems and hardware-connected products, designed and coded by the same two people. No handover gap between the design file and production.", // TEST COPY
    services: [
      { name: "Apps", line: "iOS, Android and web. First screen to store release." }, // TEST COPY
      { name: "Systems", line: "CMS and internal software for content, data and operations." }, // TEST COPY
      { name: "Hardware", line: "Apps that pair over BLE and run models at the edge." }, // TEST COPY
      {
        name: "AI",
        line: "Agents and workflows that do one job, with a human checkpoint before anything ships.",
      }, // TEST COPY
    ],
    howWeWorkHeading: "How a build runs", // TEST COPY
    howWeWorkSteps: [
      "Hard talk. We take the domain apart and find the part that matters.", // TEST COPY
      "Scope and checkpoints, agreed before work starts. NDA first if you need one.", // TEST COPY
      "Design and code in one pass. Figma to production.", // TEST COPY
      "Ship at a checkpoint you sign off.", // TEST COPY
      "Hand over, or keep building.", // TEST COPY  [NEEDS: handover terms (repo ownership, docs)]
    ],
    stackHeading: "Toolkit", // TEST COPY
    stackAria: "Toolkit", // TEST COPY
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
      "RepDaily is live on the App Store and Google Play. Same process, same two people.", // TEST COPY
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
    header: "projects", // TEST COPY
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
        blurb: "Pre-activity planning for runners and cyclists. MVP in build.", // TEST COPY
      },
      {
        slug: "contentic",
        name: "Contentic",
        blurb: "Content ops: intake, review, publish. Live.", // TEST COPY
      },
    ],
  },

  // TEST COPY — agent count is simulated; rotation lives in the status bar
  telemetry: {
    sectionAria: "Project status. Agent count is a simulation.", // TEST COPY
    infra: {
      online: "LIVE", // TEST COPY
      building: "IN BUILD", // TEST COPY
      pending: "QUEUED", // TEST COPY
    },
    status: {
      shipped: "shipped", // TEST COPY
      building: "in build", // TEST COPY
      live: "live", // TEST COPY
      pipeline: "in pipeline", // TEST COPY
    },
    rosterPrefix: "Projects: ", // TEST COPY
  },

  // TEST COPY — pipeline.log theatre (stages from Autumn; chrome keys restored from main)
  pipelineRunner: {
    sectionAria: "Factory pipeline", // TEST COPY
    header: "pipeline.log", // TEST COPY
    compiling: "[ AGENT_COMPILING... ]", // TEST COPY
    mode: {
      reboot: "REBOOT", // TEST COPY
      pinned: "PINNED", // TEST COPY
      live: "LIVE", // TEST COPY
    },
    rebootLogs: [
      "> REBOOTING FACTORY PIPELINE...", // TEST COPY
      "> flushing stage buffers...", // TEST COPY
      "> handshake ok.", // TEST COPY
    ],
    stages: [
      {
        id: "moment",
        code: "01",
        phase: "FIND",
        name: "MAGIC_MOMENT",
        logs: ["Something should feel obvious.", "It doesn't yet."], // TEST COPY
      },
      {
        id: "check",
        code: "02",
        phase: "CHECK",
        name: "MARKET_CHECK",
        logs: ["Ideas: many", "People who want it: checking...", "Checkpoint: PASS"], // TEST COPY
      },
      {
        id: "mvp",
        code: "03",
        phase: "BUILD",
        name: "MVP",
        logs: ["App + homepage + light marketing", "Shipping core features"], // TEST COPY
        hasProgress: true,
      },
      {
        id: "public",
        code: "04",
        phase: "SHIP",
        name: "V1.5_IN_PUBLIC",
        logs: ["Building in the open", "Watching real usage"], // TEST COPY
      },
      {
        id: "park",
        code: "05",
        phase: "DECIDE",
        name: "PARK_OR_PUSH",
        logs: ["No users → parked", "Users → back on"], // TEST COPY
      },
    ] as const,
  },
} as const;
