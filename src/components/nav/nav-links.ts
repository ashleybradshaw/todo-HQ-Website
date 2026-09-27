import { nav } from "@/content/pages/shared";

export const PRIMARY_LINKS = nav.primary;

/** Landing desktop crawl row — same order/labels as site Primary nav. */
export const LANDING_CRAWL_LINKS = PRIMARY_LINKS;

export const BOOK_DUO = nav.bookDuo;

export function isGatewayPath(pathname: string) {
  return pathname === "/" || pathname === "/intro";
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
