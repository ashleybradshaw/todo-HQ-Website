import type { Metadata } from "next";
import type { ReactNode } from "react";
import { introPage } from "@/content/pages/intro";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: introPage.seo.title,
  description: introPage.seo.description,
  path: "/intro",
  index: false,
});

export default function IntroLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
