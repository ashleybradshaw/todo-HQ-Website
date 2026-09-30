import type { Metadata } from "next";
import { FactoryDashboard } from "@/components/FactoryDashboard";
import { homePage } from "@/content/pages/home";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: homePage.seo.title,
  description: homePage.seo.description,
  path: "/home",
  images: [
    {
      url: "/home/opengraph-image",
      width: 1200,
      height: 630,
      alt: `${homePage.og.title} — ${SITE_NAME}`,
    },
  ],
});

export default function HomePage() {
  return <FactoryDashboard />;
}
