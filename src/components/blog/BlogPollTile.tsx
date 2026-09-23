"use client";

import { useCallback, useId, useMemo, useSyncExternalStore } from "react";
import type { BlogPoll } from "@/content/blog-polls";
import { cn } from "@/lib/cn";

const POLL_EVENT = "todo-blog-poll";

type StoredVote = {
  optionId: string;
  at: number;
};

function storageKey(pollId: string) {
  return `todo-blog-poll:${pollId}`;
}

function parseVote(raw: string | null, poll: BlogPoll): StoredVote | null {
  if (!raw) {
    return null;
  }
  try {
    const data = JSON.parse(raw) as StoredVote;
    if (
      typeof data?.optionId === "string" &&
      poll.options.some((option) => option.id === data.optionId)
    ) {
      return {
        optionId: data.optionId,
        at: typeof data.at === "number" ? data.at : Date.now(),
      };
    }
  } catch {
    // Legacy plain string id
    if (poll.options.some((option) => option.id === raw)) {
      return { optionId: raw, at: Date.now() };
    }
  }
  return null;
}

function subscribePoll(callback: () => void) {
  window.addEventListener(POLL_EVENT, callback);
  window.addEventListener("storage", callback);
  queueMicrotask(callback);
  return () => {
    window.removeEventListener(POLL_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readVote(poll: BlogPoll): StoredVote | null {
  try {
    return parseVote(window.localStorage.getItem(storageKey(poll.id)), poll);
  } catch {
    return null;
  }
}

function writeVote(pollId: string, optionId: string) {
  const payload: StoredVote = { optionId, at: Date.now() };
  try {
    window.localStorage.setItem(storageKey(pollId), JSON.stringify(payload));
  } catch {
    // Private mode / quota — still show results for this session via event.
  }
  window.dispatchEvent(new Event(POLL_EVENT));
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const optionClass =
  "type-label flex w-full cursor-pointer items-center rounded-[4px] border border-current px-3 py-2 text-left transition-opacity duration-[400ms] ease-in-out hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none";

export function BlogPollTile({
  poll,
  className,
}: {
  poll: BlogPoll;
  className?: string;
}) {
  const groupId = useId();
  const resultsId = `${groupId}-results`;
  // Primitive snapshot — object identity from readVote() would thrash Object.is.
  const voteOptionId = useSyncExternalStore(
    subscribePoll,
    () => readVote(poll)?.optionId ?? null,
    () => null,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );

  const tallies = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const option of poll.options) {
      counts[option.id] = poll.seed[option.id] ?? 0;
    }
    if (voteOptionId) {
      counts[voteOptionId] = (counts[voteOptionId] ?? 0) + 1;
    }
    return counts;
  }, [poll, voteOptionId]);

  const total = useMemo(
    () => Object.values(tallies).reduce((sum, n) => sum + n, 0),
    [tallies],
  );

  const onVote = useCallback(
    (optionId: string) => {
      if (voteOptionId) {
        return;
      }
      writeVote(poll.id, optionId);
    },
    [poll.id, voteOptionId],
  );

  return (
    <div
      data-blog-poll={poll.id}
      className={cn(
        "flex h-full min-w-0 flex-col border border-border-ide p-5",
        className,
      )}
    >
      <p className="type-label inline-flex w-fit rounded-[4px] border border-current px-2 py-0.5">
        POLL
      </p>
      <h2 className="type-subhead mt-3 tracking-tight text-balance">
        {poll.question}
      </h2>

      {!voteOptionId ? (
        <div
          role="radiogroup"
          aria-labelledby={`${groupId}-q`}
          className="mt-5 flex flex-col gap-2"
        >
          <span id={`${groupId}-q`} className="sr-only">
            {poll.question}
          </span>
          {poll.options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={false}
              className={optionClass}
              onClick={() => onVote(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div
          id={resultsId}
          role="status"
          aria-live="polite"
          className="mt-5 flex flex-col gap-3"
        >
          {poll.options.map((option) => {
            const count = tallies[option.id] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const selected = option.id === voteOptionId;
            return (
              <div key={option.id} className="min-w-0">
                <div className="type-meta mb-1 flex items-baseline justify-between gap-2">
                  <span className={cn(selected && "font-bold")}>
                    {option.label}
                    {selected ? (
                      <span className="sr-only"> (your vote)</span>
                    ) : null}
                  </span>
                  <span className="text-syn-comment shrink-0">{pct}%</span>
                </div>
                <div
                  className="h-2 w-full border border-border-ide bg-transparent"
                  aria-hidden="true"
                >
                  <div
                    className={cn(
                      "h-full bg-current",
                      !reducedMotion &&
                        "transition-[width] duration-[400ms] ease-out",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
