import { useEffect, useRef, useState } from "react";
import { X, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { StatusBar } from "@/components/phone";
import { KateMark } from "@/components/kbc";
import { api, type HandoffRedeemed } from "@/lib/api";

/**
 * Simulated provider page, opened in the in-app browser. It redeems the
 * one-time token and shows the provider's own form with Kate's prefill.
 * Clearly marked as a demo; no real provider branding.
 */
export function ProviderPage({ token, onClose, onSubmitted }: { token: string; onClose: () => void; onSubmitted: () => void }) {
  const [data, setData] = useState<HandoffRedeemed | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, setState] = useState<"loading" | "form" | "sent" | "expired">("loading");
  const redeemed = useRef(false);

  useEffect(() => {
    // StrictMode mounts twice in dev; the token is single-use, so redeem exactly once.
    if (redeemed.current) return;
    redeemed.current = true;
    api.handoffRedeem(token).then((d) => {
      setData(d);
      setValues(Object.fromEntries(d.fields.map((f) => [f.key, f.value])));
      setState("form");
    }).catch(() => setState("expired"));
  }, [token]);

  const slug = (data?.provider ?? "aanbieder").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="flex h-full flex-col bg-white">
      <StatusBar />
      <div className="flex items-center gap-2 border-b border-[#E6ECF2] px-3 pb-2 pt-1">
        <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-kbc-text" aria-label="Sluiten"><X size={20} /></button>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-kbc-bg px-3 py-1.5 text-[12px] text-kbc-muted">
          <Lock size={12} className="shrink-0" />
          <span className="truncate">{slug}.partner.demo/overstappen</span>
        </div>
      </div>
      <div className="bg-[#FFF6E0] px-4 py-1.5 text-center text-[11px] font-bold text-[#8A6100]">Gesimuleerde aanbiederpagina (demo)</div>

      <div className="no-scrollbar min-w-0 flex-1 overflow-y-auto px-5 pb-8 pt-5">
        {state === "loading" && <div className="text-[14px] text-kbc-muted">Laden…</div>}

        {state === "expired" && (
          <div className="mt-10 flex flex-col items-center text-center">
            <AlertTriangle size={40} className="text-[#C27C00]" />
            <h1 className="mt-3 text-[20px] font-extrabold text-kbc-text">Deze link is niet meer geldig</h1>
            <p className="mt-1 text-[14px] text-kbc-muted">Links van Kate Zoom werken één keer en maximaal 10 minuten. Start opnieuw vanuit je KBC-app.</p>
            <button onClick={onClose} className="mt-6 h-12 rounded-full bg-kbc-navy px-6 text-[15px] font-bold text-white">Terug naar KBC</button>
          </div>
        )}

        {state === "sent" && (
          <div className="mt-10 flex flex-col items-center text-center">
            <CheckCircle2 size={48} className="text-kbc-green" />
            <h1 className="mt-3 text-[20px] font-extrabold text-kbc-text">Aanvraag ontvangen</h1>
            <p className="mt-1 text-[14px] text-kbc-muted">{data?.provider} neemt contact met je op om te bevestigen. Je huidige contract stoppen ze voor jou.</p>
            <button onClick={onSubmitted} className="mt-6 h-12 rounded-full bg-kbc-navy px-6 text-[15px] font-bold text-white">Terug naar KBC</button>
          </div>
        )}

        {state === "form" && data && (
          <>
            <div className="text-[13px] font-extrabold uppercase tracking-wide text-kbc-muted">{data.provider}</div>
            <h1 className="mt-1 text-[22px] font-extrabold leading-tight text-kbc-text">{data.purpose}</h1>
            <div className="mt-3 flex items-start gap-2 rounded-[12px] bg-[#E6F4FB] p-3 text-[12px] leading-snug text-kbc-navy">
              <KateMark size={18} className="mt-0.5 shrink-0" />
              <span className="min-w-0">{data.fields.length} velden zijn ingevuld via <b>Kate Zoom</b>. Controleer ze en pas aan waar nodig.</span>
            </div>
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setState("sent");
              }}
            >
              {data.fields.map((f) => (
                <label key={f.key} className="block min-w-0">
                  <span className="flex items-center justify-between gap-2 text-[12px] font-bold text-kbc-muted">
                    <span className="truncate">{f.label}</span>
                    <span className="shrink-0 rounded-full bg-[#E9F7EE] px-2 py-0.5 text-[10px] font-extrabold text-kbc-green">via Kate</span>
                  </span>
                  <input
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    className="mt-1 h-11 w-full min-w-0 rounded-[10px] border border-[#D5DEE8] bg-white px-3 text-[15px] text-kbc-text outline-none focus:border-kbc-blue"
                  />
                </label>
              ))}
              <label className="mt-1 flex items-start gap-2 text-[12px] leading-snug text-kbc-muted">
                <input type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Ik ga akkoord met de voorwaarden van {data.provider}.</span>
              </label>
              <button type="submit" className="mt-2 h-12 w-full rounded-[12px] bg-kbc-text text-[15px] font-extrabold text-white">Aanvraag versturen</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
