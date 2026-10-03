import type { ReactNode } from "react";

export type DetailHeaderProps = {
  breadcrumbs: ReactNode;
  title: string;
  meta: ReactNode;
};

/** Detail lock header. Breadcrumb sits on the shell’s pt-28 (112px). */
export function DetailHeader({ breadcrumbs, title, meta }: DetailHeaderProps) {
  return (
    <header className="text-center">
      <div className="flex min-w-0 justify-center [&_ol]:justify-center">
        {breadcrumbs}
      </div>
      <h1 className="type-display mx-auto mt-6 text-center font-bold tracking-tight text-balance">
        {title}
      </h1>
      <div className="type-body-sm mt-4 flex justify-center text-center">{meta}</div>
    </header>
  );
}
