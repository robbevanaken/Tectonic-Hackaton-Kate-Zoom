import { useState } from "react";
import { ChevronLeft, ArrowDown, ArrowRight, Clock, ThumbsDown, ShieldCheck, ChevronDown, Gift } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";
import { CategoryIcon, MomentPill, Quality, MiniBars } from "@/components/insight-bits";
import { CATEGORY_LABEL, eur, periodLabel } from "@/lib/format";
import type { Insight } from "@/lib/api";

function PriceRow({ label, name, price, unit, quality, accent }: { label: string; name: string; price: number; unit: string; quality: number; accent?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className={`text-[12px] font-bold ${accent ? "text-kbc-green" : "text-kbc-muted"}`}>{label}</div>
        <div className="break-words text-[15px] font-extrabold leading-tight text-kbc-text">{name}</div>
        <div className="mt-0.5"><Quality value={quality} /></div>
      </div>
      <div className={`shrink-0 text-right text-[22px] font-extrabold leading-none ${accent ? "text-kbc-green" : "text-kbc-text"}`}>
        {eur(price)}
        {unit && <span className="block text-[11px] font-bold text-kbc-muted">{unit}</span>}
      </div>
    </div>
  );
}

export function InsightDetail({ insight, onBack, onFeedback, onHandoff, busy }: { insight: Insight; onBack: () => void; onFeedback: (a: "snooze" | "dismiss" | "accept") => void; onHandoff: () => void; busy: boolean }) {
  const [why, setWhy] = useState(false);
  const a = insight.alternative;
  const done = insight.status !== "new";
  const unit = insight.period === "once" ? "" : "/maand";
  const cta =
    insight.kind === "overlap" ? "Beheer abonnementen" : insight.kind === "purchase" ? `Bekijk bij ${a?.provider}` : insight.category === "groceries" || insight.category === "fuel" ? `Probeer ${a?.provider}` : `Overstappen naar ${a?.provider}`;

  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-2 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Terug"><ChevronLeft size={22} /></button>
        <span className="truncate text-[13px] font-bold uppercase tracking-wide text-kbc-muted">{CATEGORY_LABEL[insight.category]}</span>
      </div>

      <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-1">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#E6F4FB] text-kbc-blue"><CategoryIcon category={insight.category} size={24} /></span>
          <h1 className="min-w-0 break-words pt-1 text-[21px] font-extrabold leading-tight text-kbc-navy">{insight.title}</h1>
        </div>

        <div className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex flex-wrap gap-1.5">
            {insight.moments.map((m) => <MomentPill key={m.type} type={m.type} strong />)}
            {insight.moments.length === 0 && <MomentPill type="better_deal" />}
          </div>
          <div className="mt-3 flex items-start gap-2">
            <KateMark size={22} className="mt-0.5 shrink-0" />
            <p className="min-w-0 text-[15px] leading-snug text-kbc-text">{insight.explanation}</p>
          </div>
        </div>

        {a && (
          <div className="mt-3 overflow-hidden rounded-card bg-white shadow-card">
            <div className="flex flex-col gap-2 p-4">
              <PriceRow label={insight.kind === "purchase" ? "Betaald" : "Nu"} name={insight.current.name} price={insight.current.monthly} unit={unit} quality={insight.current.quality} />
              <div className="flex items-center gap-2 text-kbc-muted"><span className="h-px flex-1 bg-kbc-bg" /><ArrowDown size={16} /><span className="h-px flex-1 bg-kbc-bg" /></div>
              <PriceRow label={insight.kind === "purchase" ? "Zelfde product" : "Alternatief"} name={a.provider} price={a.monthly} unit={unit} quality={a.quality} accent />
            </div>
            <div className="border-t border-kbc-bg px-4 py-3 text-[13px] leading-snug text-kbc-text">
              <div>{a.note}</div>
              <div className="mt-1 text-[12px] text-kbc-muted">Bron: {a.source}</div>
              {a.partnerDeal && <div className="mt-2 rounded-[10px] bg-[#E6F4FB] px-3 py-2 font-bold text-kbc-navy"><span className="flex items-start gap-1.5"><Gift size={15} className="mt-0.5 shrink-0" />{a.partnerDeal.replace("KBC-klantendeal: ", "")}</span><span className="block text-[11px] font-normal text-kbc-muted">KBC-partnerdeal · niet meegeteld in de vergelijking</span></div>}
              {a.partner && <div className="mt-2 flex items-start gap-1.5 font-bold text-kbc-navy"><ShieldCheck size={15} className="mt-0.5 shrink-0" /><span>KBC-product</span></div>}
            </div>
            <div className="flex items-center justify-between gap-3 bg-[#E9F7EE] px-4 py-3">
              <span className="text-[14px] font-bold text-kbc-text">Besparing</span>
              <span className="text-right text-[18px] font-extrabold text-kbc-green">{eur(insight.savingsYear)} <span className="text-[12px]">{periodLabel(insight.period)}</span></span>
            </div>
          </div>
        )}

        {insight.byMonth.length > 0 && (
          <div className="mt-3 rounded-card bg-white p-4 shadow-card">
            <div className="flex items-center justify-between gap-2 text-[13px] font-bold text-kbc-muted">
              <span>Wat je maandelijks betaalde</span>
              {a && <span className="shrink-0 text-kbc-green">- - {a.provider.split(" ")[0]}</span>}
            </div>
            <div className="mt-3"><MiniBars data={insight.byMonth} alt={a?.monthly} /></div>
            <div className="mt-1 flex justify-between text-[11px] text-kbc-muted"><span>{insight.byMonth[0].month}</span><span>{insight.byMonth[insight.byMonth.length - 1].month}</span></div>
          </div>
        )}

        <button onClick={() => setWhy(!why)} className="mt-3 flex w-full items-center justify-between gap-2 rounded-card bg-white px-4 py-3 text-[14px] font-bold text-kbc-navy shadow-card">
          <span className="flex items-center gap-2"><ShieldCheck size={18} className="shrink-0 text-kbc-blue" /> Waarom zie ik dit?</span>
          <ChevronDown size={18} className={`shrink-0 transition ${why ? "rotate-180" : ""}`} />
        </button>
        {why && (
          <div className="mt-2 rounded-card bg-white p-4 text-[13px] leading-relaxed text-kbc-text shadow-card">
            <ul className="list-disc space-y-1 pl-4">
              <li>{insight.dataPoints} {insight.dataPoints === 1 ? "betaling" : "betalingen"} aan {insight.current.name}{insight.kind === "purchase" ? " + kasticket" : ""}</li>
              <li>Zekerheid {Math.round(insight.confidence * 100)}%</li>
              {insight.moments.map((m) => <li key={m.type}>{m.reason}</li>)}
              <li>Nooit goedkoper maar slechter</li>
              <li className="text-kbc-muted">{insight.explanationSource === "claude" ? "Tekst door AI (Claude)" : "Automatische tekst"}</li>
            </ul>
          </div>
        )}

        {done ? (
          <div className="mt-5 rounded-card bg-white p-4 text-center text-[14px] font-bold text-kbc-muted shadow-card">
            {insight.status === "accepted" ? "✓ Aangevraagd" : insight.status === "snoozed" ? "Herinnering over 30 dagen" : "Verborgen"}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            <button disabled={busy} onClick={insight.kind === "overlap" ? () => onFeedback("accept") : onHandoff} className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-kbc-blue px-5 py-3 text-center text-[16px] font-extrabold leading-tight text-white shadow-card disabled:opacity-60">
              <span className="min-w-0">{cta}</span> <ArrowRight size={18} className="shrink-0" />
            </button>
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => onFeedback("snooze")} className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 text-[14px] font-bold text-kbc-navy shadow-card disabled:opacity-60"><Clock size={16} className="shrink-0" /> Later</button>
              <button disabled={busy} onClick={() => onFeedback("dismiss")} className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 text-[14px] font-bold text-kbc-navy shadow-card disabled:opacity-60"><ThumbsDown size={16} className="shrink-0" /> <span className="truncate">Niet interessant</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
