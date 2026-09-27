/**
 * /ui design system showcase.
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
  title: "TODO UI",
  hqLinkLabel: "← HQ",
  hqLinkHref: "/home",
  intro:
    "Live tokens and real HQ parts — powder canvas, electric lines, Unbounded titles, JetBrains labels.",
  tokensNote: "tokens read live",
  resetLabel: "Reset",
  resetAria: "Reset colour palette to brand",

  tiles: {
    brand: {
      title: "Brand",
      description:
        "Lockup on a construction grid, plus product marks from the factory roster.",
    },
    hawk: {
      title: "Hawk",
      description:
        "Gateway ASCII hawk inside the project browser frame — loops, pauses offscreen.",
    },
    colour: {
      title: "Colour",
      description:
        "Tall swatches for every brand token with hex and contrast from live CSS vars.",
    },
    type: {
      title: "Type",
      description:
        "Unbounded display and JetBrains body, including the article .type-prose size.",
    },
    components: {
      title: "Components",
      description:
        "Dense live strip of spray CTAs, menu, inputs, path toggle, chips, and more.",
    },
    icons: {
      title: "Icons",
      description:
        "Lucide and SVG marks the site actually ships — not a catalogue dump.",
    },
    grid: {
      title: "Grid & spacing",
      description:
        "Layout grid with crosshair corners, spacing steps, 4px radius, 3px focus.",
    },
    motion: {
      title: "Motion",
      description:
        "400ms transitions, bone load-in, and selection colour — CSS only.",
    },
    inTheWild: {
      title: "In the wild",
      description:
        "Home, About, and a project page as captured stills in browser frames.",
    },
  },

  rules: {
    title: "Rules",
    debtTitle: "Known debt",
    debtNote: "Documented only — do not apply without an explicit GO.",
  },

  previews: {
    home: {
      src: "/ui/previews/home.webp",
      alt: "Home factory dashboard still. TEST COPY.",
      caption: "home",
    },
    about: {
      src: "/ui/previews/about.webp",
      alt: "About page still. TEST COPY.",
      caption: "about",
    },
    project: {
      src: "/ui/previews/project.webp",
      alt: "RepDaily project page still. TEST COPY.",
      caption: "work / repdaily",
    },
    hawkPoster: {
      src: "/ui/previews/hawk-poster.webp",
      alt: "Hawk still frame for reduced motion. TEST COPY.",
    },
  },
} as const;
