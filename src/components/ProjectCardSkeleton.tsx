const SHIMMER =
  "animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-[#0000FF]/5 via-[#0000FF]/15 to-[#0000FF]/5 motion-reduce:animate-none";

export function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className={`flex flex-col items-start gap-2.5 rounded-[4px] bg-[#E7E7FF] px-14 pt-7 pb-12 ${SHIMMER}`}
    >
      <div className="aspect-[547/271] w-full shrink-0 rounded-[4px] bg-[#0000FF]/10" />
      <div className="flex w-full flex-col items-start gap-1">
        <div className="h-9 w-40 bg-[#0000FF]/10" />
        <div className="h-3.5 w-full bg-[#0000FF]/10" />
        <div className="h-3.5 w-full bg-[#0000FF]/10" />
        <div className="h-3.5 w-4/5 bg-[#0000FF]/10" />
      </div>
      <div className="h-6 w-36 bg-[#0000FF]/10" />
    </div>
  );
}
