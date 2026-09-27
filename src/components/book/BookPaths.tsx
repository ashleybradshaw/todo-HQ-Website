"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import { BookContact } from "@/components/book/BookContact";
import {
  BookPathToggle,
  type BookPathId,
} from "@/components/book/BookPathToggle";
import { BookPlanner } from "@/components/book/BookPlanner";
import { bookPage } from "@/content/pages/book";
import { scrollMtHeaderClass } from "@/lib/book-form";
import { cn } from "@/lib/cn";

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
 * Path toggle + both panels mounted. Inactive panel is hidden + inert so
 * Tab/SR skip it, while field values survive path switches. Name/email shared.
 */
export function BookPaths({ bookingType }: BookPathsProps) {
  const [path, setPath] = useState<BookPathId>("quick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const syncFromLocation = useCallback(() => {
    setPath(resolvePath(window.location.hash, bookingType));
  }, [bookingType]);

  useLayoutEffect(() => {
    // Sync path from hash / ?type (external URL state).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- location is an external system
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

  const quickActive = path === "quick";
  const briefActive = path === "brief";

  return (
    <div className={cn("mt-12", scrollMtHeaderClass)}>
      {/* Stable anchors — panels stay mounted; hashes land on the toggle. */}
      <span id="quick" className={cn("block", scrollMtHeaderClass)} />
      <span id="contact" className={cn("block", scrollMtHeaderClass)} />
      <span id="brief" className={cn("block", scrollMtHeaderClass)} />

      <p className="type-body text-center">{bookPage.pathLead}</p>
      <div className="mt-6 flex justify-center">
        <BookPathToggle value={path} onChange={selectPath} />
      </div>

      <div
        role="tabpanel"
        id="book-path-panel-quick"
        aria-labelledby="book-path-tab-quick"
        aria-hidden={!quickActive}
        inert={!quickActive ? true : undefined}
        className={cn("mt-10", !quickActive && "hidden")}
      >
        <BookContact
          bookingType={bookingType}
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
        />
      </div>

      <div
        role="tabpanel"
        id="book-path-panel-brief"
        aria-labelledby="book-path-tab-brief"
        aria-hidden={!briefActive}
        inert={!briefActive ? true : undefined}
        className={cn("mt-10", !briefActive && "hidden")}
      >
        <BookPlanner
          bookingType={bookingType}
          name={name}
          email={email}
          onNameChange={setName}
          onEmailChange={setEmail}
        />
      </div>
    </div>
  );
}
