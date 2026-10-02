/**
 * Blog index chrome (article bodies stay in MD / frontmatter).
 * // TEST COPY
 */

// TEST COPY
export const blogPage = {
  // TEST COPY
  seo: {
    title: "Blog",
    description:
      "Notes from the //TODO Engineering factory — internal software process, multi-agent systems, and the production roster.",
  },

  eyebrow: "// Blog",
  // TEST COPY — Autumn reviews in master copy pass
  title: "Notes from the factory.",
  // TEST COPY — Autumn reviews in master copy pass
  sub: "Process, agents, and the apps we run in production.",
  // TEST COPY
  heading: "// Blog",
  notesLabel: "NOTES",
  filterAria: "Filter notes",
  allFilter: "All",
  notesCount: (n: number) => `${n} notes`,
  empty: "No notes in this filter.",
  more: "More",
  coverFallbackLabel: "Cover",
  coverAspect: "16:9",
} as const;
