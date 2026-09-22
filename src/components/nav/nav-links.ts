export const PRIMARY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Blog" },
  { href: "/book", label: "Book" },
] as const;

export const BOOK_DUO = [
  {
    href: "/book?type=coffee",
    label: "Coffee · 15 min",
    vibe: "Chemistry, is this a fit, no deck.",
  },
  {
    href: "/book?type=hard-talk",
    label: "Hard talk · 60 min",
    vibe: "Dig into the real issue, scope the fix.",
  },
] as const;

export const WORK_STILLS = [
  {
    href: "/work/readygo",
    src: "/work/readygo.jpg",
    alt: "ReadyGo — work still",
    label: "ReadyGo",
  },
  {
    href: "/work/repdaily",
    src: "/work/repdaily.jpg",
    alt: "RepDaily — work still",
    label: "RepDaily",
  },
] as const;

export function isGatewayPath(pathname: string) {
  return pathname === "/" || pathname === "/intro";
}

export function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
