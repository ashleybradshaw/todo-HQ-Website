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

/** Optional labelled chapter between Outcome and stills (RepDaily only today). */
export type ProjectPhaseNote = {
  /** e.g. "// MVP" */
  label: string;
  body: string;
};

type ProjectBase = {
  slug: string;
  name: string;
  /**
   * SEO description and case-study lede (full projects).
   * Pipeline cards may mirror cardDescription.
   */
  description: string;
  /** Index card body. */
  cardDescription: string;
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
  /** Hide stack chip row when empty / omitted. */
  stack?: readonly string[];
  outcome: string;
  media: readonly ProjectMedia[];
  /** Optional MVP / version notes — omit on most projects. */
  phaseNotes?: readonly ProjectPhaseNote[];
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
    // TEST COPY
    description:
      "Camera-based push-up tracking for iOS and Android. Designed and built by two people in 103 days, from a push-up counter to a daily habit.",
    // TEST COPY
    cardDescription:
      "Camera-based push-up tracking for iOS and Android. It counts every rep on the phone, then turns the habit into a streak worth keeping.",
    imageSrc: "/work/repdaily.webp",
    // TEST COPY
    imageAlt:
      "RepDaily on a phone, showing workout progression and a training calendar.",
    imageWidth: 1400,
    imageHeight: 787,
    // TEST COPY
    scope: [
      "On-device rep counting. Nothing recorded, nothing uploaded.",
      "A 30-second calibration that has to work first time.",
      "Streaks, Rep Points and 24 stages to bring people back.",
      "Brand, website and launch, alongside the iOS and Android builds.",
    ],
    // Stack hidden until product copy is ready.
    stack: [],
    // TEST COPY
    outcome: "Live on iOS and Android. Now moving from MVP to v1.5.",
    // TEST COPY
    phaseNotes: [
      {
        label: "// MVP",
        body: "Started as a push-up counter. The real brief was getting people to come back tomorrow. 103 days later we had 40+ screens, the calibration flow, streaks and a paid workout system.",
      },
      {
        label: "// v1.5",
        body: "FreeRep and PowerPath 10K are now free. Pro adds PushPass 24, timed UltraTasks and a 17-badge Trophy Cabinet. Friends and leaderboards come next.",
      },
    ],
    // PENDING new stills — apply when assets match:
    // ["RepDaily", "Calibration", "FreeRep", "Rep count", "PushPass 24", "Rep Points", "UltraTasks", "Trophy Cabinet", "Handoff"]
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
      "Pre-activity planning for runners and cyclists. Conditions, effort and kit, sorted before the session starts.",
    // TEST COPY
    cardDescription:
      "Pre-activity planning for runners and cyclists. Conditions, effort and kit, sorted before you head out.",
    imageSrc: "/work/readygo.webp",
    imageAlt:
      "ReadyGo still: a cyclist and a runner on a mountain road under the line Take it out on the road.",
    imageWidth: 1400,
    imageHeight: 756,
    // TEST COPY
    scope: [
      "Conditions, effort and kit settled before you head out.",
      "A short plan you can read on the way out the door.",
      "Built like RepDaily: map, prototype, spec, ship.",
      "One record for the session instead of a stack of notes.",
    ],
    stack: ["Swift", "Node.js", "PostgreSQL", "Vercel"],
    // TEST COPY
    outcome: "In build: pre-activity planning for runners and cyclists.",
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
    // TEST COPY
    description:
      "Content operations in one place. Intake, review and publish, without the side channels.",
    // TEST COPY
    cardDescription:
      "Content operations in one place: intake, review and publish, without the side channels.",
    imageSrc: "/work/placeholders/landscape.svg", // sentinel → PlaceholderStill
    imageAlt: "Contentic — index placeholder",
    imageWidth: 1600,
    imageHeight: 900,
    // TEST COPY
    scope: [
      "Intake, review and publish on one surface.",
      "A queue for drafts instead of a side channel.",
      "Status anyone can read without opening the file.",
      "Built and run on the same process as our other products.",
    ],
    stack: ["TypeScript", "Node.js", "PostgreSQL"],
    // TEST COPY
    outcome: "Live. Content operations from intake to publish.",
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
    description: "Brief intake and live build status, in one view.",
    // TEST COPY
    cardDescription: "Brief intake and live build status, in one view.",
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
    description: "Coaching and pacing for erg sessions and indoor blocks.",
    // TEST COPY
    cardDescription: "Coaching and pacing for erg sessions and indoor blocks.",
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
