import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, PiggyBank, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";
import { GrowthChart } from "@/components/growth-chart";
import { api, type Platform, type ProjectionPoint, type Savings } from "@/lib/api";
import { eur, formatDate } from "@/lib/format";

const HORIZONS = [5, 10, 20];

export function InvestScreen({ savings, onBack, onStarted }: { savings: Savings; onBack: () => void; onStarted: () => void }) {
  const monthlyMax = Math.ceil(savings.yearly / 12);
  const [lump, setLump] = useState(Math.floor(savings.plan?.lump ?? savings.realized));
  const [auto, setAuto] = useState(savings.plan ? savings.plan.monthly > 0 : true);
  const [platform, setPlatform] = useState<Platform>(savings.plan?.platform ?? "kbc");
  const [option, setOption] = useState<string>(savings.plan?.option ?? "gebalanceerd");
  const options = savings.platforms[platform].options;
  const choosePlatform = (p: Platform) => {
    setPlatform(p);
    // Keep the same risk level when switching: 2nd option = balanced on both platforms.
    const idx = Object.keys(options).indexOf(option);
    setOption(Object.keys(savings.platforms[p].options)[idx >= 0 ? idx : 1]);
  };
  const [years, setYears] = useState(savings.plan?.years ?? 10);
  const [points, setPoints] = useState<ProjectionPoint[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const monthly = auto ? monthlyMax : 0;
  const params = useMemo(() => ({ platform, option, lump, monthly, years }), [platform, option, lump, monthly, years]);

  useEffect(() => {
    const t = setTimeout(() => api.projection(params).then((r) => setPoints(r.points)).catch(() => undefined), 120);
    return () => clearTimeout(t);
  }, [params]);

  const last = points[points.length - 1];
  const start = async () => {
    setBusy(true);
    try {
      await api.invest(params);
      setDone(true);
      onStarted();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-2 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Terug"><ChevronLeft size={22} /></button>
        <span className="truncate text-[13px] font-bold uppercase tracking-wide text-kbc-muted">Beleg je besparing</span>
      </div>

      <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-1">
        <div className="rounded-card bg-gradient-to-br from-[#1F4B84] to-kbc-navy p-5 text-white shadow-card">
          <div className="flex items-center gap-2 text-[13px] font-bold opacity-80"><KateMark size={18} className="bg-white/20" /> Al bespaard</div>
          <div className="mt-1 text-[36px] font-extrabold leading-none">{eur(savings.realized)}</div>
          <div className="mt-1 text-[13px] opacity-80">+ {eur(savings.yearly)} per jaar</div>
          <div className="mt-3 space-y-1 border-t border-white/15 pt-3 text-[12px]">
            {savings.entries.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate opacity-80">{e.label}</span>
                <span className="shrink-0 font-bold">{eur(e.amount)} {e.period === "year" ? "/jaar" : ""}</span>
              </div>
            ))}
          </div>
        </div>


        <div className="mt-3 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] font-bold text-kbc-text">Nu beleggen</span>
            <span className="shrink-0 text-[16px] font-extrabold text-kbc-navy">{eur(lump)}</span>
          </div>
          <input type="range" min={0} max={Math.floor(savings.realized)} step={1} value={lump} onChange={(e) => setLump(Number(e.target.value))} className="mt-2 w-full accent-[#0079C1]" aria-label="Eenmalig bedrag" />
          <div className="flex justify-between text-[11px] text-kbc-muted"><span>€ 0</span><span>{eur(savings.realized)}</span></div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-kbc-bg pt-4">
            <span className="min-w-0">
              <span className="block text-[14px] font-bold text-kbc-text">Elke maand</span>
              <span className="block text-[12px] text-kbc-muted">{eur(monthlyMax)}/maand automatisch</span>
            </span>
            <button onClick={() => setAuto(!auto)} role="switch" aria-checked={auto} className={`relative h-8 w-14 shrink-0 rounded-full transition ${auto ? "bg-kbc-green" : "bg-[#C9D3DE]"}`}>
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${auto ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>

        <h2 className="mt-5 text-[15px] font-extrabold text-kbc-navy">Waar beleg je?</h2>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-[16px] bg-white p-1 shadow-card">
          {(Object.keys(savings.platforms) as Platform[]).map((k) => (
            <button key={k} onClick={() => choosePlatform(k)} className={`min-w-0 rounded-[12px] px-2 py-2.5 text-center ${platform === k ? "bg-kbc-navy text-white" : "text-kbc-text"}`}>
              <span className="block text-[15px] font-extrabold">{savings.platforms[k].label}</span>
              <span className={`block text-[11px] leading-tight ${platform === k ? "opacity-80" : "text-kbc-muted"}`}>{k === "kbc" ? "Beheerd voor jou" : "Zelf beleggen"}</span>
            </button>
          ))}
        </div>

        <h2 className="mt-4 text-[15px] font-extrabold text-kbc-navy">{platform === "kbc" ? "Beleggingsprofiel" : "Kies een ETF"}</h2>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {Object.keys(options).map((k) => {
            const p = options[k];
            const on = option === k;
            return (
              <button key={k} onClick={() => setOption(k)} className={`min-w-0 rounded-[14px] px-2 py-3 text-center shadow-card ${on ? "bg-kbc-navy text-white" : "bg-white text-kbc-text"}`}>
                <span className="block truncate text-[13px] font-extrabold">{p.label}</span>
                <span className={`block text-[11px] ${on ? "opacity-80" : "text-kbc-muted"}`}>± {(p.expectedReturn * 100).toFixed(0)}%/jaar</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-card bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[14px] font-bold text-kbc-text">Groei</span>
            <div className="flex gap-1 rounded-full bg-kbc-bg p-1">
              {HORIZONS.map((h) => (
                <button key={h} onClick={() => setYears(h)} className={`rounded-full px-3 py-1 text-[12px] font-bold ${years === h ? "bg-white text-kbc-navy shadow" : "text-kbc-muted"}`}>{h} jaar</button>
              ))}
            </div>
          </div>
          <div className="mt-3"><GrowthChart points={points} /></div>
          {last && (
            <div className="mt-3 rounded-[12px] bg-[#E9F7EE] p-3">
              <div className="text-[12px] font-bold text-kbc-muted">Na {years} jaar</div>
              <div className="text-[26px] font-extrabold leading-tight text-kbc-green">{eur(last.value)}</div>
              <div className="text-[12px] text-kbc-text">waarvan {eur(last.value - last.invested)} rendement</div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-card bg-white p-3 text-[11px] leading-snug text-kbc-muted shadow-card">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[#C27C00]" />
          <span>Simulatie, geen advies. Beleggen houdt risico's in; je kan je inleg verliezen.</span>
        </div>

        {done || savings.plan ? (
          <div className="mt-5 flex items-start gap-3 rounded-card bg-white p-4 shadow-card">
            <CheckCircle2 size={24} className="shrink-0 text-kbc-green" />
            <div className="min-w-0 text-[14px] text-kbc-text">
              <div className="font-extrabold">Beleggingsplan actief</div>
              <div className="text-kbc-muted">
                {savings.plan ? `${savings.platforms[savings.plan.platform].label} · ${savings.platforms[savings.plan.platform].options[savings.plan.option]?.label}` : `${savings.platforms[platform].label} · ${options[option]?.label}`} · {eur(savings.plan?.lump ?? lump)} eenmalig{(savings.plan?.monthly ?? monthly) > 0 ? ` + ${eur(savings.plan?.monthly ?? monthly)}/maand` : ""}
                {savings.plan && ` · sinds ${formatDate(savings.plan.startedAt)}`}
              </div>
              {!done && <button onClick={start} disabled={busy} className="mt-2 text-[13px] font-bold text-kbc-blue">Plan bijwerken</button>}
            </div>
          </div>
        ) : (
          <button disabled={busy || (lump === 0 && monthly === 0)} onClick={start} className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-kbc-blue px-5 py-3 text-[16px] font-extrabold text-white shadow-card disabled:opacity-60">
            <PiggyBank size={20} className="shrink-0" /> <span className="min-w-0 truncate">Start beleggingsplan via {savings.platforms[platform].label}</span> <ArrowRight size={18} className="shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
