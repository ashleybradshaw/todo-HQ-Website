"use client";

import { useState } from "react";
import { PerspectiveGrid } from "@/components/PerspectiveGrid";
import { RSVPIntro } from "@/components/RSVPIntro";

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <PerspectiveGrid />
      {showIntro ? (
        <RSVPIntro onComplete={() => setShowIntro(false)} />
      ) : null}
    </main>
  );
}
