const SHIMMER =
  "animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-foreground/5 via-foreground/15 to-foreground/5 motion-reduce:animate-none";

export function ProjectCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className={`flex flex-col items-start gap-2.5 rounded-[4px] bg-foreground/10 px-14 pt-7 pb-12 ${SHIMMER}`}
    >
      <div className="aspect-[547/271] w-full shrink-0 rounded-[4px] bg-foreground/10" />
      <div className="flex w-full flex-col items-start gap-1">
        <div className="h-9 w-40 bg-foreground/10" />
        <div className="h-3.5 w-full bg-foreground/10" />
        <div className="h-3.5 w-full bg-foreground/10" />
        <div className="h-3.5 w-4/5 bg-foreground/10" />
      </div>
      <div className="h-6 w-36 bg-foreground/10" />
    </div>
  );
}
