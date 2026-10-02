// TEST COPY — /work index chrome

export const workPage = {
  // TEST COPY
  seo: {
    title: "Work",
    description:
      "Apps we've designed and shipped: RepDaily, Contentic and ReadyGo. What each one does, what we built, and where it is now.",
  },
  eyebrow: "// Work",
  title: "The work",
  /** @deprecated Prefer workPage.seo.description */
  metaDescription:
    "Apps we've designed and shipped: RepDaily, Contentic and ReadyGo. What each one does, what we built, and where it is now.",
  // TEST COPY
  lede: "Our own products, built the same way we build for clients. Live: RepDaily and Contentic. In build: ReadyGo.",
  queuedLabel: "// queued",
} as const;

export const workCountLine = (
  projects: number,
  live: number,
  queued: number,
) => `// ${projects} projects · ${live} live · ${queued} queued`;

// TEST COPY — work detail page chrome (case study body stays in lib/projects.ts)
export const workDetailPage = {
  notFound: {
    title: "Not found",
    description: "This project does not exist.",
  },
  breadcrumbWork: "Work",
  scopeHeading: "Scope",
  outcomeHeading: "Outcome",
  adjacentAria: "Adjacent projects",
  nextLabel: "// next",
  readygoNote: "Early build: this case study grows as we ship.",
  stillsAria: (name: string) => `${name} stills`,
  specAria: (name: string) => `${name} specification`,
  metricsAria: (name: string) => `${name} metrics`,
} as const;
