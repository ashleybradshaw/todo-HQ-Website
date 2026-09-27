/**
 * /ui design system showcase — stacked spec sheet.
 * // TEST COPY
 */

// TEST COPY
export const uiPage = {
  // TEST COPY
  seo: {
    title: "TODO UI",
    description:
      "Live design system for //TODO Engineering — colours, type, spacing, motion, icons, and components read from the factory source of truth.",
  },

  // TEST COPY
  header: {
    eyebrow: "// TODO UI",
    barLabel: "LIVE TOKENS",
    title: "Looks complex. Runs on simple code.",
    subtitle:
      "Every colour, type size, spacing step and motion curve on this site, read live from the code that ships it.",
  },

  // TEST COPY
  sections: {
    brand: {
      eyebrow: "// 01 BRAND",
      title: "Brand",
      description:
        "Lockup, clear space and product marks on the powder canvas.",
      metric: "LOCKUP · 3 MARKS",
    },
    colour: {
      eyebrow: "// 02 COLOUR",
      title: "Colour",
      description:
        "Brand tokens read live from CSS variables — hex, contrast, click to copy.",
      metricFallback: "TOKENS · AA —",
    },
    type: {
      eyebrow: "// 03 TYPE",
      title: "Type",
      description:
        "Unbounded for display, JetBrains Mono for body — eight styles in use.",
      metric: "2 FAMILIES · 8 STYLES",
    },
    grid: {
      eyebrow: "// 04 GRID & SPACING",
      title: "Grid & spacing",
      description:
        "Twelve columns on a 4px base — gutters and the spacing ladder.",
      metric: "12 COL · 4PX BASE",
    },
    icons: {
      eyebrow: "// 05 ICONOGRAPHY",
      title: "Iconography",
      description:
        "Lucide at three sizes — same stroke, same colour as the live UI.",
      metric: "LUCIDE · 3 SIZES",
    },
    buttons: {
      eyebrow: "// 06 BUTTONS",
      title: "Buttons",
      description:
        "Four styles across four forced states — default, hover, focus, disabled.",
      metric: "4 STYLES · 4 STATES",
    },
    inputs: {
      eyebrow: "// 07 INPUTS",
      title: "Inputs",
      description:
        "Three interaction states and four addon variants — static specimens.",
      metric: "3 STATES · 4 VARIANTS",
    },
    components: {
      eyebrow: "// 08 COMPONENTS",
      title: "Components",
      description:
        "Ghost bones of the parts that ship — frame, card, chips, status, nav.",
      metric: "6 PARTS",
    },
    motion: {
      eyebrow: "// 09 MOTION",
      title: "Motion",
      description:
        "One curve, 400ms ease-in-out — fade, slide and bone morph loops.",
      metric: "400MS · EASE-IN-OUT",
    },
  },

  rules: {
    eyebrow: "// 10 RULES",
    title: "Rules",
    description: "House lock for colour, type, motion and UI chrome.",
    metric: "9 RULES",
  },
} as const;
