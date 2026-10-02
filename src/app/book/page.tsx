import type { Metadata } from "next";
import { BookPaths } from "@/components/book/BookPaths";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { SiteCloser } from "@/components/SiteCloser";
import { bookPage } from "@/content/pages/book";
import { contactPageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: bookPage.seo.title,
  description: bookPage.seo.description,
  path: "/book",
});

type BookPageProps = {
  searchParams: Promise<{ type?: string | string[] }>;
};

function resolveBookingType(
  type: string | string[] | undefined,
): string | undefined {
  const value = Array.isArray(type) ? type[0] : type;
  if (value === "coffee" || value === "hard-talk") {
    return value;
  }
  return undefined;
}

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;
  const bookingType = resolveBookingType(params.type);

  return (
    <>
      <JsonLd data={contactPageGraph()} />
      <PageShell
        variant="essay"
        eyebrow={bookPage.eyebrow}
        title={bookPage.title}
        lede={bookPage.lede}
      >
        <BookPaths bookingType={bookingType} />
        <SiteCloser route="book" />
      </PageShell>
    </>
  );
}
