"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { BrowserFrame } from "@/components/work/BrowserFrame";
import { UiTile } from "@/components/ui-docs/UiTile";
import { cn } from "@/lib/cn";
import { uiPage } from "@/content/pages/ui";

const HawkVideoAscii = dynamic(
  () =>
    import("@/components/HawkVideoAscii").then((m) => m.HawkVideoAscii),
  { ssr: false },
);

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function HawkPoster({ className }: { className?: string }) {
  return (
    <Image
      src={uiPage.previews.hawkPoster.src}
      alt={uiPage.previews.hawkPoster.alt}
      fill
      sizes="(min-width:768px) 960px, 100vw"
      className={cn("object-cover", className)}
    />
  );
}

export function HawkTile() {
  const { hawk } = uiPage.tiles;
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        setInView(visible);
        if (visible) setHasBeenVisible(true);
      },
      { rootMargin: "80px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onFallback = useCallback(() => setFailed(true), []);

  const showLive =
    !reduceMotion && !failed && hasBeenVisible;

  return (
    <UiTile
      title={hawk.title}
      description={hawk.description}
      span="full"
      className="ui-tile-full"
    >
      <div ref={rootRef} className="min-w-0">
        <BrowserFrame
          alt={uiPage.previews.hawkPoster.alt}
          caption="gateway · hawk"
          aspect="landscape"
        >
          <div className="absolute inset-0 bg-[#4545FF]">
            {showLive ? (
              <HawkVideoAscii active={inView} onFallback={onFallback} />
            ) : (
              <HawkPoster />
            )}
          </div>
        </BrowserFrame>
      </div>
    </UiTile>
  );
}
