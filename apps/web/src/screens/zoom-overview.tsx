import { ChevronLeft, ChevronRight, Check, Info, PiggyBank } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark, BottomNav } from "@/components/kbc";
import { CategoryIcon, MomentPill } from "@/components/insight-bits";
import { CATEGORY_LABEL, eur, periodLabel } from "@/lib/format";
import type { Insight, Savings, Spending } from "@/lib/api";

export function ZoomOverview({ firstName, insights, spending, savings, onBack, onOpen, onSettings, onInvest }: { firstName: string; insights: Insight[]; spending: Spending | null; savings: Savings | null; onBack: () => void; onOpen: (i: Insight) => void; onSettings: () => void; onInvest: () => void }) {
  const active = insights.filter((i) => i.status === "new");
  const parked = insights.filter((i) => i.status !== "new");
  const total = active.reduce((s, i) => s + i.savingsYear, 0);
  const handledCategories = new Set(insights.map((i) => i.category));
  const good = (spending?.recurring ?? []).filter((r) => !handledCategories.has(r.category));

  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Terug"><ChevronLeft size={22} /></button>
        <h1 className="flex flex-1 items-center gap-2 text-[20px] font-extrabold text-kbc-navy"><KateMark size={22} /> Kate Zoom</h1>
        <button onClick={onSettings} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-kbc-muted shadow-card" aria-label="Hoe werkt Kate Zoom?"><Info size={20} /></button>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-28 pt-4">
        <div className="rounded-card bg-gradient-to-br from-[#1F4B84] to-kbc-navy p-5 text-white shadow-card">
          <div className="text-[14px] font-bold opacity-80">{firstName}, je kan besparen</div>
          <div className="mt-1 text-[40px] font-extrabold leading-none">{eur(total)}</div>
          <div className="mt-2 text-[13px] opacity-80">{active.length} {active.length === 1 ? "tip" : "tips"} · zelfde kwaliteit</div>
        </div>

        {savings && savings.realized > 0 && (
          <button onClick={onInvest} className="mt-3 flex w-full items-center gap-3 rounded-card bg-white p-4 text-left shadow-card">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#E9F7EE] text-kbc-green"><PiggyBank size={24} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-bold uppercase tracking-wide text-kbc-muted">Al bespaard</span>
              <span className="block text-[20px] font-extrabold leading-tight text-kbc-green">{eur(savings.realized)} <span className="text-[12px] font-bold text-kbc-muted">+ {eur(savings.yearly)}/jaar</span></span>
            </span>
            <span className="shrink-0 rounded-full bg-kbc-blue px-3 py-1.5 text-[13px] font-extrabold text-white">{savings.plan ? savings.platforms[savings.plan.platform].label : "Beleggen"}</span>
          </button>
        )}

        {active.length > 0 && <h2 className="mt-6 text-[17px] font-extrabold text-kbc-navy">Tips</h2>}
        <div className="mt-2 flex flex-col gap-3">
          {active.map((i, idx) => (
            <button key={i.id} onClick={() => onOpen(i)} className="flex w-full items-center gap-3 rounded-card bg-white p-4 text-left shadow-card">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#E6F4FB] text-kbc-blue"><CategoryIcon category={i.category} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-bold uppercase tracking-wide text-kbc-muted">{CATEGORY_LABEL[i.category]}</span>
                <span className="line-clamp-2 block break-words text-[15px] font-extrabold leading-snug text-kbc-text">{i.title}</span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {i.moments.slice(0, 2).map((m) => <MomentPill key={m.type} type={m.type} strong={idx === 0} />)}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[17px] font-extrabold text-kbc-green">{eur(i.savingsYear)}</span>
                <span className="block text-[11px] text-kbc-muted">{periodLabel(i.period)}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-kbc-muted" />
            </button>
          ))}
        </div>

        {good.length > 0 && (
          <>
            <h2 className="mt-6 text-[17px] font-extrabold text-kbc-navy">Hier zit je goed</h2>
            <div className="mt-2 flex flex-col gap-2 rounded-card bg-white p-2 shadow-card">
              {good.map((r) => (
                <div key={r.merchantId} className="flex items-center gap-3 px-2 py-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#E9F7EE] text-kbc-green"><Check size={18} strokeWidth={2.5} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold text-kbc-text">{r.merchantName}</span>
                    <span className="block text-[12px] text-kbc-muted">{CATEGORY_LABEL[r.category]} · {eur(r.currentMonthly)}/maand</span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {parked.length > 0 && (
          <>
            <h2 className="mt-6 text-[17px] font-extrabold text-kbc-navy">Afgehandeld</h2>
            <div className="mt-2 flex flex-col gap-2">
              {parked.map((i) => (
                <button key={i.id} onClick={() => onOpen(i)} className="flex items-center gap-3 rounded-card bg-white/70 p-3 text-left text-kbc-muted">
                  <CategoryIcon category={i.category} size={18} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-[14px] font-bold leading-snug">{i.title}</span>
                    <span className="block text-[12px]">{i.status === "snoozed" ? "Later" : i.status === "accepted" ? "Aangevraagd" : "Niet interessant"}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {spending && (
          <>
            <h2 className="mt-6 text-[17px] font-extrabold text-kbc-navy">Uitgaven per maand</h2>
            <div className="mt-2 rounded-card bg-white p-4 shadow-card">
              {spending.categories.filter((c) => c.category !== "income").slice(0, 7).map((c) => {
                const max = spending.categories[0].monthlyAvg;
                return (
                  <div key={c.category} className="flex items-center gap-3 py-1.5">
                    <CategoryIcon category={c.category} size={18} className="text-kbc-navy" />
                    <span className="w-28 text-[13px] font-bold text-kbc-text">{CATEGORY_LABEL[c.category]}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-kbc-bg"><span className="block h-full rounded-full bg-kbc-sky" style={{ width: `${(c.monthlyAvg / max) * 100}%` }} /></span>
                    <span className="w-16 text-right text-[13px] font-bold text-kbc-text">{eur(c.monthlyAvg)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <BottomNav active="start" onStart={onBack} fab={false} />
    </div>
  );
}
