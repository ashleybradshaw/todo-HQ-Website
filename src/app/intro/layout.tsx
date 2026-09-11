import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Intro",
  description:
    "High-speed kinetic typography intro for the //TODO Engineering software factory.",
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
