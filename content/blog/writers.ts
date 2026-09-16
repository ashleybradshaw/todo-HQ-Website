export const WRITER_IDS = [
  "grow-01",
  "grow-02",
  "grow-03",
  "grow-04",
  "grow-05",
] as const;

export type WriterId = (typeof WRITER_IDS)[number];

export type GhostWriter = {
  id: WriterId;
  name: string;
  role: string;
  about: string;
};

export const GHOST_WRITERS: readonly GhostWriter[] = [
  {
    id: "grow-01",
    name: "Riley Chen",
    role: "Growth Editor, //TODO",
    about:
      "Edits factory notes for technical founders and product leads evaluating how the floor actually ships.",
  },
  {
    id: "grow-02",
    name: "Sam Okonkwo",
    role: "Product Stories",
    about:
      "Writes product narratives from the roster already in production: Repdaily, ReadyGo, and Contentic.",
  },
  {
    id: "grow-03",
    name: "Jordan Hale",
    role: "Factory Notes",
    about:
      "Documents the internal software factory — intake, agent stations, and the gates that cannot be faked.",
  },
  {
    id: "grow-04",
    name: "Avery Nishimura",
    role: "Apps & Shipping",
    about:
      "Covers full-stack delivery: the apps that leave the floor, not a pitch deck of prototypes.",
  },
  {
    id: "grow-05",
    name: "Casey Moreau",
    role: "Design Systems",
    about:
      "Tracks the house system the factory ships against — structural grid, inverted palette, and chrome that holds up in production.",
  },
];

const BANNED_BYLINE = /ashley|bradshaw|\bdan\b/i;

for (const writer of GHOST_WRITERS) {
  if (BANNED_BYLINE.test(`${writer.name} ${writer.about} ${writer.role}`)) {
    throw new Error(
      `Ghost writer "${writer.id}" cannot use real team names on public bylines.`,
    );
  }
}

const WRITERS_BY_ID = Object.fromEntries(
  GHOST_WRITERS.map((writer) => [writer.id, writer]),
) as Record<WriterId, GhostWriter>;

export function isWriterId(value: string): value is WriterId {
  return Object.hasOwn(WRITERS_BY_ID, value);
}

export function getWriter(id: string): GhostWriter {
  if (!isWriterId(id)) {
    throw new Error(
      `Unknown authorId "${id}". Use one of: ${WRITER_IDS.join(", ")}`,
    );
  }
  return WRITERS_BY_ID[id];
}
