import type { ProjectionPoint } from "@/lib/api";
import { eur } from "@/lib/format";

/** Two stacked areas: what you put in, and what it grew to. Scales to its container width. */
export function GrowthChart({ points }: { points: ProjectionPoint[] }) {
  if (points.length < 2) return <div className="h-[150px]" />;
  const W = 320;
  const H = 140;
  const max = Math.max(...points.map((p) => p.value)) * 1.08;
  const x = (i: number) => (i / (points.length - 1)) * W;
  const y = (v: number) => H - (v / max) * H;
  const area = (key: "value" | "invested") => `M0,${H} ${points.map((p, i) => `L${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ")} L${W},${H} Z`;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[150px] w-full overflow-visible" role="img" aria-label={`Groeit naar ${eur(last.value)} na ${last.year} jaar`}>
        <path d={area("value")} fill="#BFE3F6" />
        <path d={area("invested")} fill="#0A2E5C" opacity="0.85" />
        <path d={line} fill="none" stroke="#0079C1" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-kbc-muted">
        <span>nu</span>
        <span>{Math.round(last.year / 2)} jaar</span>
        <span>{last.year} jaar</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-kbc-text">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-kbc-navy" />Ingelegd</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#BFE3F6]" />Verwacht rendement</span>
      </div>
    </div>
  );
}
