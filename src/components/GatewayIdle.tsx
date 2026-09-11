"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoAnimated } from "@/components/LogoAnimated";
import { StippleField } from "@/components/StippleField";
import {
  initRsvpAudio,
  isSoundEnabled,
  playBeep,
  setSoundEnabled,
} from "@/lib/rsvp-audio";

const WORD_CLASS = "font-unbounded font-bold tracking-tight";

export function GatewayIdle() {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  useEffect(() => {
    router.prefetch("/intro");
    router.prefetch("/home");
  }, [router]);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-[#4545FF] text-[#DDDDFF]">
      <StippleField />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center py-2.5">
            {/* Idle lockup is LogoAnimated (GSAP draw + eye wiggle), not LogoStatic. */}
            <LogoAnimated className="h-[35px] w-auto text-[#0B0CB4]" />
          </div>
          <p className={`${WORD_CLASS} py-5 text-center text-[40px] leading-12`}>
            First time?
          </p>
          <div className="font-jetbrains flex items-center justify-center py-2.5 text-base leading-5 font-bold">
            <Link
              href="/intro"
              className="min-h-11 cursor-pointer bg-transparent px-1 py-2.5"
              onClick={() => {
                initRsvpAudio();
                playBeep(180);
              }}
            >
              [Yes]
            </Link>
            <span>&nbsp;-&nbsp;</span>
            <Link
              href="/home"
              className="min-h-11 cursor-pointer bg-transparent px-1 py-2.5"
            >
              [No]
            </Link>
          </div>
          <button
            type="button"
            className="font-jetbrains min-h-11 cursor-pointer bg-transparent py-2.5 text-base leading-5 font-bold"
            aria-pressed={soundOn}
            onClick={() => {
              setSoundOn((enabled) => {
                const next = !enabled;
                setSoundEnabled(next);
                return next;
              });
            }}
          >
            {`[ Sound: ${soundOn ? "ON" : "OFF"} ]`}
          </button>
        </div>
      </div>
    </div>
  );
}
