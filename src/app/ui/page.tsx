import type { Metadata } from "next";
import { UiIdeShell } from "@/components/ui-docs/UiIdeShell";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "TODO UI",
  description:
    "Live design system for //TODO Engineering — colours, type, spacing, motion, icons, and components read from the factory source of truth.",
  path: "/ui",
});

export default function UiPage() {
  return <UiIdeShell />;
}
