const PIPE_BARS = 8;

function StatusDot() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="4"
        cy="4"
        r="3"
        className="animate-pulse fill-emerald-600 motion-reduce:animate-none"
      />
    </svg>
  );
}

function Pipe({ tick }: { tick: number }) {
  return (
    <div
      className="flex h-3 items-end justify-end gap-px"
      aria-hidden="true"
    >
      {Array.from({ length: PIPE_BARS }, (_, index) => {
        const wave = (tick + index * 3) % 7;
        const height = 4 + wave * 1.5;

        return (
          <span
            key={index}
            className="w-px bg-foreground transition-[height] duration-300 ease-out motion-reduce:h-[7px] motion-reduce:transition-none"
            style={{ height }}
          />
        );
      })}
    </div>
  );
}

export function Telemetry({
  agents,
  sprint,
  tick,
}: {
  agents: number;
  sprint: string;
  tick: number;
}) {
  const rows = [
    {
      key: "AGENTS_ACTIVE",
      value: String(agents).padStart(2, "0"),
      numeric: true,
    },
    { key: "INFRASTRUCTURE", value: "ONLINE", status: true },
    { key: "CURRENT_SPRINT", value: sprint },
  ] as const;

  return (
    <section
      className="shrink-0 border-t border-border-ide"
      aria-label="Factory telemetry"
    >
      <div className="flex items-center justify-between border-b border-border-ide px-3 py-2">
        <p className="font-jetbrains text-foreground text-xs">SYS // TELEMETRY</p>
        <Pipe tick={tick} />
      </div>
      <dl className="font-jetbrains grid grid-cols-[1fr_auto] items-center text-xs leading-5">
        {rows.map((row) => (
          <div
            key={row.key}
            className="col-span-2 grid grid-cols-subgrid items-center border-b border-border-ide px-3 py-2 last:border-b-0"
          >
            <dt className="text-foreground/50">{row.key}</dt>
            <dd
              className={
                "numeric" in row
                  ? "text-foreground tabular-nums"
                  : "text-foreground flex items-center justify-end gap-1.5"
              }
            >
              {"status" in row ? <StatusDot /> : null}
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
