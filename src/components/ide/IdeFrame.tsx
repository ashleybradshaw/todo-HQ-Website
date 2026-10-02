import type { ReactNode } from "react";
import { TypeComment } from "@/components/TypeComment";

export type IdeFrameProps = {
  label: string;
  meta: ReactNode;
  children: ReactNode;
  labelledBy: string;
};

/** Index body on the frame track (/work, /blog). */
export function IdeFrame({ label, meta, children, labelledBy }: IdeFrameProps) {
  return (
    <section
      data-ide-frame
      className="border-border-ide border"
      aria-labelledby={labelledBy}
    >
      <div className="border-border-ide flex justify-between border-b px-6 py-2">
        <TypeComment
          id={labelledBy}
          text={label}
          className="text-syn-keyword"
        />
        <p className="type-label text-syn-comment font-normal">{meta}</p>
      </div>
      <div className="flex flex-col gap-6 p-4 sm:p-6">{children}</div>
    </section>
  );
}
