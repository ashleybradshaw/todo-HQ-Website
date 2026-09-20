import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description:
    "How //TODO Engineering handles data when you contact the team or visit this site. Full policy forthcoming — TEST COPY.",
  path: "/privacy",
  index: false,
});

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background px-6 pt-28 pb-16 text-foreground transition-[background-color,color] duration-[400ms] ease-in-out">
      <div className="relative z-10 mx-auto max-w-[720px]">
        <p className="font-jetbrains text-base leading-5 font-bold">Privacy;</p>
        <h1 className="font-unbounded mt-4 max-w-[20ch] text-4xl font-bold tracking-tight md:text-5xl">
          How we use your data
        </h1>
        <div className="mt-8 space-y-4 text-base leading-relaxed md:text-lg">
          <p>
            {"//TODO Engineering collects only what we need to respond when you "}
            book the team or email us — typically a name, work email, and the
            brief you share.
          </p>
          <p>
            We do not sell contact data. We do not run third-party ad pixels on
            this site. Analytics, if enabled later, will be documented here.
          </p>
          <p className="font-jetbrains text-syn-comment text-sm">
            TEST COPY — full privacy policy forthcoming.
          </p>
        </div>
      </div>
    </main>
  );
}
