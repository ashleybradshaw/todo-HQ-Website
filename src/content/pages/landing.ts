/**
 * Landing (/) gateway copy.
 * // TEST COPY
 */

import { OFFERING_SUMMARY, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// TEST COPY
export const landingPage = {
  // TEST COPY
  seo: {
    title: `${SITE_NAME}: design and AI engineering studio`, // TEST COPY
    description: SITE_DESCRIPTION,
  },

  // TEST COPY
  srOnly: {
    h1: `${SITE_NAME}: design and AI engineering studio`, // TEST COPY
    description: SITE_DESCRIPTION,
    offering: OFFERING_SUMMARY,
    capabilitiesHeading: "Capabilities",
    capabilities: [
      "Apps for iOS, Android and web", // TEST COPY
      "CMS and software systems", // TEST COPY
      "Products that talk to hardware (BLE, edge AI)", // TEST COPY
      "Projects: RepDaily (live), ReadyGo (in build), Contentic (live)", // TEST COPY
    ],
    navAria: "Primary destinations",
    nav: [
      { href: "/intro", label: "Start the intro sequence" },
      { href: "/home", label: "Open the homepage" }, // TEST COPY
      { href: "/about", label: "About the studio" }, // TEST COPY
      { href: "/work", label: "See the work" }, // TEST COPY
      { href: "/book", label: "Book a call" }, // TEST COPY
    ],
  },

  // TEST COPY
  noscript: {
    description: SITE_DESCRIPTION,
    links: [
      { href: "/home", label: "Continue to the homepage" }, // TEST COPY
      { href: "/about", label: "About" },
      { href: "/work", label: "Work" },
      { href: "/book", label: "Book a call" }, // TEST COPY
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
