import { ChevronLeft, Lock, Bell, RotateCcw, CalendarDays, Download } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { api, PERSONAS, type Me } from "@/lib/api";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? "bg-kbc-green" : "bg-[#C9D3DE]"}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-7" : "left-1"}`} />
    </button>
  );
}

const DEMO_DATES = [
  { date: "2026-09-10", label: "10 sep", hint: "midden van de maand" },
  { date: "2026-09-15", label: "15 sep", hint: "contract loopt af" },
  { date: "2026-09-30", label: "30 sep", hint: "eind van de maand" },
];

export function SettingsScreen({ me, persona, onPersona, onConsent, onReset, onBack, onDemoDate, notificationReason }: { me: Me | null; persona: string; onPersona: (t: string) => void; onConsent: (v: boolean) => void; onReset: () => void; onBack: () => void; onDemoDate: (d: string) => void; notificationReason: string }) {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Terug"><ChevronLeft size={22} /></button>
        <h1 className="text-[20px] font-extrabold text-kbc-navy">Instellingen</h1>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="rounded-card bg-white shadow-card">
          <div className="flex items-center gap-3 p-4">
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-kbc-text">Kate Zoom</span>
              <span className="block text-[12px] text-kbc-muted">Vaste kosten analyseren en besparingen tonen</span>
            </span>
            <Toggle on={me?.consent ?? false} onChange={onConsent} />
          </div>
          <div className="flex items-start gap-3 border-t border-kbc-bg p-4 text-[12px] text-kbc-muted">
            <Lock size={16} className="mt-0.5 shrink-0 text-kbc-navy" />
            <span>Je gegevens blijven bij KBC. Uitzetten wist je Kate Zoom-gegevens.</span>
          </div>
          <button onClick={() => void api.exportData()} className="flex w-full items-center gap-3 border-t border-kbc-bg p-4 text-left text-[13px] font-bold text-kbc-blue">
            <Download size={16} className="shrink-0" /> Download mijn gegevens
          </button>
          <div className="flex items-start gap-3 border-t border-kbc-bg p-4 text-[12px] text-kbc-muted">
            <Bell size={16} className="mt-0.5 shrink-0 text-kbc-navy" />
            <span className="min-w-0">
              <b className="text-kbc-text">Meldingen</b>
              <span className="block">Max. 1 per week · dringend: meteen · andere: vlak voor je loon{me?.payday ? ` (de ${me.payday}e)` : ""}</span>
              <span className="mt-1 block italic">Nu: {notificationReason || "…"}</span>
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-[15px] font-extrabold text-kbc-navy">Demo</h2>
        {me?.demo && (
          <div className="mt-2 rounded-card bg-white p-3 shadow-card">
            <div className="flex items-center gap-2 px-1 text-[13px] font-bold text-kbc-text"><CalendarDays size={16} className="shrink-0 text-kbc-blue" /> Demodatum: {me.asOf}</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {DEMO_DATES.map((d) => (
                <button key={d.date} onClick={() => onDemoDate(d.date)} className={`min-w-0 rounded-[12px] px-1 py-2 text-center ${me.asOf === d.date ? "bg-kbc-navy text-white" : "bg-kbc-bg text-kbc-text"}`}>
                  <span className="block text-[14px] font-extrabold">{d.label}</span>
                  <span className={`block text-[11px] leading-tight ${me.asOf === d.date ? "opacity-80" : "text-kbc-muted"}`}>{d.hint}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-3 rounded-card bg-white p-2 shadow-card">
          {PERSONAS.map((p) => (
            <button key={p.token} onClick={() => onPersona(p.token)} className={`flex w-full items-center justify-between rounded-[12px] px-3 py-3 text-left text-[14px] font-bold ${persona === p.token ? "bg-[#E6F4FB] text-kbc-navy" : "text-kbc-text"}`}>
              {p.label}
              {persona === p.token && <span className="text-[12px] text-kbc-blue">actief</span>}
            </button>
          ))}
          <button onClick={onReset} className="mt-1 flex w-full items-center gap-2 rounded-[12px] px-3 py-3 text-left text-[14px] font-bold text-kbc-muted"><RotateCcw size={16} /> Reset feedback & meldingen</button>
        </div>
        <div className="mt-3 text-center text-[11px] text-kbc-muted">Uitleg door: {me?.kate === "claude" ? "Claude (Kate-stem)" : "sjabloon (geen API-sleutel)"} · demo-datum {me?.asOf}</div>
      </div>
    </div>
  );
}
