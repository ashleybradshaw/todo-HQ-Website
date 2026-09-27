import { homePage } from "@/content/pages/home";

const STACK = [
  { id: "figma", label: "Figma" },
  { id: "cursor", label: "Cursor" },
  { id: "openai", label: "Codex" },
  { id: "claude", label: "Claude Code" },
  { id: "vercel", label: "Vercel" },
  { id: "github", label: "GitHub" },
  { id: "swift", label: "Swift" },
  { id: "xcode", label: "iOS" },
  { id: "android", label: "Android" },
  { id: "nodejs", label: "Node.js" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "redis", label: "Redis" },
  { id: "docker", label: "Docker" },
] as const;

type StackId = (typeof STACK)[number]["id"];

const STACK_BY_ID = Object.fromEntries(
  STACK.map((item) => [item.id, item]),
) as Record<StackId, (typeof STACK)[number]>;

function StackIcon({ id, label }: { id: string; label: string }) {
  return (
    <span
      aria-hidden="true"
      className="bg-foreground inline-block size-5 shrink-0 opacity-70 lg:size-6"
      style={{
        maskImage: `url(/stack/${id}.svg)`,
        WebkitMaskImage: `url(/stack/${id}.svg)`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

export function StackIconRow() {
  const groups = homePage.offer.stackGroups.filter(
    (group) => group.tools.length > 0,
  );

  return (
    <div className="flex flex-col gap-4" aria-label={homePage.offer.stackAria}>
      {groups.map((group) => (
        <div key={group.id}>
          <p className="text-syn-comment mb-2 text-[10px] tracking-wide uppercase lg:text-xs">
            {group.label}
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-2">
            {group.tools.map((toolId) => {
              const item = STACK_BY_ID[toolId as StackId];
              if (!item) return null;
              return (
                <li
                  key={item.id}
                  className="font-jetbrains text-syn-property flex items-center gap-1.5 text-[10px] lg:text-xs"
                >
                  <StackIcon id={item.id} label={item.label} />
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
