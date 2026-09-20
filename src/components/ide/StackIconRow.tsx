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

function StackIcon({ id, label }: { id: string; label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="bg-foreground inline-block size-7 shrink-0 opacity-70 transition duration-[400ms] ease-out hover:scale-[1.06] hover:opacity-100 motion-reduce:hover:scale-100 lg:size-9"
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
  return (
    <div className="flex flex-wrap gap-2.5 lg:gap-3" aria-label="Tool stack">
      {STACK.map((item) => (
        <StackIcon key={item.id} id={item.id} label={item.label} />
      ))}
    </div>
  );
}
