import { getListedProjects, type ProjectStatus } from "@/lib/projects";

function formatNameList(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

/** Group listed full-page apps by status for intro copy. */
function statusRosterLede(): string {
  const pages = getListedProjects().filter((p) => p.hasPage);
  const byStatus = (status: ProjectStatus) =>
    pages.filter((p) => p.status === status).map((p) => p.name);

  const shippedLive = [...byStatus("shipped"), ...byStatus("live")];
  const building = byStatus("building");

  const parts: string[] = [];
  if (shippedLive.length > 0) {
    parts.push(`Shipped and live: ${formatNameList(shippedLive)}.`);
  }
  if (building.length > 0) {
    parts.push(`In build: ${formatNameList(building)}.`);
  }

  if (parts.length === 0) {
    return `Factory apps: ${formatNameList(pages.map((p) => p.name))}.`;
  }
  return parts.join(" ");
}

const pageNames = getListedProjects()
  .filter((p) => p.hasPage)
  .map((p) => p.name);
const nameList = formatNameList(pageNames);

// TEST COPY — status-derived roster; copy review later.
const statusLede = statusRosterLede();

export const workPage = {
  eyebrow: "// Work",
  title: "The work",
  metaDescription: `Production apps from the //TODO Engineering factory — including ${nameList}. Case pages for product and engineering leads.`,
  lede: `//TODO Engineering operates an internal software factory. ${statusLede}`,
} as const;
