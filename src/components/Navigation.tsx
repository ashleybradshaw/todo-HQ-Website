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
  { href: "/blog", label: "Blog" },
  { href: "/book", label: "Book Team" },
] as const;

function isGatewayPath(pathname: string) {
  return pathname === "/" || pathname === "/intro";
}

export function Navigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuId = useId();

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

  // Ready? Yes/No gateway only — /home keeps full nav with Spray.
  if (isGatewayPath(pathname)) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-bg-canvas text-foreground transition-[background-color,color,border-color] duration-[400ms] ease-in-out">
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="mobile-nav"
            id={menuId}
            className="bg-bg-canvas fixed inset-0 flex flex-col items-center justify-center lg:hidden"
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
              <SprayButton />
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 flex items-center gap-3 border-b border-border-ide px-6 py-4 pr-28 lg:pr-6">
        <Link
          href="/home"
          aria-label="//TODO Engineering"
          className="relative z-10 min-w-0"
          onClick={() => setMenuOpen(false)}
        >
          <LogoNav className="text-brand-logo h-7 w-auto max-w-[11rem]" />
        </Link>

        <nav className="ml-auto hidden items-center gap-8 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              pathname={pathname}
            />
          ))}
          <SprayButton />
        </nav>

        <div className="absolute top-1/2 right-7 z-20 flex shrink-0 -translate-y-1/2 items-center gap-3 lg:hidden">
          <SprayButton compact />
          <button
            type="button"
            className={cn(
              "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-visible rounded-[4px] bg-transparent text-foreground",
              "transition-[background-color,transform,color] duration-200 ease-out",
              "hover:bg-foreground/5 active:scale-[0.99] active:bg-foreground/10",
              "focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
              "motion-reduce:active:scale-100",
            )}
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
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "font-jetbrains text-base hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]",
        active && "underline",
        className,
      )}
    >
      {label}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  // 24px glyph to match Spray compact; open state meets at mid-Y then ±45° inside the viewBox.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="size-6 overflow-visible"
    >
      <path
        d="M5 8 H19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        className={cn(
          "origin-center transition-transform duration-200 ease-out motion-reduce:transition-none",
          open && "translate-y-1 rotate-45",
        )}
        style={{ transformBox: "fill-box" }}
      />
      <path
        d="M5 16 H19"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        className={cn(
          "origin-center transition-transform duration-200 ease-out motion-reduce:transition-none",
          open && "-translate-y-1 -rotate-45",
        )}
        style={{ transformBox: "fill-box" }}
      />
    </svg>
  );
}
