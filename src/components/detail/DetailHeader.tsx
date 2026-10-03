import type { ReactNode } from "react";
import type { HeadingLevel } from "@/components/PageHero";

export type DetailHeaderProps = {
  breadcrumbs: ReactNode;
  title: string;
  meta: ReactNode;
  /** Page headers stay h1. Specimens pass h2 or h3. */
  headingLevel?: HeadingLevel;
};

/** Detail lock header. Breadcrumb sits on the shell’s pt-28 (112px). */
export function DetailHeader({
  breadcrumbs,
  title,
  meta,
  headingLevel = "h1",
}: DetailHeaderProps) {
  const Title = headingLevel;

  return (
    <header className="text-center">
      <div className="flex min-w-0 justify-center [&_ol]:justify-center">
        {breadcrumbs}
      </div>
      <Title className="type-display mx-auto mt-6 text-center font-bold tracking-tight text-balance">
        {title}
      </Title>
      <div className="type-body-sm mt-4 flex justify-center text-center">{meta}</div>
    </header>
  );
}
