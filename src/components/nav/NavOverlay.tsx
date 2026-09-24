"use client";

import {
  useSyncExternalStore,
  type RefObject,
} from "react";
import Link from "next/link";
import { AsciiReveal } from "@/components/about/AsciiReveal";
import {
  BOOK_DUO,
  PRIMARY_LINKS,
  isActivePath,
} from "@/components/nav/nav-links";
import { TypeComment } from "@/components/TypeComment";
import { cn } from "@/lib/cn";

type NavOverlayProps = {
  id: string;
  open: boolean;
  pathname: string;
  onNavigate: () => void;
  firstLinkRef: RefObject<HTMLAnchorElement | null>;
};

function subscribeLg(onChange: () => void) {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readLg() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function FoundersPlate({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("nav-stagger pointer-events-none", className)}
      style={{
        animationDelay: `${(PRIMARY_LINKS.length + BOOK_DUO.length) * 40}ms`,
      }}
    >
      <AsciiReveal
        src="/nav/menu-founders.webp"
        alt=""
        priority
        className="rounded-[4px]"
      />
    </div>
  );
}

export function NavOverlay({
  id,
  open,
  pathname,
  onNavigate,
  firstLinkRef,
}: NavOverlayProps) {
  const isLg = useSyncExternalStore(subscribeLg, readLg, () => false);

  if (!open) {
    return null;
  }

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="bg-bg-canvas text-foreground fixed inset-0 z-0 flex flex-col overflow-y-auto pt-[4.5rem]"
    >
      <div
        className={cn(
          "mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14",
          "motion-reduce:[&_.nav-stagger]:animate-none motion-reduce:[&_.nav-stagger]:opacity-100 motion-reduce:[&_.nav-stagger]:translate-y-0",
        )}
      >
        <nav
          className="flex flex-col justify-center gap-4 lg:col-span-5"
          aria-label="Primary"
        >
          {PRIMARY_LINKS.map((link, index) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={cn(
                  "nav-stagger type-title group inline-flex items-center gap-3 text-foreground transition-opacity hover:opacity-80",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foreground)]",
                )}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 shrink-0 bg-current transition-opacity",
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col justify-center gap-6 border-t border-border-ide pt-8 lg:col-span-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <TypeComment text="// Book" className="text-syn-comment" />
          <div className="flex flex-col gap-5">
            {BOOK_DUO.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "nav-stagger group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]",
                )}
                style={{
                  animationDelay: `${(PRIMARY_LINKS.length + index) * 40}ms`,
                }}
              >
                <p className="font-jetbrains text-syn-keyword text-sm font-medium group-hover:underline">
                  {item.label}
                </p>
                <p className="font-jetbrains text-syn-comment mt-0.5 text-xs">
                  {item.vibe}
                </p>
              </Link>
            ))}
          </div>

          {/* Mobile — single mount (no lg:hidden twin racing scramble at 0×0) */}
          {!isLg ? (
            <FoundersPlate className="mt-2 w-full max-w-[240px]" />
          ) : null}
        </div>

        {isLg ? (
          <div className="lg:col-span-4 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-border-ide lg:pl-8">
            <FoundersPlate className="w-full" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
