import { X_POSTS } from "@/content/social/x";
import { SOCIAL, X_HANDLE } from "@/lib/site";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function stamp(iso: string) {
  const [, month, day] = iso.split("-");
  const index = Number(month) - 1;
  const name = MONTHS[index] ?? month;
  return `${Number(day)} ${name}`;
}

/** Live handle: use the post URL when it is absolute, otherwise the profile. */
function liveHref(url: string) {
  if (!SOCIAL.x) {
    return null;
  }
  if (url.startsWith("https://")) {
    return url;
  }
  return SOCIAL.x;
}

const linkClass =
  "font-jetbrains text-foreground inline-flex min-h-6 items-center text-xs underline decoration-[color-mix(in_srgb,var(--foreground)_35%,transparent)] underline-offset-2 hover:opacity-80 focus-visible:ring-[3px] focus-visible:ring-current focus-visible:outline-none disabled:opacity-100";

function ViewOnX({ url }: { url: string }) {
  const href = liveHref(url);
  const label = "view on x ↗";

  if (!href) {
    return (
      <button type="button" disabled aria-label="View on X, not live yet" className={linkClass}>
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}, TODO Engineering on X`}
      className={linkClass}
    >
      {label}
    </a>
  );
}

/** Five-post log. No embed, no third-party script. */
export function XFeedPane() {
  const posts = X_POSTS.slice(0, 5);

  return (
    <div className="flex flex-col py-2" data-x-feed="">
      {SOCIAL.x && X_HANDLE ? (
        <p className="px-3 pb-1">
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${X_HANDLE}, TODO Engineering on X`}
            className={linkClass}
          >
            {X_HANDLE}
          </a>
        </p>
      ) : null}
      <ol className="font-jetbrains flex flex-col text-sm leading-6">
      {posts.map((post) => (
        <li
          key={post.date}
          className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 px-3 py-2"
        >
          <time
            dateTime={post.date}
            className="text-syn-number pt-0.5 text-right text-xs tabular-nums"
          >
            {stamp(post.date)}
          </time>
          <div className="min-w-0">
            <p className="text-foreground text-pretty">{post.text}</p>
            <ViewOnX url={post.url} />
          </div>
        </li>
      ))}
      </ol>
    </div>
  );
}
