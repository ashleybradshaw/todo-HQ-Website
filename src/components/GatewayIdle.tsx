"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HawkAsciiField } from "@/components/HawkAsciiField";
import { LogoAnimated } from "@/components/LogoAnimated";
import { StippleField } from "@/components/StippleField";
import {
  initRsvpAudio,
  isSoundEnabled,
  playBeep,
  setSoundEnabled,
} from "@/lib/rsvp-audio";

const WORD_CLASS = "font-unbounded font-bold tracking-tight";
const CONTROL_CLASS =
  "font-jetbrains min-h-11 cursor-pointer bg-transparent px-1.5 py-2.5 text-[1.0625rem] leading-6 font-extrabold tracking-wide";

function prefersReducedMotion() {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GatewayIdle() {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion);
  const [hawkFailed, setHawkFailed] = useState(false);

  useEffect(() => {
    router.prefetch("/intro");
    router.prefetch("/home");
  }, [router]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const useStipple = reduceMotion || hawkFailed;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-[#4545FF] text-[#DDDDFF]">
      {useStipple ? (
        <StippleField />
      ) : (
        <HawkAsciiField onFallback={() => setHawkFailed(true)} />
      )}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center py-2.5">
            {/* Idle lockup is LogoAnimated (GSAP draw + eye wiggle), not LogoStatic. */}
            <LogoAnimated className="h-[35px] w-auto text-[#0B0CB4]" />
          </div>
          <p
            className={`${WORD_CLASS} py-5 text-center text-[clamp(1.75rem,5.5vw,2.5rem)] leading-[1.15]`}
          >
            First time?
          </p>
          <div className="flex items-center justify-center py-2.5">
            <Link
              href="/intro"
              className={CONTROL_CLASS}
              onClick={() => {
                initRsvpAudio();
                playBeep(180);
              }}
            >
              [Yes]
            </Link>
            <span className="font-jetbrains text-[1.0625rem] leading-6 font-extrabold">
              &nbsp;-&nbsp;
            </span>
            <Link href="/home" className={CONTROL_CLASS}>
              [No]
            </Link>
          </div>
          <button
            type="button"
            className={CONTROL_CLASS}
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
