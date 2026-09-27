/**
 * 404 page copy.
 * // TEST COPY
 */

import { SITE_NAME } from "@/lib/site";

// TEST COPY
export const notFoundPage = {
  // TEST COPY
  seo: {
    title: `Page not found · ${SITE_NAME}`,
  },

  // TEST COPY
  h1: "This page didn't ship.",
  body: "The link is broken or the page moved. Pick a way back.",
  tabLabel: "404.ts",
  editorAria: "IDE editor",
  comment: "// not on the factory floor",
  navAria: "Ways back",
  links: [
    { href: "/home", label: "Go home", primary: false },
    { href: "/work", label: "See the work", primary: false },
    { href: "/book", label: "Book the team", primary: true },
  ],
} as const;
