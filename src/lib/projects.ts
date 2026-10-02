import type { StackId } from "@/components/ide/StackIconRow";

export type ProjectStatus = "shipped" | "building" | "live" | "pipeline";

export type MediaRatio = "16:9" | "4:5" | "1:1";
export type MediaLayout = "full" | "pair" | "trio";
export type MediaKind = "image" | "video";

export type ProjectMetric = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

export type ProjectSpecLink = {
  label: string;
  href: string;
};

/** Status stays on the project. Links are omitted from the spec table when empty. */
export type ProjectSpec = {
  client: string;
  year: string;
  platforms: readonly string[];
  role: readonly string[];
  timeline: string;
  links?: readonly ProjectSpecLink[];
};

export type ProjectMediaItem = {
  id: string;
  kind: MediaKind;
  ratio: MediaRatio;
  src: string;
  poster?: string;
  alt: string;
  caption: string;
};

/** Items in one row share a ratio. */
export type ProjectMediaRow = {
  id: string;
  layout: MediaLayout;
  items: readonly ProjectMediaItem[];
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
  /** CSS variable, e.g. var(--foreground). Home rows and work cards wash with it. */
  accent: string;
  metrics: readonly ProjectMetric[];
  stack: readonly StackId[];
  spec: ProjectSpec;
  scope: readonly string[];
  outcome: string;
  mediaRows: readonly ProjectMediaRow[];
  /** Optional MVP / version notes — omit on most projects. */
  phaseNotes?: readonly ProjectPhaseNote[];
  /** Shown on the card status strip. // TEST COPY until a real release exists. */
  release: string;
};

export type PipelineProject = ProjectBase & {
  status: "pipeline";
  hasPage: false;
};

export type Project = FullProject | PipelineProject;

const PLACEHOLDER_SRC: Record<MediaRatio, string> = {
  "16:9": "/work/placeholders/landscape.svg",
  "4:5": "/work/placeholders/portrait.svg",
  "1:1": "/work/placeholders/square.svg",
};

function still(
  slug: string,
  name: string,
  id: string,
  ratio: MediaRatio,
  caption: string,
  kind: MediaKind = "image",
): ProjectMediaItem {
  const src = PLACEHOLDER_SRC[ratio];
  return {
    id: `${slug}-${id}`,
    kind,
    ratio,
    src,
    ...(kind === "video" ? { poster: src } : {}),
    alt: `${name} — ${caption}`,
    caption,
  };
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
    accent: "var(--foreground)",
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
    metrics: [
      { value: 103, label: "days to launch" },
      { value: 300, label: "active users" },
      { value: 15, suffix: "%", label: "paid conversion" },
    ],
    // TEST COPY
    stack: ["swift", "android", "nodejs", "postgresql"],
    // TEST COPY
    spec: {
      client: "Internal",
      year: "2025",
      platforms: ["iOS", "Android"],
      role: ["Product", "Design", "iOS", "Android"],
      timeline: "103 days, first half of 2025",
    },
    // TEST COPY
    release: "v1.5",
    // TEST COPY
    scope: [
      "On-device rep counting. Nothing recorded, nothing uploaded.",
      "A 30-second calibration that has to work first time.",
      "Streaks, Rep Points and 24 stages to bring people back.",
      "Brand, website and launch, alongside the iOS and Android builds.",
    ],
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
    // TEST MEDIA
    mediaRows: [
      {
        id: "repdaily-full",
        layout: "full",
        items: [
          {
            ...still(
              "repdaily",
              "RepDaily",
              "session-log",
              "16:9",
              "Session log across a full training week",
            ),
            src: "/work/repdaily.webp",
            alt: "RepDaily on a phone, showing workout progression and a training calendar.",
          },
        ],
      },
      {
        id: "repdaily-pair",
        layout: "pair",
        items: [
          still("repdaily", "RepDaily", "set-detail", "4:5", "Set detail"),
          still(
            "repdaily",
            "RepDaily",
            "form-check",
            "4:5",
            "Form check across the full set, with the angle, the count and the cue that keeps the next rep honest",
          ),
        ],
      },
      {
        id: "repdaily-trio",
        layout: "trio",
        items: [
          still("repdaily", "RepDaily", "rep-count", "1:1", "Rep count"),
          still("repdaily", "RepDaily", "calendar", "1:1", "Calendar"),
          still("repdaily", "RepDaily", "handoff", "1:1", "Handoff"),
        ],
      },
    ],
  },
  {
    slug: "readygo",
    name: "ReadyGo",
    listed: true,
    status: "building",
    hasPage: true,
    accent: "var(--blog-cat-agents)",
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
    metrics: [
      { value: 12, label: "weeks in build" },
      { value: 4, label: "session types" },
      { value: 2, label: "sports" },
    ],
    // TEST COPY
    stack: ["swift", "nodejs", "postgresql", "vercel"],
    // TEST COPY
    spec: {
      client: "Internal",
      year: "2026",
      platforms: ["iOS", "Web"],
      role: ["Product", "Design", "Build"],
      timeline: "In build through spring 2026",
    },
    // TEST COPY
    release: "v0.1",
    // TEST COPY
    scope: [
      "Conditions, effort and kit settled before you head out.",
      "A short plan you can read on the way out the door.",
      "Built like RepDaily: map, prototype, spec, ship.",
      "One record for the session instead of a stack of notes.",
    ],
    // TEST COPY
    outcome: "In build: pre-activity planning for runners and cyclists.",
    // TEST MEDIA
    mediaRows: [
      {
        id: "readygo-full",
        layout: "full",
        items: [
          still("readygo", "ReadyGo", "route-brief", "16:9", "Route brief"),
        ],
      },
      {
        id: "readygo-pair",
        layout: "pair",
        items: [
          still("readygo", "ReadyGo", "conditions", "1:1", "Conditions"),
          still(
            "readygo",
            "ReadyGo",
            "start-line",
            "1:1",
            "Start line",
            "video",
          ),
        ],
      },
      {
        id: "readygo-trio",
        layout: "trio",
        items: [
          still("readygo", "ReadyGo", "effort", "4:5", "Effort"),
          still("readygo", "ReadyGo", "kit-list", "4:5", "Kit list"),
          still("readygo", "ReadyGo", "split-plan", "4:5", "Split plan"),
        ],
      },
    ],
  },
  {
    slug: "contentic",
    name: "Contentic",
    listed: true,
    status: "live",
    hasPage: true,
    accent: "var(--syn-string)",
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
    metrics: [
      { value: 3, label: "review stages" },
      { value: 1, label: "draft queue" },
      { value: 8, suffix: " min", label: "median publish" },
    ],
    // TEST COPY
    stack: ["typescript", "nodejs", "postgresql"],
    // TEST COPY
    spec: {
      client: "Internal",
      year: "2024",
      platforms: ["Web"],
      role: ["Design", "Build"],
      timeline: "Shipped, still in operation",
    },
    // TEST COPY
    release: "v1.0",
    // TEST COPY
    scope: [
      "Intake, review and publish on one surface.",
      "A queue for drafts instead of a side channel.",
      "Status anyone can read without opening the file.",
      "Built and run on the same process as our other products.",
    ],
    // TEST COPY
    outcome: "Live. Content operations from intake to publish.",
    // TEST MEDIA
    mediaRows: [
      {
        id: "contentic-full",
        layout: "full",
        items: [
          still(
            "contentic",
            "Contentic",
            "pipeline",
            "16:9",
            "Pipeline from intake to publish",
            "video",
          ),
        ],
      },
      {
        id: "contentic-pair",
        layout: "pair",
        items: [
          still("contentic", "Contentic", "intake", "4:5", "Intake queue"),
          still("contentic", "Contentic", "asset-tray", "4:5", "Asset tray"),
        ],
      },
      {
        id: "contentic-trio",
        layout: "trio",
        items: [
          still("contentic", "Contentic", "review", "1:1", "Review pass"),
          still("contentic", "Contentic", "status", "1:1", "Status"),
          still("contentic", "Contentic", "handoff", "1:1", "Handoff"),
        ],
      },
    ],
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
