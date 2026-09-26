export type ProjectMediaAspect = "landscape" | "portrait" | "square";
export type ProjectMediaWidth = "hero" | "support" | "tall";
export type ProjectMediaOffset = "left" | "center" | "right";
export type ProjectStatus = "shipped" | "building" | "live" | "pipeline";

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

type ProjectBase = {
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
   * Public Work roster. `false` = omitted from /work index + sitemap.
   */
  listed: boolean;
  status: ProjectStatus;
  /** Detail route + sitemap. Derived: pipeline ⇒ false. */
  hasPage: boolean;
};

export type FullProject = ProjectBase & {
  status: Exclude<ProjectStatus, "pipeline">;
  hasPage: true;
  scope: readonly string[];
  stack: readonly string[];
  outcome: string;
  media: readonly ProjectMedia[];
};

export type PipelineProject = ProjectBase & {
  status: "pipeline";
  hasPage: false;
};

export type Project = FullProject | PipelineProject;

type MediaSpec = {
  aspect: ProjectMediaAspect;
  caption: string;
  width: ProjectMediaWidth;
  offset: ProjectMediaOffset;
  /** Real still path; omit to use placeholder art. */
  src?: string;
};

function media(
  slug: string,
  name: string,
  slots: readonly MediaSpec[],
): readonly ProjectMedia[] {
  return slots.map((slot, index) => {
    const n = String(index + 1).padStart(2, "0");
    return {
      id: `${slug}-${n}`,
      src: slot.src ?? `/work/placeholders/${slot.aspect}.svg`,
      alt: `${name} — ${slot.caption}`,
      aspect: slot.aspect,
      caption: slot.caption,
      width: slot.width,
      offset: slot.offset,
    };
  });
}

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: "// Shipped",
  building: "// In build",
  live: "// Live",
  pipeline: "// In pipeline",
};

/**
 * Work projects: public roster (full case pages + pipeline cards).
 * Index uses `listed: true`. Detail routes + sitemap use `hasPage`.
 */
export const PROJECTS: readonly Project[] = [
  {
    slug: "repdaily",
    name: "RepDaily",
    listed: true,
    status: "shipped",
    hasPage: true,
    description:
      "Camera-based fitness tracking for product teams — reps, progression, and a training calendar from the phone, designed and shipped in the //TODO factory.",
    imageSrc: "/work/repdaily.webp",
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
      { aspect: "landscape", caption: "Session log", width: "hero", offset: "right" },
      { aspect: "portrait", caption: "Set detail", width: "support", offset: "left" },
      { aspect: "square", caption: "Rep count", width: "support", offset: "right" },
      { aspect: "landscape", caption: "Week view", width: "support", offset: "left" },
      { aspect: "portrait", caption: "Form check", width: "tall", offset: "center" },
      { aspect: "square", caption: "Calendar", width: "support", offset: "right" },
      { aspect: "landscape", caption: "Progression", width: "hero", offset: "left" },
      { aspect: "square", caption: "Handoff", width: "support", offset: "right" },
    ]),
  },
  {
    slug: "readygo",
    name: "ReadyGo",
    listed: true,
    status: "building",
    hasPage: true,
    // TEST COPY
    description:
      "Pre-activity planning for runners and cyclists — conditions, effort, and kit settled before the session starts.",
    imageSrc: "/work/readygo.webp",
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
    // TEST COPY
    outcome: "In build: pre-activity planning for endurance athletes.",
    media: media("readygo", "ReadyGo", [
      { aspect: "landscape", caption: "Route brief", width: "hero", offset: "left" },
      { aspect: "square", caption: "Conditions", width: "support", offset: "right" },
      { aspect: "portrait", caption: "Effort", width: "support", offset: "left" },
      { aspect: "landscape", caption: "Kit list", width: "support", offset: "right" },
      { aspect: "square", caption: "Start line", width: "tall", offset: "center" },
      { aspect: "portrait", caption: "Split plan", width: "support", offset: "left" },
      { aspect: "landscape", caption: "Session card", width: "hero", offset: "right" },
      { aspect: "square", caption: "Handoff", width: "support", offset: "left" },
    ]),
  },
  {
    slug: "contentic",
    name: "Contentic",
    listed: true,
    status: "live",
    hasPage: true,
    // TEST COPY — card/hero use placeholder art until a real still lands.
    description:
      "Content operations for a production pipeline — intake, review, and publish in one surface.",
    imageSrc: "/work/placeholders/landscape.svg", // sentinel → PlaceholderStill
    imageAlt: "Contentic — index placeholder",
    imageWidth: 1600,
    imageHeight: 900,
    scope: [
      "Intake, review, and publish on one surface.",
      "A queue for drafts instead of a side channel.",
      "Status a product lead can read without opening the file.",
      "Production content ops through the factory roster.", // TEST COPY
    ],
    stack: ["TypeScript", "Node.js", "PostgreSQL"],
    outcome: "Live — content operations in the factory roster.", // TEST COPY
    media: media("contentic", "Contentic", [
      { aspect: "portrait", caption: "Intake queue", width: "hero", offset: "left" },
      { aspect: "landscape", caption: "Draft board", width: "support", offset: "right" },
      { aspect: "square", caption: "Review pass", width: "support", offset: "left" },
      { aspect: "landscape", caption: "Publish set", width: "support", offset: "right" },
      { aspect: "portrait", caption: "Asset tray", width: "tall", offset: "center" },
      { aspect: "square", caption: "Status", width: "support", offset: "left" },
      { aspect: "landscape", caption: "Pipeline", width: "hero", offset: "right" },
      { aspect: "square", caption: "Handoff", width: "support", offset: "left" },
    ]),
  },
  {
    slug: "the-tower",
    name: "The Tower",
    listed: true,
    status: "pipeline",
    hasPage: false,
    // TEST COPY
    description: "Structured brief intake and status for factory builds in flight.",
    imageSrc: "/work/placeholders/landscape.svg",
    imageAlt: "The Tower — index placeholder",
    imageWidth: 1600,
    imageHeight: 900,
  },
  {
    // Working title — product name may change before public launch.
    slug: "ergtrainer",
    name: "ErgTrainer",
    listed: true,
    status: "pipeline",
    hasPage: false,
    // TEST COPY
    description: "Erg-session coaching and pacing for indoor training blocks.",
    imageSrc: "/work/placeholders/landscape.svg",
    imageAlt: "ErgTrainer — index placeholder",
    imageWidth: 1600,
    imageHeight: 900,
  },
] as const;

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function projectHasPage(project: Project): project is FullProject {
  return project.hasPage;
}

/** Detail slugs for static params (full case pages only). */
export function getProjectSlugs(): string[] {
  return PROJECTS.filter(projectHasPage).map((project) => project.slug);
}

/** Full case-study projects in roster order (prev/next). */
export function getPageProjects(): readonly FullProject[] {
  return PROJECTS.filter(projectHasPage);
}

/** Public Work roster — index cards. */
export function getListedProjects(): readonly Project[] {
  return PROJECTS.filter((project) => project.listed);
}

/** Sitemap locs — listed projects that have a detail page. */
export function getListedProjectSlugs(): string[] {
  return getListedProjects()
    .filter(projectHasPage)
    .map((project) => project.slug);
}

/** Names of listed full projects, for copy/schema sync. */
export function getPageProjectNames(): string[] {
  return getPageProjects().map((project) => project.name);
}
