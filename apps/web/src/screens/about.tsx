import { ChevronLeft, Search, BellRing, ArrowLeftRight, PiggyBank, ShieldCheck } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";

const STEPS = [
  { icon: Search, title: "Kate vergelijkt", text: "Je vaste kosten met de markt: energie, internet, gsm, verzekering, boodschappen…" },
  { icon: BellRing, title: "Op het juiste moment", text: "Een tip als het ertoe doet, niet elke dag." },
  { icon: ArrowLeftRight, title: "Overstappen in één tik", text: "Kate vult je gegevens in. Jij kiest wat je deelt." },
  { icon: PiggyBank, title: "Laat het groeien", text: "Beleg wat je bespaart, via KBC of Bolero." },
];

/** What Kate Zoom is, in one screen. Shown from the info button and when Kate Zoom is off. */
export function AboutScreen({ on, onBack, onEnable, onTips }: { on: boolean; onBack: () => void; onEnable: () => void; onTips: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-2 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Terug"><ChevronLeft size={22} /></button>
      </div>
      <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="flex flex-col items-center text-center">
          <KateMark size={64} />
          <h1 className="mt-3 text-[26px] font-extrabold text-kbc-navy">Kate Zoom</h1>
          <p className="mt-1 text-[15px] leading-snug text-kbc-text">Betaal minder voor hetzelfde.</p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 rounded-card bg-white p-4 shadow-card">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E6F4FB] text-kbc-blue"><Icon size={22} /></span>
              <span className="min-w-0">
                <span className="block text-[15px] font-extrabold text-kbc-text">{title}</span>
                <span className="block text-[13px] leading-snug text-kbc-muted">{text}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[12px] font-bold text-kbc-muted">
          <ShieldCheck size={14} className="shrink-0 text-kbc-navy" /> Nooit goedkoper maar slechter · altijd uit te zetten
        </div>
        <button onClick={on ? onTips : onEnable} className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-kbc-blue text-[16px] font-extrabold text-white shadow-card">
          {on ? "Naar mijn tips" : "Zet Kate Zoom aan"}
        </button>
      </div>
    </div>
  );
}
