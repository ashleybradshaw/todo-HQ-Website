import type { ReactNode } from "react";

export default function BlogLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <>{children}</>;
}
