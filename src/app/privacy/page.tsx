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
    <main id="main" tabIndex={-1} className="relative min-h-screen overflow-x-hidden bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out">
      <div className="relative z-10 mx-auto max-w-[720px]">
        <p className="type-label">
          {privacyPage.eyebrow}
        </p>
        <h1 className="type-display mt-4 max-w-[20ch] text-balance">
          {privacyPage.h1}
        </h1>
        <div className="type-body mt-8 space-y-4">
          {privacyPage.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="type-body-sm text-syn-comment">
            {privacyPage.testNote}
          </p>
        </div>
      </div>
    </main>
  );
}
