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

const AVATAR_SIZE = {
  16: { px: "size-4", type: "text-[8px]" },
  24: { px: "size-6", type: "text-[10px]" },
  64: { px: "size-16", type: "text-lg" },
} as const;

export function WriterAvatar({
  name,
  src,
  size,
}: {
  name: string;
  src: string | null;
  size: keyof typeof AVATAR_SIZE;
}) {
  const { px, type } = AVATAR_SIZE[size];

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
