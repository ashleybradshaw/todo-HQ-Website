"use client";

import { useEffect, useRef, useState } from "react";

function readProgress(targetId: string) {
  const target = document.getElementById(targetId);
  if (!target) {
    return 0;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const start = target.getBoundingClientRect().top + scrollTop;
  const end = start + target.offsetHeight - window.innerHeight;
  if (end <= start) {
    return scrollTop > start ? 1 : 0;
  }
  const raw = (scrollTop - start) / (end - start);
  return Math.round(Math.min(1, Math.max(0, raw)) * 1000) / 1000;
}

/** Scroll progress through one element. rAF-throttled. Null id stays at 0. */
export function useReadingProgress(targetId: string | null) {
  const rafRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!targetId) {
      return;
    }

    const update = () => {
      rafRef.current = 0;
      const next = readProgress(targetId);
      setProgress((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (rafRef.current) {
        return;
      }
      rafRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [targetId]);

  return targetId ? progress : 0;
}

/** True once the page h1 has scrolled above the viewport. */
export function useH1ScrolledAway(active: boolean, pathname: string) {
  const [away, setAway] = useState({ path: "", value: false });

  useEffect(() => {
    if (!active) {
      return;
    }

    const h1 = document.querySelector("#main h1");
    if (!h1) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        setAway({
          path: pathname,
          value: !entry.isIntersecting && entry.boundingClientRect.bottom < 0,
        });
      },
      { threshold: 0 },
    );
    observer.observe(h1);
    return () => observer.disconnect();
  }, [active, pathname]);

  return active && away.path === pathname && away.value;
}
