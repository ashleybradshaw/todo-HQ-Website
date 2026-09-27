import type { Metadata } from "next";
import { FactoryDashboard } from "@/components/FactoryDashboard";
import { homePage } from "@/content/pages/home";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: homePage.seo.title,
  description: homePage.seo.description,
  path: "/home",
});

export default function HomePage() {
  return <FactoryDashboard />;
}
