import { MirageSpinner } from "@/components/ide/MirageSpinner";

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
        className="animate-pulse fill-syn-string motion-reduce:animate-none"
      />
    </svg>
  );
}

export function Telemetry({
  agents,
  sprint,
}: {
  agents: number;
  sprint: string;
}) {
  const rows = [
    {
      key: "AGENTS_ACTIVE",
      value: String(agents).padStart(2, "0"),
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
        <p className="font-jetbrains text-foreground text-xs">
          SYS // TELEMETRY
        </p>
        <MirageSpinner />
      </div>
      <dl className="font-jetbrains text-xs leading-5">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-3 border-b border-border-ide px-3 py-2 last:border-b-0"
          >
            <dt className="text-foreground/50 shrink-0">{row.key}</dt>
            <dd
              className={
                "status" in row
                  ? "text-foreground flex shrink-0 items-center justify-end gap-1.5"
                  : "text-foreground shrink-0 text-right tabular-nums"
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
