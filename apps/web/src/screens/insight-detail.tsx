import { useState } from "react";
import { ChevronLeft, ArrowRight, ExternalLink, Clock, ThumbsDown, ShieldCheck, ChevronDown } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";
import { CategoryIcon, MomentPill, Quality, MiniBars } from "@/components/insight-bits";
import { CATEGORY_LABEL, eur } from "@/lib/format";
import type { Insight } from "@/lib/api";

export function InsightDetail({ insight, onBack, onFeedback, busy }: { insight: Insight; onBack: () => void; onFeedback: (a: "snooze" | "dismiss" | "accept") => void; busy: boolean }) {
  const [why, setWhy] = useState(false);
  const a = insight.alternative;
  const done = insight.status !== "new";

  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-card" aria-label="Terug"><ChevronLeft size={22} /></button>
        <span className="text-[13px] font-bold uppercase tracking-wide text-kbc-muted">{CATEGORY_LABEL[insight.category]}</span>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8 pt-3">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#E6F4FB] text-kbc-blue"><CategoryIcon category={insight.category} size={28} /></span>
          <h1 className="text-[22px] font-extrabold leading-tight text-kbc-navy">{insight.title}</h1>
        </div>

        <div className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex flex-wrap gap-1.5">
            {insight.moments.map((m) => <MomentPill key={m.type} type={m.type} strong />)}
            {insight.moments.length === 0 && <MomentPill type="better_deal" />}
          </div>
          <div className="mt-3 flex items-start gap-2">
            <KateMark size={22} className="mt-0.5 shrink-0" />
            <p className="text-[15px] leading-snug text-kbc-text">{insight.explanation}</p>
          </div>
        </div>

        {a && (
          <div className="mt-3 overflow-hidden rounded-card bg-white shadow-card">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-4">
              <div>
                <div className="text-[12px] font-bold text-kbc-muted">Nu</div>
                <div className="truncate text-[15px] font-extrabold text-kbc-text">{insight.current.name}</div>
                <div className="text-[20px] font-extrabold text-kbc-text">{eur(insight.current.monthly)}<span className="text-[12px] font-bold text-kbc-muted">/maand</span></div>
                <Quality value={insight.current.quality} />
              </div>
              <ArrowRight className="text-kbc-muted" />
              <div className="text-right">
                <div className="text-[12px] font-bold text-kbc-green">Alternatief</div>
                <div className="truncate text-[15px] font-extrabold text-kbc-text">{a.provider}</div>
                <div className="text-[20px] font-extrabold text-kbc-green">{eur(a.monthly)}<span className="text-[12px] font-bold text-kbc-muted">/maand</span></div>
                <Quality value={a.quality} />
              </div>
            </div>
            <div className="border-t border-kbc-bg px-4 py-3 text-[13px] text-kbc-text">
              <div>{a.note}</div>
              <div className="mt-1 text-kbc-muted">Kwaliteitsscore: {a.source}</div>
              {a.partner && <div className="mt-1 flex items-center gap-1 font-bold text-kbc-navy"><ShieldCheck size={14} /> KBC-product — getoond omdat het op prijs én kwaliteit wint</div>}
            </div>
            <div className="flex items-center justify-between bg-[#E9F7EE] px-4 py-3">
              <span className="text-[14px] font-bold text-kbc-text">Besparing</span>
              <span className="text-[18px] font-extrabold text-kbc-green">{eur(insight.savingsYear)} <span className="text-[12px]">per jaar</span></span>
            </div>
          </div>
        )}

        {insight.byMonth.length > 0 && (
          <div className="mt-3 rounded-card bg-white p-4 shadow-card">
            <div className="flex items-center justify-between text-[13px] font-bold text-kbc-muted">
              <span>Wat je maandelijks betaalde</span>
              {a && <span className="text-kbc-green">- - alternatief</span>}
            </div>
            <div className="mt-3"><MiniBars data={insight.byMonth} alt={a?.monthly} /></div>
            <div className="mt-1 flex justify-between text-[11px] text-kbc-muted"><span>{insight.byMonth[0].month}</span><span>{insight.byMonth[insight.byMonth.length - 1].month}</span></div>
          </div>
        )}

        <button onClick={() => setWhy(!why)} className="mt-3 flex w-full items-center justify-between rounded-card bg-white px-4 py-3 text-[14px] font-bold text-kbc-navy shadow-card">
          <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-kbc-blue" /> Waarom zie ik dit?</span>
          <ChevronDown size={18} className={`transition ${why ? "rotate-180" : ""}`} />
        </button>
        {why && (
          <div className="mt-2 rounded-card bg-white p-4 text-[13px] leading-relaxed text-kbc-text shadow-card">
            <ul className="list-disc space-y-1 pl-4">
              <li>Gebaseerd op <b>{insight.dataPoints} betalingen</b> aan {insight.current.name} op je KBC-rekening. Niets verlaat KBC.</li>
              <li>Zekerheid: <b>{Math.round(insight.confidence * 100)}%</b> — {insight.confidence >= 0.85 ? "vaste maandprijs, makkelijk te vergelijken." : "een schatting: je gebruik of dekking kan verschillen."}</li>
              {insight.moments.map((m) => <li key={m.type}>{m.reason}</li>)}
              <li>Alternatieven met een lagere kwaliteitsscore (meer dan 0,3 verschil) toon ik nooit, ook al zijn ze goedkoper.</li>
              <li>Max. 1 melding per week. Je kan Kate Switch altijd uitzetten in Instellingen.</li>
              <li className="text-kbc-muted">Tekst door {insight.explanationSource === "claude" ? "Kate (Claude), enkel op basis van bovenstaande feiten" : "Kate (sjabloon)"}.</li>
            </ul>
          </div>
        )}

        {done ? (
          <div className="mt-5 rounded-card bg-white p-4 text-center text-[14px] font-bold text-kbc-muted shadow-card">
            {insight.status === "accepted" ? "Overstap gestart — Kate volgt de nieuwe prijs op." : insight.status === "snoozed" ? "Ik herinner je er over 30 dagen aan." : "Oké, ik laat dit rusten."}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            <button disabled={busy} onClick={() => onFeedback("accept")} className="flex h-14 items-center justify-center gap-2 rounded-full bg-kbc-blue text-[16px] font-extrabold text-white shadow-card disabled:opacity-60">
              {insight.kind === "overlap" ? "Beheer abonnementen" : `Bekijk overstap naar ${a?.provider ?? "alternatief"}`} <ExternalLink size={16} />
            </button>
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => onFeedback("snooze")} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[14px] font-bold text-kbc-navy shadow-card disabled:opacity-60"><Clock size={16} /> Later</button>
              <button disabled={busy} onClick={() => onFeedback("dismiss")} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white text-[14px] font-bold text-kbc-navy shadow-card disabled:opacity-60"><ThumbsDown size={16} /> Niet interessant</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
