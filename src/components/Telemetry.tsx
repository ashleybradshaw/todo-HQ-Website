const ROWS = [
  { key: "AGENTS_ACTIVE", value: "04", numeric: true },
  { key: "INFRASTRUCTURE", value: "ONLINE", status: true },
  { key: "CURRENT_SPRINT", value: "READYGO" },
] as const;

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

export function Telemetry() {
  return (
    <section
      className="shrink-0 border-t border-[#0000FF]/15"
      aria-label="Factory telemetry"
    >
      <div className="flex items-center border-b border-[#0000FF]/15 px-3 py-2">
        <p className="font-jetbrains text-xs text-[#0A00E6]">SYS // TELEMETRY</p>
      </div>
      <dl className="font-jetbrains grid grid-cols-[1fr_auto] items-center text-xs leading-5">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="col-span-2 grid grid-cols-subgrid items-center border-b border-[#0000FF]/15 px-3 py-2 last:border-b-0"
          >
            <dt className="text-blue-900/50">{row.key}</dt>
            <dd
              className={
                "numeric" in row
                  ? "tabular-nums text-[#111111]"
                  : "flex items-center justify-end gap-1.5 text-[#111111]"
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
