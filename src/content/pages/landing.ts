/**
 * Landing (/) gateway copy.
 * // TEST COPY
 */

import { OFFERING_SUMMARY, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// TEST COPY
export const landingPage = {
  // TEST COPY
  seo: {
    title: `${SITE_NAME} — Design and AI Engineering Studio`, // TEST COPY
    description: SITE_DESCRIPTION,
  },

  // TEST COPY
  srOnly: {
    h1: `${SITE_NAME}: design and AI engineering studio`, // TEST COPY
    description: SITE_DESCRIPTION,
    offering: OFFERING_SUMMARY,
    capabilitiesHeading: "Capabilities",
    capabilities: [
      "Production-ready application design, code, and ship",
      "Autonomous agentic workflows and multi-agent ecosystems",
      "Scalable backend engineering for SaaS and enterprise",
      "Active roster: RepDaily, ReadyGo, and Contentic",
    ],
    navAria: "Primary destinations",
    nav: [
      { href: "/intro", label: "Start the intro sequence" },
      { href: "/home", label: "Open the homepage" }, // TEST COPY
      { href: "/about", label: "Read the manifesto" },
      { href: "/work", label: "View production work" },
      { href: "/book", label: "Book the team" },
    ],
  },

  // TEST COPY
  noscript: {
    description: SITE_DESCRIPTION,
    links: [
      { href: "/home", label: "Continue to the homepage" }, // TEST COPY

      { href: "/about", label: "About" },
      { href: "/work", label: "Work" },
      { href: "/book", label: "Book Team" },
    ],
  },

  // TEST COPY
  idle: {
    prompt: "First time?",
    yes: "[Yes]",
    no: "[No]",
    soundOn: "[ Sound: ON ]",
    soundOff: "[ Sound: OFF ]",
  },
} as const;
