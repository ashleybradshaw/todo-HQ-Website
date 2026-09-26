import { aboutPage } from "@/content/pages/about";

export function ClientStrip() {
  return (
    <p className="type-meta mt-10 text-center text-muted">
      {aboutPage.clientPlaceholders.join(" · ")}
    </p>
  );
}
