import { PerspectiveGrid } from "@/components/PerspectiveGrid";

const APPS = ["Repdaily", "ReadyGo", "Contentic"] as const;

export default function WorkPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pt-28 pb-16">
      <PerspectiveGrid />
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="font-jetbrains text-sm text-[#DDDDFF]">Work</p>
        <h1 className="font-unbounded mt-4 text-4xl font-bold tracking-tight text-[#DDDDFF]">
          Proof in production.
        </h1>
        <ul className="mt-10 border-t border-[rgba(10,0,230,0.15)]">
          {APPS.map((app) => (
            <li
              key={app}
              className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-[rgba(10,0,230,0.15)] py-6"
            >
              <h2 className="font-unbounded text-2xl font-bold">{app}</h2>
              <span className="font-jetbrains text-sm">in production</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
