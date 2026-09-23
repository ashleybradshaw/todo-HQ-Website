export type BlogPollOption = {
  id: string;
  label: string;
};

export type BlogPoll = {
  id: string;
  question: string;
  mode: "single";
  options: readonly BlogPollOption[];
  /** Seeded baseline counts before this browser’s vote */
  seed: Record<string, number>;
  /**
   * `featured` — beside the featured note (leaves the grid).
   * `grid` — mixed into the notes grid after `afterNote`.
   */
  slot: "featured" | "grid";
  /** 1-based note index in the notes stream (grid slot only) */
  afterNote?: number;
};

export const BLOG_FEATURED_POLL_ID = "talk-next";

export const BLOG_POLLS: readonly BlogPoll[] = [
  {
    id: BLOG_FEATURED_POLL_ID,
    question: "What should we talk about next?",
    mode: "single",
    slot: "featured",
    options: [
      { id: "ai", label: "AI" },
      { id: "top-ui", label: "Top UI sites" },
      { id: "tools", label: "Tools we use" },
      { id: "tool-week", label: "Tool of the week" },
    ],
    seed: { ai: 12, "top-ui": 9, tools: 7, "tool-week": 5 },
  },
  {
    id: "notes-useful",
    question: "How useful are these notes?",
    mode: "single",
    slot: "grid",
    afterNote: 5,
    options: [
      { id: "very", label: "Very" },
      { id: "somewhat", label: "Somewhat" },
      { id: "not-really", label: "Not really" },
      { id: "browsing", label: "Just browsing" },
    ],
    seed: { very: 14, somewhat: 11, "not-really": 3, browsing: 8 },
  },
] as const;

export function getFeaturedPoll() {
  return BLOG_POLLS.find((poll) => poll.slot === "featured");
}

export function getGridPolls() {
  return BLOG_POLLS.filter((poll) => poll.slot === "grid");
}
