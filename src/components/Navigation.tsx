"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogoNav } from "@/components/LogoNav";
import { SprayButton } from "@/components/SprayButton";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/book", label: "Book Team" },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuId = useId();
  const innerSite = pathname !== "/" && pathname !== "/intro";

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-bg-canvas text-foreground transition-[background-color,color,border-color] duration-[400ms] ease-in-out">
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="mobile-nav"
            id={menuId}
            className="bg-bg-canvas fixed inset-0 flex flex-col items-center justify-center md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <nav className="flex flex-col items-center gap-8">
              {LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  pathname={pathname}
                  className="text-2xl"
                  onClick={() => setMenuOpen(false)}
                />
              ))}
              {innerSite ? <SprayButton /> : null}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 flex items-center gap-3 border-b border-border-ide px-6 py-4 pr-28 md:pr-6">
        <Link
          href="/home"
          aria-label="//TODO Engineering"
          className="relative z-10 min-w-0"
          onClick={() => setMenuOpen(false)}
        >
          {innerSite ? (
            <LogoNav className="h-7 w-auto max-w-[11rem]" />
          ) : null}
        </Link>

        <nav className="ml-auto hidden items-center gap-8 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              pathname={pathname}
            />
          ))}
          {innerSite ? <SprayButton /> : null}
        </nav>

        <div className="absolute top-1/2 right-5 z-20 flex shrink-0 -translate-y-1/2 items-center gap-3 md:hidden">
          {innerSite ? <SprayButton compact /> : null}
          <button
            type="button"
            className="shrink-0 cursor-pointer bg-transparent p-1"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  pathname,
  className,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  className?: string;
  onClick?: () => void;
}) {
  const active = pathname === href;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "font-jetbrains text-base hover:underline",
        active && "underline",
        className,
      )}
    >
      {label}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      {open ? (
        <>
          <path d="M5 5 L19 19" />
          <path d="M19 5 L5 19" />
        </>
      ) : (
        <>
          <path d="M4 7 H20" />
          <path d="M4 12 H20" />
          <path d="M4 17 H20" />
        </>
      )}
    </svg>
  );
}
