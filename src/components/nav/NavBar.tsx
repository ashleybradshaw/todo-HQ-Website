"use client";

import Link from "next/link";
import { LogoNav } from "@/components/LogoNav";
import { SprayButton } from "@/components/SprayButton";
import { MenuIcon } from "@/components/nav/MenuIcon";
import { PRIMARY_LINKS, isActivePath } from "@/components/nav/nav-links";
import { cn } from "@/lib/cn";
import { requestIdeBootReplay } from "@/hooks/useIdeBoot";
import type { NavTrailValue } from "@/components/nav/NavTrail";

type NavBarProps = {
  solid: boolean;
  open: boolean;
  menuId: string;
  pathname: string;
  simple?: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  trail: NavTrailValue | null;
  crumbVisible: boolean;
  progress: number;
};

export function NavBar({
  solid,
  open,
  menuId,
  pathname,
  simple = false,
  onToggle,
  onNavigate,
  trail,
  crumbVisible,
  progress,
}: NavBarProps) {
  return (
    <div
      data-solid={solid ? "" : undefined}
      className={cn(
        "relative z-10 flex items-center gap-3 overflow-hidden px-6 py-4 text-foreground transition-[background-color,color,border-color,border-radius,backdrop-filter] duration-[400ms] ease-out",
        solid
          ? "rounded-[4px] border border-border-ide bg-bg-canvas/95 backdrop-blur-md"
          : "border border-transparent bg-transparent",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Link
          href="/home"
          aria-label="//TODO Engineering"
          className="relative z-10 shrink-0"
          onClick={() => {
            requestIdeBootReplay();
            onNavigate?.();
          }}
        >
          <LogoNav className="text-brand-logo h-7 w-auto max-w-[11rem]" />
        </Link>
        {trail ? <NavCrumb trail={trail} visible={crumbVisible} /> : null}
      </div>

      {simple ? (
        <>
          <nav
            className="ml-auto hidden items-center gap-8 lg:flex"
            aria-label="Primary"
          >
            {PRIMARY_LINKS.map((link) => (
              <SimpleNavLink
                key={link.href}
                href={link.href}
                label={link.label}
                pathname={pathname}
                onClick={onNavigate}
              />
            ))}
            <SprayButton />
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:hidden">
            <SprayButton compact />
            <MenuButton open={open} menuId={menuId} onToggle={onToggle} />
          </div>
        </>
      ) : (
        <div className="ml-auto flex items-center gap-3">
          <div className="lg:hidden">
            <SprayButton compact />
          </div>

          <MenuButton
            open={open}
            menuId={menuId}
            onToggle={onToggle}
            showLabel
          />

          <div className="hidden lg:block">
            <SprayButton />
          </div>
        </div>
      )}
      {trail ? (
        <div
          data-nav-progress=""
          aria-hidden="true"
          className="bg-brand-logo pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px origin-left"
          style={{ transform: `scaleX(${progress})` }}
        />
      ) : null}
    </div>
  );
}

export function MenuButton({
  open,
  menuId,
  onToggle,
  showLabel = false,
}: {
  open: boolean;
  menuId: string;
  onToggle: () => void;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "font-jetbrains inline-flex shrink-0 cursor-pointer items-center justify-center overflow-visible rounded-[4px] bg-transparent text-foreground",
        "transition-[background-color,transform,color] duration-200 ease-out",
        "hover:bg-foreground/5 active:scale-[0.99] active:bg-foreground/10",
        "focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none",
        "motion-reduce:active:scale-100",
        showLabel
          ? "min-h-11 min-w-11 gap-2 px-2 text-xs font-bold tracking-wider uppercase lg:px-3"
          : "size-11",
      )}
      aria-expanded={open}
      aria-controls={menuId}
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onToggle}
    >
      {showLabel ? (
        <span aria-hidden="true" className="hidden lg:inline">
          {open ? "Close" : "Menu"}
        </span>
      ) : null}
      <MenuIcon open={open} />
    </button>
  );
}

function SimpleNavLink({
  href,
  label,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  pathname: string;
  onClick?: () => void;
}) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "font-jetbrains text-base hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]",
        active && "underline",
      )}
    >
      {label}
    </Link>
  );
}

function NavCrumb({
  trail,
  visible,
}: {
  trail: NavTrailValue;
  visible: boolean;
}) {
  return (
    <nav
      data-nav-breadcrumb=""
      aria-label={visible ? "Breadcrumb" : undefined}
      aria-hidden={visible ? undefined : true}
      inert={visible ? undefined : true}
      className={cn(
        "font-jetbrains pointer-events-none hidden min-w-0 items-center gap-4 text-xs text-muted transition-opacity duration-[400ms] ease-in-out motion-reduce:transition-none sm:flex",
        visible ? "pointer-events-auto opacity-100" : "opacity-0",
      )}
    >
      <span
        aria-hidden="true"
        className="border-border-ide h-4 w-px shrink-0 self-center border-l"
      />
      <ol className="flex min-w-0 items-center gap-2">
        <li className="shrink-0">
          <Link
            href={trail.parentHref}
            className="inline-flex min-h-6 items-center hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
          >
            {trail.parentLabel}
          </Link>
        </li>
        <li className="shrink-0" aria-hidden="true">
          →
        </li>
        <li className="min-w-0 truncate" aria-current="page">
          {trail.current}
        </li>
      </ol>
    </nav>
  );
}
