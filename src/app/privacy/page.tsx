import type { Metadata } from "next";
import { privacyPage } from "@/content/pages/privacy";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: privacyPage.seo.title,
  description: privacyPage.seo.description,
  path: "/privacy",
  index: false,
});

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out">
      <div className="relative z-10 mx-auto max-w-[720px]">
        <p className="font-jetbrains text-base leading-5 font-bold">
          {privacyPage.eyebrow}
        </p>
        <h1 className="font-unbounded mt-4 max-w-[20ch] text-4xl font-bold tracking-tight md:text-5xl">
          {privacyPage.h1}
        </h1>
        <div className="mt-8 space-y-4 text-base leading-relaxed md:text-lg">
          {privacyPage.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="font-jetbrains text-syn-comment text-sm">
            {privacyPage.testNote}
          </p>
        </div>
      </div>
    </main>
  );
}
