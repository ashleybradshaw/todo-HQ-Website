"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavBar } from "@/components/nav/NavBar";
import { NavOverlay } from "@/components/nav/NavOverlay";
import {
  PRIMARY_LINKS,
  isActivePath,
  isGatewayPath,
} from "@/components/nav/nav-links";
import { cn } from "@/lib/cn";

const SOLID_SCROLL_Y = 48;

function subscribeNavMode(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-nav"],
  });
  return () => observer.disconnect();
}

function readSimpleKillSwitch() {
  return document.documentElement.dataset.nav === "simple";
}

function subscribeScroll(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

function readScrolledSolid() {
  return window.scrollY > SOLID_SCROLL_Y;
}

export function SiteNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const simple = useSyncExternalStore(
    subscribeNavMode,
    readSimpleKillSwitch,
    () => false,
  );
  const scrolledSolid = useSyncExternalStore(
    subscribeScroll,
    readScrolledSolid,
    () => false,
  );
  const solid = !simple && scrolledSolid;
  const [menuPath, setMenuPath] = useState(pathname);
  const menuId = useId();
  const wasOpenRef = useRef(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const img = new Image();
    img.src = "/nav/menu-founders.webp";
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      if (wasOpenRef.current) {
        const toggle = headerRef.current?.querySelector<HTMLButtonElement>(
          'button[aria-controls]',
        );
        toggle?.focus({ preventScroll: true });
      }
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || !headerRef.current) {
        return;
      }

      const focusables = headerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
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
  }, [menuOpen]);

  if (isGatewayPath(pathname)) {
    return null;
  }

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed z-50 text-foreground transition-[top,left,right,background-color,color,border-color] duration-[400ms] ease-out",
        simple
          ? "inset-x-0 top-0 bg-bg-canvas"
          : solid
            ? "top-3 right-3 left-3"
            : "inset-x-0 top-0",
      )}
    >
      <NavBar
        solid={solid}
        open={menuOpen}
        menuId={menuId}
        pathname={pathname}
        simple={simple}
        onToggle={toggleMenu}
        onNavigate={closeMenu}
      />

      {simple ? (
        menuOpen ? (
          <SimpleMobileOverlay
            id={menuId}
            pathname={pathname}
            onNavigate={closeMenu}
            firstLinkRef={firstLinkRef}
          />
        ) : null
      ) : (
        <NavOverlay
          id={menuId}
          open={menuOpen}
          pathname={pathname}
          onNavigate={closeMenu}
          firstLinkRef={firstLinkRef}
        />
      )}
    </header>
  );
}

function SimpleMobileOverlay({
  id,
  pathname,
  onNavigate,
  firstLinkRef,
}: {
  id: string;
  pathname: string;
  onNavigate: () => void;
  firstLinkRef: RefObject<HTMLAnchorElement | null>;
}) {
  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="bg-bg-canvas fixed inset-0 z-0 flex flex-col items-center justify-center lg:hidden"
    >
      <nav className="flex flex-col items-center gap-8" aria-label="Primary">
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
                "font-jetbrains text-2xl hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]",
                active && "underline",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
