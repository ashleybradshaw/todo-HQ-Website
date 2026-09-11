import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const fullTitle = path === "/" ? title : `${title} · ${SITE_NAME}`;

  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    robots: {
      index,
      follow: true,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}
