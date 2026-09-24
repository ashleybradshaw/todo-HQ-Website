"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { BookContact } from "@/components/book/BookContact";
import {
  BookPathToggle,
  type BookPathId,
} from "@/components/book/BookPathToggle";
import { BookPlanner } from "@/components/book/BookPlanner";
import { bookPage } from "@/content/pages/book";

function pathFromHash(hash: string): BookPathId | null {
  const id = hash.replace(/^#/, "").toLowerCase();
  if (id === "brief") return "brief";
  if (id === "quick" || id === "contact") return "quick";
  return null;
}

function pathFromType(type?: string): BookPathId | null {
  if (type === "coffee") return "quick";
  if (type === "hard-talk") return "brief";
  return null;
}

function hashForPath(path: BookPathId) {
  return path === "brief" ? "#brief" : "#quick";
}

function resolvePath(hash: string, type?: string): BookPathId {
  return pathFromHash(hash) ?? pathFromType(type) ?? "quick";
}

type BookPathsProps = {
  bookingType?: string;
};

/**
 * Path toggle + one active panel. SSR defaults to Quick note; hash / ?type
 * applied after mount. Hash wins over ?type when both are present.
 */
export function BookPaths({ bookingType }: BookPathsProps) {
  const [path, setPath] = useState<BookPathId>("quick");

  const syncFromLocation = useCallback(() => {
    setPath(resolvePath(window.location.hash, bookingType));
  }, [bookingType]);

  useLayoutEffect(() => {
    syncFromLocation();
    const onHashChange = () => syncFromLocation();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [syncFromLocation]);

  function selectPath(next: BookPathId) {
    setPath(next);
    const nextHash = hashForPath(next);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
    }
  }

  return (
    <div className="mt-12 scroll-mt-28">
      {/* Stable anchors — panels unmount, so hashes land on the toggle. */}
      <span id="quick" className="block scroll-mt-28" />
      <span id="contact" className="block scroll-mt-28" />
      <span id="brief" className="block scroll-mt-28" />

      <p className="type-body text-center">{bookPage.pathLead}</p>
      <div className="mt-6 flex justify-center">
        <BookPathToggle value={path} onChange={selectPath} />
      </div>

      <div
        role="tabpanel"
        id={`book-path-panel-${path}`}
        aria-labelledby={`book-path-tab-${path}`}
        className="mt-10"
      >
        {path === "quick" ? (
          <BookContact bookingType={bookingType} />
        ) : (
          <BookPlanner />
        )}
      </div>
    </div>
  );
}
