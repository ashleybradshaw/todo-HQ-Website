export type ProjectMediaAspect = "landscape" | "portrait" | "square";
export type ProjectMediaWidth = "hero" | "support" | "tall";
export type ProjectMediaOffset = "left" | "center" | "right";

export type ProjectMedia = {
  /** Stable key for a later image-SEO pass (alt, dimensions, OG). */
  id: string;
  src: string;
  alt: string;
  aspect: ProjectMediaAspect;
  caption: string;
  width: ProjectMediaWidth;
  offset: ProjectMediaOffset;
};

export type Project = {
  slug: string;
  name: string;
  /** SEO description and visible lede. ~150–160 characters. */
  description: string;
  /** Index card thumb. Separate from the detail media essay. */
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  /**
   * Public Work roster. `false` = layout-stress detail only
   * (reachable by URL, omitted from /work index + sitemap).
   */
  listed: boolean;
  scope: readonly string[];
  stack: readonly string[];
  outcome: string;
  media: readonly ProjectMedia[];
};

type MediaSpec = {
  aspect: ProjectMediaAspect;
  caption: string;
  width: ProjectMediaWidth;
  offset: ProjectMediaOffset;
};

function placeholderAlt(name: string, caption: string) {
  // TODO: real alt + image meta when assets land
  return `${name} — ${caption} placeholder`;
}

function media(
  slug: string,
  name: string,
  slots: readonly [
    MediaSpec,
    MediaSpec,
    MediaSpec,
    MediaSpec,
    MediaSpec,
    MediaSpec,
    MediaSpec,
    MediaSpec,
  ],
): readonly ProjectMedia[] {
  const aspects = new Set(slots.map((slot) => slot.aspect));
  if (aspects.size < 3) {
    throw new Error(`${slug} media must include landscape, portrait, and square`);
  }

  return slots.map((slot, index) => {
    const n = String(index + 1).padStart(2, "0");
    return {
      id: `${slug}-${n}`,
      src: `/work/placeholders/${slot.aspect}.svg`,
      alt: placeholderAlt(name, slot.caption),
      aspect: slot.aspect,
      caption: slot.caption,
      width: slot.width,
      offset: slot.offset,
    };
  });
}

/**
 * Work projects: public roster + layout-stress detail pages.
 * Index / sitemap use `listed: true` only. All slugs stay in
 * generateStaticParams so stress URLs keep rendering for QA.
 */
export const PROJECTS: readonly Project[] = [
  {
    slug: "readygo",
    name: "ReadyGo",
    listed: true,
    description:
      "Pre-activity planning for runners and cyclists — conditions, effort, and kit settled before the session starts, shipped through the //TODO factory roster.",
    imageSrc: "/work/readygo.jpg",
    imageAlt:
      "ReadyGo still: a cyclist and a runner on a mountain road under the line Take it out on the road.",
    imageWidth: 1400,
    imageHeight: 756,
    scope: [
      "Conditions, effort, and kit settled before the session starts.",
      "A short plan an athlete can read on the way out.",
      "Intake, implementation, and a production handoff in the factory.",
      "One record for the session instead of a stack of notes.",
    ],
    stack: ["Swift", "Node.js", "PostgreSQL", "Vercel"],
    outcome: "In production — pre-activity planning for endurance athletes.",
    media: media("readygo", "ReadyGo", [
      { aspect: "landscape", caption: "Route brief", width: "hero", offset: "left" },
      { aspect: "square", caption: "Conditions", width: "support", offset: "center" },
      { aspect: "portrait", caption: "Effort", width: "tall", offset: "right" },
      { aspect: "landscape", caption: "Kit list", width: "support", offset: "right" },
      { aspect: "square", caption: "Start line", width: "tall", offset: "center" },
      { aspect: "portrait", caption: "Split plan", width: "support", offset: "left" },
      { aspect: "landscape", caption: "Session card", width: "hero", offset: "center" },
      { aspect: "square", caption: "Handoff", width: "support", offset: "left" },
    ]),
  },
  {
    slug: "repdaily",
    name: "RepDaily",
    listed: true,
    description:
      "Camera-based fitness tracking for product teams — reps, progression, and a training calendar from the phone, designed and shipped in the //TODO factory.",
    imageSrc: "/work/repdaily.jpg",
    imageAlt:
      "RepDaily production interface on a phone, showing workout progression and a January training calendar.",
    imageWidth: 1400,
    imageHeight: 787,
    scope: [
      "Phone-camera capture of a set, without a separate logger.",
      "Progression and a month calendar on the same record.",
      "Scoped intake, agent stations, and a production release.",
      "A training log that stays on the phone between sets.",
    ],
    stack: ["Swift", "Node.js", "PostgreSQL", "Redis"],
    outcome: "In production — camera-based fitness tracking on iOS.",
    media: media("repdaily", "RepDaily", [
      { aspect: "landscape", caption: "Session log", width: "hero", offset: "center" },
      { aspect: "portrait", caption: "Set detail", width: "tall", offset: "left" },
      { aspect: "square", caption: "Rep count", width: "support", offset: "right" },
      { aspect: "landscape", caption: "Week view", width: "support", offset: "center" },
      { aspect: "portrait", caption: "Form check", width: "support", offset: "right" },
      { aspect: "square", caption: "Calendar", width: "tall", offset: "left" },
      { aspect: "landscape", caption: "Progression", width: "hero", offset: "left" },
      { aspect: "square", caption: "Handoff", width: "support", offset: "center" },
    ]),
  },
  {
    // Layout stress only — Contentic is not on the public Work roster yet.
    // Not a marketing commitment; remove or hold before a public roster pass.
    slug: "contentic",
    name: "Contentic",
    listed: false,
    description:
      "Content operations for a production pipeline — intake, review, and publish in one surface. A layout study for this page only, not a roster commitment.",
    imageSrc: "/work/placeholders/landscape.svg",
    imageAlt: "Contentic — index placeholder",
    imageWidth: 1600,
    imageHeight: 900,
    scope: [
      "Intake, review, and publish on one surface.",
      "A queue for drafts instead of a side channel.",
      "Status a product lead can read without opening the file.",
      "Laid out here to stress the detail page, not to announce a launch.",
    ],
    stack: ["TypeScript", "Node.js", "PostgreSQL"],
    outcome: "Layout study — not a roster or marketing commitment.",
    media: media("contentic", "Contentic", [
      { aspect: "portrait", caption: "Intake queue", width: "tall", offset: "center" },
      { aspect: "landscape", caption: "Draft board", width: "hero", offset: "right" },
      { aspect: "square", caption: "Review pass", width: "support", offset: "left" },
      { aspect: "landscape", caption: "Publish set", width: "support", offset: "left" },
      { aspect: "portrait", caption: "Asset tray", width: "support", offset: "center" },
      { aspect: "square", caption: "Status", width: "tall", offset: "right" },
      { aspect: "landscape", caption: "Pipeline", width: "hero", offset: "center" },
      { aspect: "square", caption: "Handoff", width: "support", offset: "right" },
    ]),
  },
  {
    // Obvious layout mock. Not a shipped product.
    slug: "northstar",
    name: "Northstar",
    listed: false,
    description:
      "Planning surface for scope, status, and handoff across one factory build. A layout study for this page only — not a shipped //TODO Engineering product.",
    imageSrc: "/work/placeholders/landscape.svg",
    imageAlt: "Northstar — index placeholder",
    imageWidth: 1600,
    imageHeight: 900,
    scope: [
      "Scope, status, and handoff in one planning surface.",
      "A milestone row a lead can scan without a second tool.",
      "Notes kept next to the work they describe.",
      "Placeholder project so the detail layout can be reviewed.",
    ],
    stack: ["TypeScript", "Node.js", "Redis"],
    outcome: "Layout study — not a shipped product.",
    media: media("northstar", "Northstar", [
      { aspect: "square", caption: "Scope map", width: "support", offset: "left" },
      { aspect: "landscape", caption: "Status", width: "hero", offset: "center" },
      { aspect: "portrait", caption: "Milestone", width: "tall", offset: "right" },
      { aspect: "square", caption: "Owner row", width: "tall", offset: "center" },
      { aspect: "landscape", caption: "Handoff", width: "support", offset: "right" },
      { aspect: "portrait", caption: "Risk", width: "support", offset: "left" },
      { aspect: "square", caption: "Notes", width: "support", offset: "right" },
      { aspect: "landscape", caption: "Release", width: "hero", offset: "left" },
    ]),
  },
] as const;

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

/** All detail slugs (public + layout-stress) for static params. */
export function getProjectSlugs(): string[] {
  return PROJECTS.map((project) => project.slug);
}

/** Public Work roster — index cards and sitemap. */
export function getListedProjects(): readonly Project[] {
  return PROJECTS.filter((project) => project.listed);
}

export function getListedProjectSlugs(): string[] {
  return getListedProjects().map((project) => project.slug);
}
