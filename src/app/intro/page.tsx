"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RSVPIntro } from "@/components/RSVPIntro";
import { requestIdeBootReplay } from "@/hooks/useIdeBoot";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  return (
    <RSVPIntro
      onComplete={() => {
        requestIdeBootReplay();
        router.replace("/home");
      }}
    />
  );
}
