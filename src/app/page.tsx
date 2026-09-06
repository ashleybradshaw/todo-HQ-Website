"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RSVPIntro } from "@/components/RSVPIntro";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/about");
  }, [router]);

  return (
    <RSVPIntro
      onComplete={() => {
        router.replace("/about");
      }}
    />
  );
}
