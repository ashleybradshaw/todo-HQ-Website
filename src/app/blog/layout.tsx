import type { ReactNode } from "react";

export default function BlogLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground transition-[background-color,color] duration-[400ms] ease-in-out">
      {children}
    </main>
  );
}
