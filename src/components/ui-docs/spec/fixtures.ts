import { GHOST_WRITERS } from "../../../../content/blog/writers";
import type { BlogPoll } from "@/content/blog-polls";
import type { BlogPost } from "@/lib/blog";
import type { BlogIndexPost } from "@/lib/blog-shared";
import type {
  FullProject,
  PipelineProject,
  ProjectMediaRow,
} from "@/lib/projects";

const PLACEHOLDER = "/work/placeholders/landscape.svg";

// TEST COPY
export const UI_SAMPLE_PROJECT: FullProject = {
  slug: "specimen",
  name: "Specimen",
  listed: true,
  status: "shipped",
  hasPage: true,
  description: "Sample case copy for the spec sheet.",
  cardDescription: "Sample card copy for the spec sheet.",
  imageSrc: PLACEHOLDER,
  imageAlt: "Specimen still",
  imageWidth: 1600,
  imageHeight: 900,
  accent: "var(--foreground)",
  metrics: [
    { value: 12, label: "days to launch" },
    { value: 300, label: "active users" },
    { value: 15, suffix: "%", label: "paid conversion" },
  ],
  stack: ["swift", "vercel"],
  spec: {
    client: "Internal",
    year: "2026",
    platforms: ["iOS"],
    role: ["Product", "Design"],
    timeline: "One season",
  },
  scope: ["Sample scope"],
  outcome: "Sample outcome",
  mediaRows: [],
  release: "v0.1",
};

// TEST COPY
export const UI_SAMPLE_QUEUED: PipelineProject = {
  slug: "queued-specimen",
  name: "Queued specimen",
  listed: true,
  status: "pipeline",
  hasPage: false,
  description: "Sample queued line for the spec sheet.",
  cardDescription: "Sample queued line for the spec sheet.",
  imageSrc: PLACEHOLDER,
  imageAlt: "Queued specimen",
  imageWidth: 1600,
  imageHeight: 900,
};

// TEST COPY
export const UI_MEDIA_ROWS: readonly ProjectMediaRow[] = [
  {
    id: "full",
    layout: "full",
    items: [
      {
        id: "full-still",
        kind: "image",
        ratio: "16:9",
        src: PLACEHOLDER,
        alt: "Full specimen still",
        caption: "Full 16:9",
      },
    ],
  },
  {
    id: "pair",
    layout: "pair",
    items: [
      {
        id: "pair-portrait",
        kind: "image",
        ratio: "4:5",
        src: "/work/placeholders/portrait.svg",
        alt: "Pair portrait",
        caption: "Pair 4:5",
      },
      {
        id: "pair-square",
        kind: "image",
        ratio: "1:1",
        src: "/work/placeholders/square.svg",
        alt: "Pair square",
        caption: "Pair 1:1",
      },
    ],
  },
];

// TEST COPY
export const UI_NOTE: BlogIndexPost = {
  slug: "specimen-note",
  title: "Specimen note",
  excerpt: "Sample note copy for the spec sheet.",
  date: "2026-09-26",
  readMinutes: 4,
  category: "projects",
  featured: false,
  writerName: "Specimen writer",
  avatarSrc: null,
  imageSrc: null,
  imageAlt: null,
};

// TEST COPY
export const UI_POLL: BlogPoll = {
  id: "ui-specimen-poll",
  question: "Which specimen should we keep?",
  mode: "single",
  slot: "grid",
  options: [
    { id: "hero", label: "Hero" },
    { id: "frame", label: "Frame" },
    { id: "card", label: "Card" },
  ],
  seed: { hero: 4, frame: 3, card: 2 },
};

function stubPost(title: string, slug: string, date: string): BlogPost {
  return {
    title,
    date,
    readMinutes: 4,
    slug,
    excerpt: "Sample note copy for the spec sheet.",
    category: "projects",
    featured: false,
    body: "",
    html: "",
    writer: GHOST_WRITERS[0],
    avatarSrc: null,
    heroSrc: null,
    ogImageSrc: null,
    imageAlt: null,
    status: null,
    editor: null,
  };
}

// TEST COPY
export const UI_PREV_POST = stubPost(
  "Previous specimen",
  "specimen-prev",
  "2026-09-01",
);

// TEST COPY
export const UI_NEXT_POST = stubPost(
  "Next specimen",
  "specimen-next",
  "2026-09-20",
);
