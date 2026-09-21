import type { Metadata } from "next";
import { BookContactForm } from "@/components/BookContactForm";
import { JsonLd } from "@/components/JsonLd";
import { PageShell } from "@/components/PageShell";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { organizationGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Book Team",
  description:
    "Book //TODO Engineering for enterprise AI development, autonomous agents, and production SaaS architecture. Consultation and client onboarding.",
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
      <JsonLd data={organizationGraph()} />
      <PageShell
        eyebrow="BOOK //"
        title="Bring the factory to the problem."
        overflow="hidden"
        background={<PerspectiveGrid />}
        lede={
          <p className="max-w-xl">
            {
              "//TODO Engineering works with technical founders and product leads who need AI workflow architecture or a full-stack application in production. Tell us what has to ship."
            }
          </p>
        }
      >
        <BookContactForm bookingType={bookingType} />
      </PageShell>
    </>
  );
}
