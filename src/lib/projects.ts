export type Project = {
  slug: string;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  /** Short expanded-card body (1–2 paragraphs). */
  summary: readonly string[];
  stack?: readonly string[];
  outcome: string;
};

export const PROJECTS: readonly Project[] = [
  {
    slug: "readygo",
    name: "ReadyGo",
    description:
      "Pre-activity planning for runners and cyclists — conditions, effort, and kit before the session starts.",
    imageSrc: "/work/readygo.jpg",
    imageAlt:
      "ReadyGo still: a cyclist and a runner on a mountain road under the line Take it out on the road.",
    imageWidth: 1400,
    imageHeight: 756,
    summary: [
      "ReadyGo helps endurance athletes plan the session before they hit the road — without a stack of half-finished notes.",
      "Designed and shipped through the //TODO factory: intake, multi-agent implementation, and production handoff.",
    ],
    stack: ["Swift", "Node.js", "PostgreSQL", "Vercel"],
    outcome: "In production — pre-activity planning for endurance athletes.",
  },
  {
    slug: "repdaily",
    name: "RepDaily",
    description:
      "Camera-based fitness tracking — reps, progression, and calendar from the phone camera.",
    imageSrc: "/work/repdaily.jpg",
    imageAlt:
      "RepDaily production interface on a phone, showing workout progression and a January training calendar.",
    imageWidth: 1400,
    imageHeight: 787,
    summary: [
      "RepDaily turns the phone camera into a training log — no clipboard between sets.",
      "Shipped end-to-end in the factory: scoped intake, agent stations with verification gates, then a clean production release.",
    ],
    stack: ["Swift", "Node.js", "PostgreSQL", "Redis"],
    outcome: "In production — camera-based fitness tracking on iOS.",
  },
] as const;

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function getProjectSlugs(): string[] {
  return PROJECTS.map((project) => project.slug);
}
