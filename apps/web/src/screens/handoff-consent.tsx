import { useEffect, useState } from "react";
import { ChevronLeft, Lock, Check, ArrowRight, Timer, EyeOff } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";
import { api, type HandoffPreview, type Insight } from "@/lib/api";

export function HandoffConsent({ insight, onBack, onGo }: { insight: Insight; onBack: () => void; onGo: (token: string) => void }) {
  const [preview, setPreview] = useState<HandoffPreview | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.handoffPreview(insight.id).then((p) => {
      setPreview(p);
      setSelected(new Set(p.fields.map((f) => f.key)));
    }).catch(() => setError("Kate cannot prepare this right now."));
  }, [insight.id]);

  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  const go = async () => {
    setBusy(true);
    try {
      const { token } = await api.handoffCreate(insight.id, [...selected]);
      onGo(token);
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <div className="flex items-center gap-3 px-4 pb-2 pt-2">
        <button onClick={onBack} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-card" aria-label="Back"><ChevronLeft size={22} /></button>
        <span className="truncate text-[13px] font-bold uppercase tracking-wide text-kbc-muted">Share details</span>
      </div>

      <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto px-4 pb-8 pt-1">
        <div className="flex items-center gap-3">
          <KateMark size={40} className="shrink-0" />
          <div className="min-w-0">
            <h1 className="break-words text-[21px] font-extrabold leading-tight text-kbc-navy">Share with {preview?.provider ?? insight.alternative?.provider}</h1>
            {preview && <p className="text-[13px] font-bold text-kbc-muted">{preview.purpose}</p>}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-card bg-white shadow-card">
          {!preview && !error && <div className="p-4 text-[14px] text-kbc-muted">Preparing…</div>}
          {preview?.fields.map((f, idx) => {
            const on = selected.has(f.key);
            return (
              <button
                key={f.key}
                disabled={f.required}
                onClick={() => toggle(f.key)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${idx ? "border-t border-kbc-bg" : ""}`}
              >
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${on ? "border-kbc-blue bg-kbc-blue text-white" : "border-[#C9D3DE] bg-white"} ${f.required ? "opacity-60" : ""}`}>
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 text-[12px] font-bold text-kbc-muted">{f.label}{f.required && <Lock size={11} className="shrink-0" aria-label="required" />}</span>
                  <span className="block break-words text-[15px] font-bold text-kbc-text">{f.value}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 px-1 text-[12px] font-bold text-kbc-muted">
          <span className="flex items-center gap-1.5"><EyeOff size={14} className="shrink-0 text-kbc-navy" />No balance or spending</span>
          <span className="flex items-center gap-1.5"><Timer size={14} className="shrink-0 text-kbc-navy" />Link 1× · 10 min</span>
        </div>

        {error && <div className="mt-3 rounded-card bg-[#FDECEA] p-3 text-[13px] font-bold text-kbc-red">{error}</div>}

        <button disabled={!preview || busy} onClick={go} className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-kbc-blue px-5 py-3 text-[16px] font-extrabold text-white shadow-card disabled:opacity-60">
          <span className="min-w-0 truncate">Go to {preview?.provider ?? "provider"}</span> <ArrowRight size={18} className="shrink-0" />
        </button>
      </div>
    </div>
  );
}
