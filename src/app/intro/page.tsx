"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RSVPIntro } from "@/components/RSVPIntro";
import { introPage } from "@/content/pages/intro";
import { requestIdeBootReplay } from "@/hooks/useIdeBoot";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  return (
    <main id="main" tabIndex={-1}>
      <h1 className="sr-only">{introPage.seo.title}</h1>
      <RSVPIntro
        onComplete={() => {
          requestIdeBootReplay();
          router.replace("/home");
        }}
      />
    </main>
  );
}
