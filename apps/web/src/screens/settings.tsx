import { ChevronLeft, ChevronRight, Lock, Bell, Download, Info } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { api, type Me } from "@/lib/api";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on} className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? "bg-kbc-green" : "bg-[#C9D3DE]"}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-7" : "left-1"}`} />
    </button>
  );
}

/** Customer-facing settings only. Demo controls live outside the phone (see DemoPanel). */
export function SettingsScreen({ me, onConsent, onBack, onAbout }: { me: Me | null; onConsent: (v: boolean) => void; onBack: () => void; onAbout: () => void }) {
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
              <span className="block text-[12px] text-kbc-muted">Besparingen op je vaste kosten</span>
            </span>
            <Toggle on={me?.consent ?? false} onChange={onConsent} />
          </div>
          <button onClick={onAbout} className="flex w-full items-center gap-3 border-t border-kbc-bg p-4 text-left text-[13px] font-bold text-kbc-text">
            <Info size={16} className="shrink-0 text-kbc-navy" />
            <span className="flex-1">Hoe werkt Kate Zoom?</span>
            <ChevronRight size={16} className="shrink-0 text-kbc-muted" />
          </button>
          <div className="flex items-start gap-3 border-t border-kbc-bg p-4 text-[12px] text-kbc-muted">
            <Bell size={16} className="mt-0.5 shrink-0 text-kbc-navy" />
            <span className="min-w-0">
              <b className="text-kbc-text">Meldingen</b>
              <span className="block">Max. 1 per week. Dringende tips meteen, andere vlak voor je loon.</span>
            </span>
          </div>
          <div className="flex items-start gap-3 border-t border-kbc-bg p-4 text-[12px] text-kbc-muted">
            <Lock size={16} className="mt-0.5 shrink-0 text-kbc-navy" />
            <span>Je gegevens blijven bij KBC. Uitzetten wist je Kate Zoom-gegevens.</span>
          </div>
          <button onClick={() => void api.exportData()} className="flex w-full items-center gap-3 border-t border-kbc-bg p-4 text-left text-[13px] font-bold text-kbc-blue">
            <Download size={16} className="shrink-0" /> Download mijn gegevens
          </button>
        </div>
      </div>
    </div>
  );
}
