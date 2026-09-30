import { ChevronLeft, Search, BellRing, ArrowLeftRight, PiggyBank, ShieldCheck } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";

const STEPS = [
  { icon: Search, title: "Kate compares", text: "Your fixed costs with the market: energy, internet, mobile, insurance, groceries…" },
  { icon: BellRing, title: "At the right moment", text: "A tip when it matters, not every day." },
  { icon: ArrowLeftRight, title: "Switch in one tap", text: "Kate fills in your details. You choose what to share." },
  { icon: PiggyBank, title: "Let it grow", text: "Invest what you save, via KBC or Bolero." },
];

/** What Kate Zoom is, in one screen. Shown from the info button and when Kate Zoom is off. */
export function AboutScreen({ on, onBack, onEnable, onTips }: { on: boolean; onBack: () => void; onEnable: () => void; onTips: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-2 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Back"><ChevronLeft size={22} /></button>
      </div>
      <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto px-5 pb-8">
        <div className="flex flex-col items-center text-center">
          <KateMark size={64} />
          <h1 className="mt-3 text-[26px] font-extrabold text-kbc-navy">Kate Zoom</h1>
          <p className="mt-1 text-[15px] leading-snug text-kbc-text">Pay less for the same.</p>
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
          <ShieldCheck size={14} className="shrink-0 text-kbc-navy" /> Never cheaper but worse · can always be turned off
        </div>
        <button onClick={on ? onTips : onEnable} className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-kbc-blue text-[16px] font-extrabold text-white shadow-card">
          {on ? "Go to my tips" : "Turn on Kate Zoom"}
        </button>
      </div>
    </div>
  );
}
