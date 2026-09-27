/**
 * /home factory IDE surface copy.
 * // TEST COPY
 */

// TEST COPY
export const homePage = {
  // TEST COPY
  seo: {
    title: "Factory",
    description:
      "The //TODO Engineering factory — pipeline from intake to ship for product and engineering leads. AGI and LP flows, executePipeline(), shipping RepDaily, ReadyGo, ErgTrainer, and The Tower.",
  },

  // TEST COPY
  srOnly: {
    h1: "//TODO Design & Engineering factory dashboard",
    lead:
      "//TODO Design & Engineering builds the factory, not just the tickets — end-to-end AI and LM workflows for enterprise teams and non-tech founders. Pipeline: intake, review, agiFlow, lpPipeline, analysis, ship. Methodology is executePipeline() — with RepDaily, ReadyGo, ErgTrainer, and The Tower in production.",
  },

  // TEST COPY
  landmarks: {
    editorAria: "IDE editor",
    sidecarAria: "Factory sidecar",
  },

  // TEST COPY
  todoHq: {
    fileComment:
      "/** //TODO Design & Engineering — factory overview. Soft sell. TEST COPY. */",
    whoWeAre:
      "We're //TODO — design and engineering that builds the factory, not just the tickets.",
    whatWeDoBest:
      "End-to-end AI and LM workflows that hold a full digital ecosystem together.",
    whoWeShipFor: [
      "Enterprise teams shipping major system solutions — globally",
      "Non-tech founders and investor groups taking MVPs to scale",
    ],
    howWeWork: [
      "With you, inside your stack",
      "Or for you, as a tight delivery cell",
    ],
    pipeline: [
      "intake",
      "review",
      "agiFlow",
      "lpPipeline",
      "analysis",
      "ship",
    ],
    agiFlow: "Brief → research agents → draft → human gate → ship.",
    lpPipeline: "Offer → layout → copy pass → QA → launch.",
    methodologyAria: "executePipeline() — restart factory pipeline",
    methodologyLabel: "executePipeline()",
    inProduction: ["RepDaily", "ReadyGo", "ErgTrainer", "The Tower"],
    promise: "Future-proof your AI implementation — without the theatre.",
  },

  // TEST COPY
  offer: {
    fileComment: "# offer.md — Soft sell · TEST COPY",
    ourOfferHeading: "Our offer",
    ourOfferBody:
      "We take a magic moment — the thing that should feel inevitable — and turn it into a shipped product: landing, app, or both.",
    howWeWorkHeading: "How we work",
    howWeWorkSteps: [
      "Find the moment worth building.",
      "Flat design → coded frontend (Figma / Cursor).",
      "Human gate, then ship (Vercel / stores).",
      "Backend + native when the product earns it.",
    ],
    stackHeading: "Stack",
    stackAria: "Tool stack",
    pipelinesHeading: "Pipelines",
    agiFlowLine:
      "`agiFlow` — Brief → research agents → draft → human gate → ship.",
    lpPipelineLine:
      "`lpPipeline` — Offer → layout → copy pass → QA → launch.",
  },

  // TEST COPY
  discovery: {
    fileComment: "// discovery.ts — Soft sell · TEST COPY",
    coffee: {
      length: "15 min",
      vibe: "Coffee call — chemistry, is this a fit, no deck.",
      cardTitle: "Coffee · 15 min",
      cardSub: "Chemistry, is this a fit, no deck.",
      cta: "Book coffee talk →",
    },
    hardTalk: {
      length: "60 min",
      vibe: "Hour hard talk — dig into the real issue, scope the fix.",
      cardTitle: "Hard talk · 60 min",
      cardSub: "Dig into the real issue, scope the fix.",
      cta: "Book hard talk →",
    },
  },

  // TEST COPY
  ideTabs: {
    aria: "IDE source files",
    tabs: {
      todo: "TODO_HQ.ts",
      offer: "offer.md",
      discovery: "discovery.ts",
    },
  },

  // TEST COPY
  statusStrip: {
    byTab: {
      todo: "TypeScript · Soft sell · TEST COPY",
      offer: "Markdown · Soft sell · TEST COPY",
      discovery: "TypeScript · Soft sell · TEST COPY",
    },
    ariaPrefix: "Editor status: ",
    ln: "Ln 25, Col 1",
    utf8: "UTF-8",
    lf: "LF",
    m: "M",
    n: "N",
    size: "2.4K",
    justNow: "just now",
  },

  // TEST COPY
  projectCards: {
    sectionAria: "Active project roster",
    header: "SYS // PROJECTS",
    viewLink: "View",
    items: [
      {
        name: "RepDaily",
        blurb: "Camera-based fitness tracking — in production.",
      },
      {
        name: "ReadyGo",
        blurb: "Pre-activity planning for runners and cyclists.",
      },
      {
        name: "Contentic",
        blurb: "CMS ops and content pipelines at factory speed.",
      },
    ],
  },

  // TEST COPY
  telemetry: {
    sectionAria: "Factory telemetry",
    header: "SYS // TELEMETRY",
    keys: {
      agents: "AGENTS_ACTIVE",
      infra: "INFRASTRUCTURE",
      sprint: "CURRENT_SPRINT",
    },
    infra: {
      online: "ONLINE",
      building: "BUILDING",
      pending: "PENDING",
    },
    status: {
      shipped: "shipped",
      building: "in build",
      live: "live",
      pipeline: "in pipeline",
    },
    rosterPrefix: "Current roster: ",
  },

  // TEST COPY
  pipelineRunner: {
    sectionAria: "Factory pipeline",
    header: "pipeline.log",
    compiling: "[ AGENT_COMPILING... ]",
    mode: {
      reboot: "REBOOT",
      pinned: "PINNED",
      live: "LIVE",
    },
    rebootLogs: [
      "> REBOOTING FACTORY PIPELINE...",
      "> flushing stage buffers...",
      "> handshake ok.",
    ],
    stages: [
      {
        id: "ingest",
        code: "01",
        phase: "INGEST",
        name: "MAGIC_MOMENT",
        subtitle: "Idea System Source",
        logs: [],
      },
      {
        id: "exec",
        code: "02",
        phase: "EXEC",
        name: "IDEATION_PROCESSOR",
        logs: [
          "Extrapolating concept...",
          "Market fit mapping...",
          "MVP Scoping...",
          "Parameter Rating: PASS",
        ],
      },
      {
        id: "build",
        code: "03",
        phase: "BUILD",
        name: "MVP_PRODUCTION",
        logs: ["Agentic stack active", "Assembling core features"],
        hasProgress: true,
      },
      {
        id: "scale",
        code: "04",
        phase: "SCALE",
        name: "PUBLIC_BUILD_v1.5",
        logs: ["Deploying extended services", "Scaling architecture"],
      },
      {
        id: "sync",
        code: "05",
        phase: "SYNC",
        name: "EXTENDED_ROADMAP",
        logs: ["12-24mo Horizon Active", "User feedback loops: LISTENING"],
      },
    ] as const,
  },
} as const;
