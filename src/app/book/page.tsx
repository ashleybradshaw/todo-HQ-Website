import type { Metadata } from "next";
import { BookContactForm } from "@/components/BookContactForm";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { bookPage } from "@/content/pages/book";
import { contactPageGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Book Team",
  description: bookPage.metaDescription,
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
        eyebrowClassName="text-center"
        title={bookPage.title}
        titleClassName="type-title text-center text-balance tracking-tight"
        ledeClassName="text-center"
        overflow="hidden"
        background={<PerspectiveGrid />}
        lede={<p>{bookPage.lede}</p>}
      >
        <BookContactForm bookingType={bookingType} />
      </PageShell>
    </>
  );
}
