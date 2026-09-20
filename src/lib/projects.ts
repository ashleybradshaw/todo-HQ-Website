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
      "A pre-activity planning app for runners and cyclists. Designed and shipped using a fully integrated AI workflow stack to bypass sequential handoffs.",
    imageSrc: "/work/readygo.jpg",
    imageAlt:
      "ReadyGo still: a cyclist and a runner on a mountain road under the line Take it out on the road.",
    imageWidth: 1400,
    imageHeight: 756,
    summary: [
      "ReadyGo helps runners and cyclists plan the session before they hit the road — conditions, effort, and kit without a stack of half-finished notes.",
      "We designed and shipped it through the //TODO factory: intake, multi-agent implementation, and production handoff without sequential design→eng theatre.",
    ],
    stack: ["Swift", "Node.js", "PostgreSQL", "Vercel"],
    outcome: "In production — pre-activity planning for endurance athletes.",
  },
  {
    slug: "repdaily",
    name: "RepDaily",
    description:
      "A camera-based fitness tracking app. Designed, prototyped, and shipped using an advanced AI-assisted engineering workflow.",
    imageSrc: "/work/repdaily.jpg",
    imageAlt:
      "RepDaily production interface on a phone, showing workout progression and a January training calendar.",
    imageWidth: 1400,
    imageHeight: 787,
    summary: [
      "RepDaily turns the phone camera into a training log — reps, progression, and calendar without a clipboard between sets.",
      "Shipped end-to-end in the factory: scoped intake, agent stations for implementation and verification, then a clean production release.",
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
