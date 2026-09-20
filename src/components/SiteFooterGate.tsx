"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Hides footer on landing / intro; children stay a server tree from layout. */
export function SiteFooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/intro") {
    return null;
  }
  return children;
}
