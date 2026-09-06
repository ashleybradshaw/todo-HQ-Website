const ROWS = [
  { indent: 0, width: "58%" },
  { indent: 0, width: "78%" },
  { indent: 1, width: "94%" },
  { indent: 1, width: "70%" },
  { indent: 2, width: "72%" },
  { indent: 2, width: "64%" },
  { indent: 2, width: "60%" },
  { indent: 1, width: "16%" },
  { indent: 1, width: "62%" },
  { indent: 2, width: "42%" },
  { indent: 2, width: "40%" },
  { indent: 2, width: "44%" },
  { indent: 1, width: "16%" },
  { indent: 1, width: "68%" },
  { indent: 0, width: "14%" },
] as const;

export function Minimap() {
  return (
    <section
      className="flex min-h-0 flex-1 flex-col"
      aria-hidden="true"
    >
      <div className="flex shrink-0 items-center border-b border-[#0000FF]/15 px-3 py-2">
        <p className="font-jetbrains text-xs text-[#0A00E6]">MINIMAP // TODO_HQ.ts</p>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden px-3 py-3">
        <div className="pointer-events-none absolute inset-x-2 top-3 h-[42%] border border-[#0000FF]/20 bg-[#0000FF]/5" />
        <div className="relative space-y-[3px]">
          {ROWS.map((row, index) => (
            <div
              key={index}
              className="h-[3px] bg-[#0000FF]/20"
              style={{
                width: row.width,
                marginLeft: `${row.indent * 8}px`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
