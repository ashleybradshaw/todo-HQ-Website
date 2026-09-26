/**
 * Icons actually used in HQ — not a Lucide catalogue dump.
 * // TEST COPY
 */

export type IconEntry = {
  name: string;
  kind: "lucide" | "logo" | "stack" | "lockup";
  /** Public path for mask/img, or null for inline lockup. */
  src: string | null;
};

export const ICON_INVENTORY: readonly IconEntry[] = [
  {
    name: "SprayCanIcon",
    kind: "lucide",
    src: null,
  },
  { name: "//TODO lockup", kind: "lockup", src: null },
  { name: "RepDaily", kind: "logo", src: "/logos/repdaily.svg" },
  { name: "ReadyGo", kind: "logo", src: "/logos/readygo.svg" },
  { name: "Contentic", kind: "logo", src: "/logos/contentic.svg" },
  { name: "Figma", kind: "stack", src: "/stack/figma.svg" },
  { name: "Cursor", kind: "stack", src: "/stack/cursor.svg" },
  { name: "OpenAI", kind: "stack", src: "/stack/openai.svg" },
  { name: "Claude", kind: "stack", src: "/stack/claude.svg" },
  { name: "Vercel", kind: "stack", src: "/stack/vercel.svg" },
  { name: "GitHub", kind: "stack", src: "/stack/github.svg" },
  { name: "Swift", kind: "stack", src: "/stack/swift.svg" },
  { name: "Xcode", kind: "stack", src: "/stack/xcode.svg" },
  { name: "Android", kind: "stack", src: "/stack/android.svg" },
  { name: "Node.js", kind: "stack", src: "/stack/nodejs.svg" },
  { name: "PostgreSQL", kind: "stack", src: "/stack/postgresql.svg" },
  { name: "Redis", kind: "stack", src: "/stack/redis.svg" },
  { name: "Docker", kind: "stack", src: "/stack/docker.svg" },
] as const;
