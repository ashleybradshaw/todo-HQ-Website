import { CONTACT_EMAIL } from "@/lib/site";

export const MAX_LINKS = 5;
export const MAX_URL_CHARS = 300;
export const MAX_LINK_NAME_CHARS = 40;
export const SAFE_MAILTO_LENGTH = 1800;

export type BookLinkRow = {
  id: string;
  url: string;
  name: string;
};

export function normaliseUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function linkTag(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "figma.com" || host.endsWith(".figma.com")) return "Figma";
    if (
      host === "drive.google.com" ||
      host === "docs.google.com" ||
      host.endsWith(".drive.google.com") ||
      host.endsWith(".docs.google.com")
    ) {
      return "Drive";
    }
    if (host === "github.com" || host.endsWith(".github.com")) return "GitHub";
    if (host === "notion.so" || host.endsWith(".notion.so") || host === "notion.site" || host.endsWith(".notion.site")) {
      return "Notion";
    }
    if (host === "loom.com" || host.endsWith(".loom.com")) return "Loom";
    if (host === "dropbox.com" || host.endsWith(".dropbox.com")) return "Dropbox";
    return "Link";
  } catch {
    return "Link";
  }
}

/** Rows with text that fail normalisation — empty rows are fine. */
export function linkRowIsInvalid(row: BookLinkRow): boolean {
  const trimmed = row.url.trim();
  if (!trimmed) return false;
  return normaliseUrl(trimmed) === null;
}

export function linksHaveInvalidRows(links: BookLinkRow[]): boolean {
  return links.some(linkRowIsInvalid);
}

export function firstInvalidLinkIndex(links: BookLinkRow[]): number {
  return links.findIndex(linkRowIsInvalid);
}

/** Only normalised https/http links; empty rows skipped. */
export function collectValidLinks(links: BookLinkRow[]): BookLinkRow[] {
  const out: BookLinkRow[] = [];
  for (const row of links) {
    const normalised = normaliseUrl(row.url);
    if (!normalised) continue;
    out.push({
      id: row.id,
      url: normalised,
      name: row.name.trim().slice(0, MAX_LINK_NAME_CHARS),
    });
  }
  return out;
}

export function formatLinksForEmail(
  links: BookLinkRow[],
  accessNote?: string,
): string {
  const valid = collectValidLinks(links);
  if (valid.length === 0 && !accessNote?.trim()) return "";

  const lines: string[] = [];
  if (valid.length > 0) {
    lines.push("Links:");
    valid.forEach((link, index) => {
      const label = link.name || linkTag(link.url);
      lines.push(`${index + 1}. ${label} — ${link.url}`);
    });
  }

  const note = accessNote?.trim();
  if (note) {
    if (lines.length > 0) lines.push("");
    lines.push(`Access: ${note}`);
  }

  return lines.join("\n");
}

export function buildMailto(
  subject: string,
  body: string,
): { href: string; tooLong: boolean } {
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { href, tooLong: href.length > SAFE_MAILTO_LENGTH };
}

export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function newLinkRow(id?: string): BookLinkRow {
  return {
    id: id ?? `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: "",
    name: "",
  };
}

/** Stable first row — avoids SSR/client UUID or Strict Mode id drift. */
export function initialLinkRows(count = 1): BookLinkRow[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `link-init-${index}`,
    url: "",
    name: "",
  }));
}
