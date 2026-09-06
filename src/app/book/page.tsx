import { PerspectiveGrid } from "@/components/PerspectiveGrid";

export default function BookPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 pt-28 pb-16">
      <PerspectiveGrid />
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="font-space text-sm text-[#DDDDFF]">Book Team</p>
        <h1 className="font-unbounded mt-4 text-4xl font-bold tracking-tight text-[#DDDDFF]">
          Bring the factory to the problem.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#DDDDFF]">
          //TODO Engineering works with technical founders and product leads who
          need AI workflow architecture or a full-stack application in
          production. Tell us what has to ship.
        </p>
      </div>
    </main>
  );
}
