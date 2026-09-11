"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RSVPIntro } from "@/components/RSVPIntro";

export default function IntroPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  return (
    <RSVPIntro
      onComplete={() => {
        router.replace("/home");
      }}
    />
  );
}
