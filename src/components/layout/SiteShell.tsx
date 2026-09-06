import type { ReactNode } from "react";
import { GridFrame } from "@/components/layout/GridFrame";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="bg-dot-grid min-h-full text-foreground">
      <GridFrame>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </GridFrame>
    </div>
  );
}
