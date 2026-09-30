import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — design and AI engineering studio`,
} as const;

type ShareImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  index = true,
  images,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  /** Overrides the site default share image. */
  images?: ShareImage[];
}): Metadata {
  const canonical = path === "/" ? "/home" : path;
  const url = `${SITE_URL}${canonical === "/" ? "" : canonical}`;
  const fullTitle = path === "/" ? title : `${title} · ${SITE_NAME}`;
  const shareImages = images ?? [DEFAULT_SHARE_IMAGE];

  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: {
      index,
      follow: true,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_GB",
      type: "website",
      images: shareImages,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: shareImages.map((image) => image.url),
    },
  };
}
