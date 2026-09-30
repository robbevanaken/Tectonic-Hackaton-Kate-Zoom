import { ChevronLeft, Lock, Bell, RotateCcw } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";
import { PERSONAS, type Me } from "@/lib/api";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className={`relative h-8 w-14 rounded-full transition ${on ? "bg-kbc-green" : "bg-[#C9D3DE]"}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-7" : "left-1"}`} />
    </button>
  );
}

export function SettingsScreen({ me, persona, onPersona, onConsent, onReset, onBack, notificationReason }: { me: Me | null; persona: string; onPersona: (t: string) => void; onConsent: (v: boolean) => void; onReset: () => void; onBack: () => void; notificationReason: string }) {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-card" aria-label="Terug"><ChevronLeft size={22} /></button>
        <h1 className="text-[20px] font-extrabold text-kbc-navy">Instellingen</h1>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-kbc-navy"><KateMark size={20} /> Kate Zoom</h2>
        <div className="mt-2 rounded-card bg-white shadow-card">
          <div className="flex items-center gap-3 p-4">
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-kbc-text">Kate mag mijn uitgaven analyseren</span>
              <span className="block text-[12px] text-kbc-muted">Om betere aanbiedingen van dezelfde kwaliteit te vinden. Enkel vaste kosten en boodschappen.</span>
            </span>
            <Toggle on={me?.consent ?? false} onChange={onConsent} />
          </div>
          <div className="flex items-start gap-3 border-t border-kbc-bg p-4 text-[12px] text-kbc-muted">
            <Lock size={16} className="mt-0.5 shrink-0 text-kbc-navy" />
            <span>Je transacties blijven bij KBC. Naar buiten gaat enkel een samenvatting (aanbieder + maandbedrag), nooit je naam of rekeningnummer. Je kan dit altijd uitzetten; Kate vergeet dan alles.</span>
          </div>
          <div className="flex items-start gap-3 border-t border-kbc-bg p-4 text-[12px] text-kbc-muted">
            <Bell size={16} className="mt-0.5 shrink-0 text-kbc-navy" />
            <span><b className="text-kbc-text">Meldingsbeleid:</b> max. 1 per week, enkel bij ≥ € 50 per jaar én enkel op een moment dat het je iets zegt (net afgeschreven, contract loopt af, prijs stijgt, seizoen). Zonder zo'n moment wacht de tip gewoon in Kate Zoom.<br /><span className="italic">Nu: {notificationReason || "…"}</span></span>
          </div>
        </div>

        <h2 className="mt-6 text-[15px] font-extrabold text-kbc-navy">Demo</h2>
        <div className="mt-2 rounded-card bg-white p-2 shadow-card">
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
