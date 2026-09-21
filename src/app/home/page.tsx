import type { Metadata } from "next";
import { FactoryDashboard } from "@/components/FactoryDashboard";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Factory",
  description:
    "The //TODO Engineering factory — pipeline from intake to ship for product and engineering leads. AGI and LP flows, executePipeline(), shipping RepDaily, ReadyGo, ErgTrainer, and The Tower.",
  path: "/home",
});

export default function HomePage() {
  return <FactoryDashboard />;
}
