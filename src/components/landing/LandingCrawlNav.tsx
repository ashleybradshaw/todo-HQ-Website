"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { MenuButton } from "@/components/nav/NavBar";
import { LANDING_CRAWL_LINKS } from "@/components/nav/nav-links";
import { NavOverlay } from "@/components/nav/NavOverlay";
import { cn } from "@/lib/cn";

const LINK_CLASS =
  "font-jetbrains rounded-[4px] text-sm tracking-wide text-[#DFDFFF]/85 transition-opacity duration-[400ms] ease-out hover:text-[#DFDFFF] hover:underline focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none motion-reduce:transition-none";

/**
 * Landing crawl chrome: quiet desktop link row + shared SiteNav NavOverlay.
 * Mobile trigger + overlay portal to document.body at z-[60] so they sit above
 * GatewayIdle (z-40); closed SSR still renders in-tree for crawlable hrefs.
 */
export function LandingCrawlNav() {
  const pathname = usePathname();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) {
        buttonRef.current
          ?.querySelector<HTMLButtonElement>("button[aria-controls]")
          ?.focus({ preventScroll: true });
      }
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      firstLinkRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  // Land content behind the open menu must not receive focus or clicks.
  useEffect(() => {
    if (!open) {
      return;
    }
    const shell = document.querySelector<HTMLElement>(".landing-shell.fixed");
    if (!shell) {
      return;
    }
    shell.inert = true;
    return () => {
      shell.inert = false;
    };
  }, [open]);

  const mobileChrome = (
    <div
      className={cn(
        "md:hidden",
        // Portaled: above GatewayIdle z-40 and NoiseOverlay z-50.
        // In-tree SSR fallback still mounts links for crawlers while closed.
        mounted && "pointer-events-none fixed inset-0 z-[60]",
      )}
    >
      <div
        ref={buttonRef}
        className={cn(
          "pointer-events-auto absolute inset-x-0 top-0 z-20 flex justify-end px-4 pt-4 transition-colors duration-[400ms] ease-out motion-reduce:transition-none",
          // Closed: powder on electric blue landing. Open: brand blue on light overlay.
          open
            ? "text-[#4545FF] [--foreground:#4545FF]"
            : "text-[#DFDFFF] [--foreground:#DFDFFF]",
        )}
      >
        <MenuButton
          open={open}
          menuId={menuId}
          onToggle={() => setOpen((value) => !value)}
        />
      </div>
      {/* NavOverlay is fixed inset-0 z-0 — paints inside this z-[60] context when portaled. */}
      <NavOverlay
        id={menuId}
        open={open}
        pathname={pathname}
        onNavigate={() => setOpen(false)}
        firstLinkRef={firstLinkRef}
      />
    </div>
  );

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4 md:px-6">
        <nav
          aria-label="Landing"
          className="pointer-events-auto ml-auto hidden w-fit items-center gap-5 md:flex"
        >
          {LANDING_CRAWL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK_CLASS}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {mounted ? createPortal(mobileChrome, document.body) : mobileChrome}
    </>
  );
}
