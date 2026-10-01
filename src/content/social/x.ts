/**
 * Mock X posts for the /home feed.x tab.
 * // TEST COPY — replace with real posts when the handle is live.
 * While SOCIAL.x is empty, the pane does not link out.
 */

export type XPost = {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  text: string;
  /** Status URL once the account exists. Empty while the feed is mock. */
  url: string;
};

// TEST COPY
export const X_POSTS: readonly XPost[] = [
  {
    date: "2026-09-29",
    text: "Checkpoint passed. The build is on the line, not in a slide.",
    url: "",
  },
  {
    date: "2026-09-26",
    text: "ReadyGo is in build. Conditions, effort and kit, settled before you head out.",
    url: "",
  },
  {
    date: "2026-09-22",
    text: "RepDaily ships the habit. Camera, count, streak. Live on iOS and Android.",
    url: "",
  },
  {
    date: "2026-09-18",
    text: "Spec first. A factory run does not start from a blank file.",
    url: "",
  },
  {
    date: "2026-09-12",
    text: "Two people. Agents on the heavy lifts. A human on every step you cannot undo.",
    url: "",
  },
];
