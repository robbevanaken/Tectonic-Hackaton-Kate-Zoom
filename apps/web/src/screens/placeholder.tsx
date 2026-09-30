import { ChevronLeft, Construction, ArrowRight } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";

/** Stand-in for KBC app pages that are not part of the Kate Zoom demo. */
export function PlaceholderScreen({ title, onBack, onZoom }: { title: string; onBack: () => void; onZoom: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-2 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Terug"><ChevronLeft size={22} /></button>
        <h1 className="min-w-0 truncate text-[20px] font-extrabold text-kbc-navy">{title}</h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-24 text-center">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white text-kbc-muted shadow-card"><Construction size={28} /></span>
        <p className="mt-4 text-[16px] font-extrabold text-kbc-text">Deze pagina bestaat voor demo-doeleinden.</p>
        <p className="mt-1 text-[14px] text-kbc-muted">Ga gerust terug naar de Kate Zoom-flow.</p>
        <button onClick={onZoom} className="mt-6 flex h-12 items-center gap-2 rounded-full bg-kbc-blue px-6 text-[15px] font-extrabold text-white shadow-card">
          <KateMark size={18} className="bg-white/20" /> Naar Kate Zoom <ArrowRight size={16} />
        </button>
        <button onClick={onBack} className="mt-3 text-[14px] font-bold text-kbc-blue">Terug</button>
      </div>
    </div>
  );
}
