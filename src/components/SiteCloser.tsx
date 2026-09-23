import { SignalStrip } from "@/components/about/SignalStrip";
import { WorkTogetherBand } from "@/components/about/WorkTogetherBand";

export type SiteCloserVariant = "full" | "book";

type SiteCloserProps = {
  /** full = SignalStrip then WorkTogetherBand; book = WorkTogetherBand only */
  variant: SiteCloserVariant;
};

/**
 * Shared page closer above the universal footer (SiteFooterGate).
 * Indexes: proof + ask. Drills: soft ask only. Home / Book / gateway: omit.
 */
export function SiteCloser({ variant }: SiteCloserProps) {
  return (
    <>
      {variant === "full" ? <SignalStrip /> : null}
      <WorkTogetherBand />
    </>
  );
}
