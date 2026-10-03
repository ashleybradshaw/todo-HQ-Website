import { getPageProjectNames } from "@/lib/projects";

export const SITE_URL =
  // Prod must set NEXT_PUBLIC_SITE_URL to the canonical host (custom domain
  // when one exists). Fallback stays the Vercel project URL until then.
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://todo-hq-website.vercel.app";

export const SITE_NAME = "//TODO Engineering";

export const CONTACT_EMAIL = "team@todo.engineering";

/** Organisation byline until writer profiles exist. */
export const CONTENT_BYLINE = "//TODO Engineering";

/**
 * Public social URLs. An empty string hides the footer link and is omitted
 * from Organization sameAs.
 */
export const SOCIAL = {
  x: "https://x.com/todoengineering",
} as const;

/** Twitter card handle, taken from SOCIAL.x so the account stays one constant. */
export const X_HANDLE = (() => {
  const name = SOCIAL.x.split("/").filter(Boolean).pop() ?? "";
  return name ? `@${name}` : "";
})();

/** Mock X log in the /home IDE. Turn off when the tab should disappear. */
export const SHOW_X_FEED = true;

export const SITE_DESCRIPTION =
  "//TODO Engineering designs and builds apps, software systems and hardware-connected products for teams with hard problems.";

function formatNameList(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export const OFFERING_SUMMARY = `We take hard domains apart, then design and build what runs them: AI agents, automated workflows and production apps, including ${formatNameList(getPageProjectNames())}.`;
