import Image from "next/image";
import Link from "next/link";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { Reveal } from "@/components/motion/Reveal";
import { siteData } from "@/data/siteData";

export function SiteHeader() {
  const { nav } = siteData;

  return (
    <header className="relative">
      <Reveal>
        <SiteLogo />
      </Reveal>

      <Reveal delay={0.08} className="relative grid-border-b">
        <div className="flex h-[59px] items-start justify-center px-[163px] pt-0">
          <nav
            aria-label="Primary"
            className="flex h-[34px] w-full max-w-[906px] items-center rounded-[60px] bg-nav-surface px-3 py-2 text-accent"
          >
            {nav.items.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <Link
                  href={item.href}
                  className="font-mono text-[12px] whitespace-nowrap text-accent"
                >
                  {item.label}
                </Link>
                {index < nav.items.length - 1 ? (
                  <span
                    className={`relative flex h-2.5 items-center ${
                      index === 0 ? "w-[254px]" : "w-[238px]"
                    }`}
                    aria-hidden="true"
                  >
                    <span
                      className={`absolute top-1/2 h-px -translate-y-1/2 bg-accent ${
                        item.active ? "left-4 right-0" : "inset-x-0"
                      }`}
                    />
                    {item.active ? (
                      <span className="relative z-10 h-2.5 w-8 rounded-[10px] bg-accent" />
                    ) : null}
                  </span>
                ) : null}
              </div>
            ))}
          </nav>
        </div>

        <Link
          href={nav.spray.href}
          className="absolute top-[44px] right-[163px] flex h-[30px] items-center justify-center gap-2 rounded-[4px] border border-accent px-2 py-1 font-sans text-[12px] font-bold tracking-[-0.12px] text-accent uppercase"
        >
          <span className="relative size-5 shrink-0 overflow-clip">
            <Image
              src="/brand/icon-spray.svg"
              alt=""
              width={20}
              height={20}
              unoptimized
              className="size-full"
            />
          </span>
          {nav.spray.label}
        </Link>
      </Reveal>
    </header>
  );
}
