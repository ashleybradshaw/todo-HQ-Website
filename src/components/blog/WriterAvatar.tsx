import Image from "next/image";
import { cn } from "@/lib/cn";

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function WriterAvatar({
  name,
  src,
  size,
}: {
  name: string;
  src: string | null;
  size: 24 | 64;
}) {
  const px = size === 24 ? "size-6" : "size-16";
  const type = size === 24 ? "text-[10px]" : "text-lg";

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", px)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-foreground font-jetbrains font-bold text-background",
        px,
        type,
      )}
      aria-hidden="true"
    >
      {initialsFromName(name)}
    </span>
  );
}
