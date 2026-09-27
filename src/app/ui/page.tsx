import type { Metadata } from "next";
import { UiShowcase } from "@/components/ui-docs/UiShowcase";
import { uiPage } from "@/content/pages/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: uiPage.seo.title,
  description: uiPage.seo.description,
  path: "/ui",
});

export default function UiPage() {
  return <UiShowcase />;
}
