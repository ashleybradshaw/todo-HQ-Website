import type { Metadata } from "next";
import { FactoryDashboard } from "@/components/FactoryDashboard";
import { JsonLd } from "@/components/JsonLd";
import { organizationGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Factory",
  description:
    "The //TODO Engineering factory dashboard — multi-agent systems, automated workflows, and scalable backends shipping Repdaily, ReadyGo, and Contentic.",
  path: "/home",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationGraph()} />
      <FactoryDashboard />
    </>
  );
}
