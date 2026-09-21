export const SITE_URL =
  // Prod must set NEXT_PUBLIC_SITE_URL to the canonical host (custom domain
  // when one exists). Fallback stays the Vercel project URL until then.
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://todo-hq-website.vercel.app";

export const SITE_NAME = "//TODO Engineering";

export const CONTACT_EMAIL = "team@todo.engineering";

export const SITE_DESCRIPTION =
  "//TODO Engineering designs, builds, and ships production applications, agent workflows, and backends for product and engineering teams that need systems that hold up after launch.";

export const OFFERING_SUMMARY =
  "Most teams just write code. We build the entire factory — autonomous agents, automated workflows, and production applications including RepDaily, ReadyGo, and Contentic.";
