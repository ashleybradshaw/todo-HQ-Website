"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@/lib/cn";

const MAX_MS = 480;
const MIN_CHAR_MS = 18;
const MAX_CHAR_MS = 34;

type TypeCommentProps = {
  text: string;
  className?: string;
  as?: "p" | "h1" | "span";
  id?: string;
};

function isCommentTitle(text: string) {
  return text.trimStart().startsWith("//");
}

function charIntervalMs(length: number) {
  if (length <= 0) {
    return MAX_CHAR_MS;
  }
  return Math.max(MIN_CHAR_MS, Math.min(MAX_CHAR_MS, MAX_MS / length));
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function readReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeNever() {
  return () => {};
}

/**
 * Quick letter build for // section titles — logo kinship, not a cascade.
 * Non-// text renders static. IO once; reduced-motion / no-JS / SSR show the full string.
 */
export function TypeComment({
  text,
  className,
  as: Tag = "p",
  id,
}: TypeCommentProps) {
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    () => false,
  );
  const [count, setCount] = useState(text.length);
  const [typing, setTyping] = useState(false);
  const startedRef = useRef(false);
  const rootRef = useRef<HTMLElement | null>(null);

  const wantsAnimate =
    hydrated && isCommentTitle(text) && !reduceMotion;
  // Full string until a JS typing run starts — SSR, no-JS, reduced-motion, pre-IO.
  const visible =
    !wantsAnimate || !typing ? text : text.slice(0, count);

  useEffect(() => {
    if (!wantsAnimate) {
      return;
    }

    startedRef.current = false;
    const el = rootRef.current;
    if (!el) {
      return;
    }

    let timer = 0;
    let observer: IntersectionObserver | null = null;
    const stepMs = charIntervalMs(text.length);

    const run = () => {
      if (startedRef.current) {
        return;
      }
      startedRef.current = true;
      observer?.disconnect();

      setTyping(true);
      let i = 1;
      setCount(1);
      if (text.length <= 1) {
        setTyping(false);
        return;
      }

      timer = window.setInterval(() => {
        i += 1;
        if (i >= text.length) {
          setCount(text.length);
          setTyping(false);
          window.clearInterval(timer);
          timer = 0;
          return;
        }
        setCount(i);
      }, stepMs);
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          run();
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer?.disconnect();
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [wantsAnimate, text]);

  return (
    <Tag
      ref={rootRef as never}
      id={id}
      className={cn("type-label", className)}
    >
      {typing ? (
        <>
          <span className="sr-only">{text}</span>
          <span
            aria-hidden="true"
            className="inline-block whitespace-pre text-left"
            style={{ minWidth: `${text.length}ch` }}
          >
            {visible}
          </span>
        </>
      ) : (
        text
      )}
    </Tag>
  );
}
