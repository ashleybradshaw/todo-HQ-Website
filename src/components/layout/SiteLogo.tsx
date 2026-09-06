import Image from "next/image";
import Link from "next/link";
import { siteData } from "@/data/siteData";
import { cn } from "@/lib/cn";

type SiteLogoProps = {
  className?: string;
  size?: "hero" | "footer";
};

export function SiteLogo({ className, size = "hero" }: SiteLogoProps) {
  const isHero = size === "hero";

  return (
    <Link
      href="/"
      aria-label={siteData.metadata.title}
      className={cn(
        "mx-auto flex w-full max-w-[1339px] items-baseline justify-center gap-10 pt-[100px] pb-[50px]",
        className,
      )}
    >
      <span className="relative block h-[205px] w-[218px] shrink-0 overflow-clip">
        <Image
          src="/brand/logo-slashes.svg"
          alt=""
          width={218}
          height={205}
          priority={isHero}
          unoptimized
          className="size-full"
        />
      </span>
      <span className="relative block h-[267px] w-[1043px] shrink-0 overflow-clip">
        <Image
          src="/brand/logo-wordmark.svg"
          alt=""
          width={1043}
          height={267}
          priority={isHero}
          unoptimized
          className="h-[267px] w-[1043px] max-w-none"
        />
      </span>
    </Link>
  );
}
