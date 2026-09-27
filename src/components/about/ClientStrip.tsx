import { about } from "@/content/pages/about";

/**
 * Client name strip under the About hero.
 * // PENDING real client names — keep component; gate render until signed off.
 */
export const SHOW_CLIENT_STRIP = false;

export function ClientStrip() {
  // PENDING real client names
  if (!SHOW_CLIENT_STRIP) return null;

  return (
    <p className="type-meta mt-10 text-center text-muted">
      {about.hero.clientStrip.join(" · ")}
    </p>
  );
}
