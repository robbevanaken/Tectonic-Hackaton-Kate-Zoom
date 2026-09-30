import { RotateCcw, CalendarDays, Users, Bell, Sparkles } from "lucide-react";
import { PERSONAS, type Me } from "@/lib/api";

const DEMO_DATES = [
  { date: "2026-09-10", label: "10 sep", hint: "midden van de maand" },
  { date: "2026-09-15", label: "15 sep", hint: "contract loopt af" },
  { date: "2026-09-30", label: "30 sep", hint: "eind van de maand" },
];

/**
 * Presenter controls, deliberately outside the phone: the app itself only
 * shows what a customer would see. Visible next to the phone on wide screens,
 * or below it on narrow screens when the URL contains ?demo.
 */
export function DemoPanel({ me, persona, reason, onPersona, onDemoDate, onReset }: { me: Me | null; persona: string; reason: string; onPersona: (t: string) => void; onDemoDate: (d: string) => void; onReset: () => void }) {
  if (me && !me.demo) return null;
  const forced = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");
  return (
    <aside className={`${forced ? "block" : "hidden lg:block"} mx-4 mb-8 w-auto rounded-[20px] border border-dashed border-[#9AA8B8] bg-white/70 p-4 font-sans text-[#1F2A44] lg:mx-0 lg:mb-0 lg:w-[300px]`} aria-label="Demo-bediening">
      <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7A90]">Demo-bediening · niet in de app</div>

      <div className="mt-4 flex items-center gap-2 text-[13px] font-bold"><Users size={15} className="shrink-0" /> Klant</div>
      <div className="mt-2 flex flex-col gap-1.5">
        {PERSONAS.map((p) => (
          <button key={p.token} onClick={() => onPersona(p.token)} className={`rounded-[10px] px-3 py-2 text-left text-[13px] font-bold ${persona === p.token ? "bg-[#1F2A44] text-white" : "bg-[#EEF2F6]"}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[13px] font-bold"><CalendarDays size={15} className="shrink-0" /> Datum</div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {DEMO_DATES.map((d) => (
          <button key={d.date} onClick={() => onDemoDate(d.date)} className={`min-w-0 rounded-[10px] px-1 py-2 text-center ${me?.asOf === d.date ? "bg-[#1F2A44] text-white" : "bg-[#EEF2F6]"}`}>
            <span className="block text-[13px] font-extrabold">{d.label}</span>
            <span className={`block text-[10px] leading-tight ${me?.asOf === d.date ? "opacity-80" : "text-[#6B7A90]"}`}>{d.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[10px] bg-[#EEF2F6] p-3 text-[12px] leading-snug">
        <Bell size={14} className="mt-0.5 shrink-0" />
        <span><b>Meldingsbeslissing:</b> {reason || "…"}</span>
      </div>

      <button onClick={onReset} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#C9D3DE] px-3 py-2 text-[13px] font-bold">
        <RotateCcw size={14} className="shrink-0" /> Reset demo
      </button>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#6B7A90]">
        <Sparkles size={12} className="shrink-0" /> Tekst: {me?.kate === "claude" ? "Claude" : "sjabloon"} · datum {me?.asOf}
      </div>
    </aside>
  );
}
