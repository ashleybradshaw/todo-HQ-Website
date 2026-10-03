/**
 * /ui design system showcase — stacked spec sheet.
 * // TEST COPY
 */

// TEST COPY
export const uiPage = {
  // TEST COPY
  seo: {
    title: "TODO UI · Design system",
    description:
      "The live design system behind //TODO Engineering. Colour, type, spacing, icons, components and motion, read straight from the code that ships.",
  },

  // TEST COPY
  header: {
    eyebrow: "// TODO UI",
    /** Full title (a11y / tools). Rendered as line1 + mobile break + line2. */
    title: "Built to spec. Here's the spec.",
    titleLine1: "Built to spec.",
    titleLine2: "Here's the spec.",
    subtitle:
      "Every colour, type size, spacing step and motion curve on this site, read live from the code that ships it.",
  },

  // TEST COPY
  sections: {
    brand: {
      eyebrow: "// 01 BRAND",
      title: "Brand",
      description:
        "The lockup, its clear space and the three product marks, on the powder canvas.",
      metric: "LOCKUP · 3 MARKS",
    },
    colour: {
      eyebrow: "// 02 COLOUR",
      title: "Colour",
      description:
        "Every token read live from CSS variables. Hex and contrast shown. Click a swatch to copy it.",
      metricFallback: "19 TOKENS · AA 19/19",
    },
    type: {
      eyebrow: "// 03 TYPE",
      title: "Type",
      description:
        "Unbounded for display, JetBrains Mono for body and code. Eleven tokens, plus the stat figure and the article headings.",
      metric: "2 FAMILIES · 11 TOKENS",
    },
    layout: {
      eyebrow: "// 04 LAYOUT & TRACKS",
      title: "Layout and tracks",
      description:
        "Frame 1336, reading 800, content 752, copy 688, hero sub 592. Spacing stays on a 4px ladder.",
      metric: "5 TRACKS · 4PX",
    },
    icons: {
      eyebrow: "// 05 ICONOGRAPHY",
      title: "Iconography",
      description:
        "Lucide at 16, 20 and 24. One stroke, one colour, same as the live UI.",
      metric: "LUCIDE · 3 SIZES",
    },
    buttons: {
      eyebrow: "// 06 BUTTONS",
      title: "Buttons",
      description:
        "Four styles, each forced into default, hover, focus and disabled.",
      metric: "4 STYLES · 4 STATES",
    },
    inputs: {
      eyebrow: "// 07 INPUTS",
      title: "Inputs",
      description:
        "Three interaction states and four addon variants. Static, so nothing moves while you inspect it.",
      metric: "3 STATES · 4 VARIANTS",
    },
    components: {
      eyebrow: "// 08 COMPONENTS",
      title: "Components",
      description:
        "The parts that ship, stripped to the bone: browser frame, cards, status dots and nav.",
      metric: "6 PARTS",
    },
    motion: {
      eyebrow: "// 09 MOTION",
      title: "Motion",
      description:
        "400ms cubic-bezier(0.22, 1, 0.36, 1) reveals, a 2.4s status pulse, 400ms CountUp, and TypeComment typing capped at 480ms.",
      metric: "400MS · 2.4S PULSE",
    },
  },

  // TEST COPY
  rules: {
    eyebrow: "// 10 RULES",
    title: "Rules",
    description:
      "The house lock for colour, type, motion and chrome. Not up for debate.",
    metric: "11 RULES",
    items: [
      "Electric blue #4545FF is the house colour and is never recoloured. Powder #DFDFFF, logo #0B0CB4, muted #565693. Text on tint #3636FF, on tinted cards and CTAs only.",
      "Status: online uses --syn-string, building uses --foreground, pending is #8B5100 (--status-pending) and is never sprayed. Syntax colours come from globals.css.",
      "Unbounded sets the display hierarchy. JetBrains Mono handles body and code. Body is .type-body at 16/24. .type-prose is for articles only.",
      "Frames are square. Cards, media and chips are 4px. 400ms transitions, 3px focus rings (or the outline-2 sibling pattern), and sprayed CTAs.",
      "Media is a full frame at 752 (16:9) or a pair at 368 (4:5 or 1:1).",
      "type-* rules live in @layer components, so utilities override them. .work-stat-figure stays outside the layer.",
      "No blur, except the nav's existing backdrop-blur.",
      "Text selection uses --selection-bg and --selection-fg, and follows Spray.",
      "Motion on this page is CSS or Tailwind only. No new Framer Motion or GSAP for docs demos. Lucide and animateicons are fine.",
      "Raster images are WebP. SVGs are stripped of editor metadata. Copy is UK English.",
      "Spray randomise works as before on other pages. reset() only restores INNER_BRAND_PAIR.",
    ],
  },
} as const;
