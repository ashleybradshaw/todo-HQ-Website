import type { Metadata } from "next";
import { UiIdeShell } from "@/components/ui-docs/UiIdeShell";
import { uiPage } from "@/content/pages/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: uiPage.seo.title,
  description: uiPage.seo.description,
  path: "/ui",
});

export default function UiPage() {
  return <UiIdeShell />;
}
