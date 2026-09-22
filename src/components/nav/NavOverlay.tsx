"use client";

import type { RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BOOK_DUO,
  PRIMARY_LINKS,
  WORK_STILLS,
  isActivePath,
} from "@/components/nav/nav-links";
import { cn } from "@/lib/cn";

type NavOverlayProps = {
  id: string;
  open: boolean;
  pathname: string;
  onNavigate: () => void;
  firstLinkRef: RefObject<HTMLAnchorElement | null>;
};

export function NavOverlay({
  id,
  open,
  pathname,
  onNavigate,
  firstLinkRef,
}: NavOverlayProps) {
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
          <p className="font-jetbrains text-syn-comment text-xs tracking-wider uppercase">
            Book
          </p>
          <div className="flex flex-col gap-5">
            {BOOK_DUO.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "nav-stagger group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]",
                )}
                style={{ animationDelay: `${(PRIMARY_LINKS.length + index) * 40}ms` }}
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
        </div>

        <div className="hidden lg:col-span-4 lg:flex lg:flex-col lg:justify-center lg:gap-4 lg:border-l lg:border-border-ide lg:pl-8">
          {WORK_STILLS.map((still, index) => (
            <Link
              key={still.href}
              href={still.href}
              onClick={onNavigate}
              className={cn(
                "nav-stagger group relative block overflow-hidden rounded-[4px] border border-border-ide",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]",
              )}
              style={{
                animationDelay: `${(PRIMARY_LINKS.length + BOOK_DUO.length + index) * 40}ms`,
              }}
            >
              <Image
                src={still.src}
                alt={still.alt}
                width={640}
                height={400}
                className="aspect-[16/10] h-auto w-full object-cover transition-opacity group-hover:opacity-90"
              />
              <span className="font-jetbrains absolute right-3 bottom-3 bg-bg-canvas/90 px-2 py-1 text-xs text-foreground backdrop-blur-sm">
                {still.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
