import { useCallback, useEffect, useState } from "react";
import { PhoneFrame } from "@/components/phone";
import { Push } from "@/components/push";
import { HomeScreen } from "@/screens/home";
import { ZoomOverview } from "@/screens/zoom-overview";
import { InsightDetail } from "@/screens/insight-detail";
import { SettingsScreen } from "@/screens/settings";
import { HandoffConsent } from "@/screens/handoff-consent";
import { ProviderPage } from "@/screens/provider-page";
import { InvestScreen } from "@/screens/invest";
import { api, ApiError, getPersona, setPersona, PERSONAS, type Insight, type Me, type Savings, type Spending } from "@/lib/api";

type Screen =
  | { name: "home" }
  | { name: "switch" }
  | { name: "insight"; id: string }
  | { name: "handoff"; id: string }
  | { name: "provider"; id: string; token: string }
  | { name: "invest" }
  | { name: "settings" };

export default function App() {
  const [persona, setPersonaState] = useState(getPersona());
  const [me, setMe] = useState<Me | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [spending, setSpending] = useState<Spending | null>(null);
  const [savings, setSavings] = useState<Savings | null>(null);
  const [push, setPush] = useState<Insight | null>(null);
  const [pushReason, setPushReason] = useState("");
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showPush: boolean) => {
    try {
      setError(null);
      const m = await api.me();
      setMe(m);
      if (!m.consent) {
        setInsights([]);
        setSpending(null);
        setSavings(null);
        setPush(null);
        setPushReason("Kate Zoom staat uit.");
        return;
      }
      const [{ insights: ins }, sp, n, sv] = await Promise.all([api.insights(), api.spending(), api.notification(), api.savings()]);
      setInsights(ins);
      setSpending(sp);
      setSavings(sv);
      setPushReason(n.reason);
      if (showPush && n.notification) {
        setTimeout(() => setPush(n.notification), 1200);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401 && getPersona() !== PERSONAS[0].token) {
        // Stale demo token in localStorage → fall back to the default persona.
        setPersona(PERSONAS[0].token);
        setPersonaState(PERSONAS[0].token);
        return;
      }
      setError(e instanceof ApiError ? `API ${e.status}: ${e.code}` : "API niet bereikbaar. Draait `npm run dev`?");
    }
  }, []);

  useEffect(() => {
    void load(true);
  }, [load, persona]);

  const changePersona = (token: string) => {
    setPersona(token);
    setPersonaState(token);
    setScreen({ name: "home" });
    setPush(null);
  };

  const openInsight = (i: Insight) => setScreen({ name: "insight", id: i.id });

  const openPush = async () => {
    if (!push) return;
    const id = push.id;
    setPush(null);
    await api.delivered(id).catch(() => undefined);
    setScreen({ name: "insight", id });
  };

  const feedback = async (id: string, action: "snooze" | "dismiss" | "accept") => {
    setBusy(true);
    try {
      await api.feedback(id, action);
      await load(false);
    } finally {
      setBusy(false);
    }
  };

  const consent = async (enabled: boolean) => {
    await api.consent(enabled);
    await load(false);
  };

  const reset = async () => {
    await api.reset();
    setScreen({ name: "home" });
    await load(true);
  };

  const top = insights.find((i) => i.status === "new") ?? null;
  const current = "id" in screen ? insights.find((i) => i.id === screen.id) ?? null : null;

  return (
    <PhoneFrame>
      {error && <div className="absolute inset-x-4 top-14 z-50 rounded-card bg-kbc-red px-4 py-3 text-[13px] font-bold text-white">{error}</div>}
      <Push insight={push} onOpen={openPush} onClose={() => setPush(null)} />
      {screen.name === "home" && (
        <HomeScreen name={me?.name ?? ""} top={top} hasPush={!!push} onOpenSwitch={() => setScreen({ name: "switch" })} onOpenInsight={openInsight} onSettings={() => setScreen({ name: "settings" })} />
      )}
      {screen.name === "switch" && (
        <ZoomOverview firstName={me?.firstName ?? ""} insights={insights} spending={spending} savings={savings} onBack={() => setScreen({ name: "home" })} onOpen={openInsight} onSettings={() => setScreen({ name: "settings" })} onInvest={() => setScreen({ name: "invest" })} />
      )}
      {screen.name === "insight" && current && (
        <InsightDetail insight={current} busy={busy} onBack={() => setScreen({ name: "switch" })} onFeedback={(a) => feedback(current.id, a)} onHandoff={() => setScreen({ name: "handoff", id: current.id })} />
      )}
      {screen.name === "handoff" && current && (
        <HandoffConsent insight={current} onBack={() => setScreen({ name: "insight", id: current.id })} onGo={(token) => setScreen({ name: "provider", id: current.id, token })} />
      )}
      {screen.name === "provider" && (
        <ProviderPage
          token={screen.token}
          onClose={() => setScreen({ name: "insight", id: screen.id })}
          onSubmitted={async () => {
            await feedback(screen.id, "accept");
            setScreen({ name: "insight", id: screen.id });
          }}
        />
      )}
      {(screen.name === "insight" || screen.name === "handoff") && !current && (
        <ZoomOverview firstName={me?.firstName ?? ""} insights={insights} spending={spending} savings={savings} onBack={() => setScreen({ name: "home" })} onOpen={openInsight} onSettings={() => setScreen({ name: "settings" })} onInvest={() => setScreen({ name: "invest" })} />
      )}
      {screen.name === "invest" && savings && (
        <InvestScreen savings={savings} onBack={() => setScreen({ name: "switch" })} onStarted={() => void load(false)} />
      )}
      {screen.name === "settings" && (
        <SettingsScreen me={me} persona={persona} onPersona={changePersona} onConsent={consent} onReset={reset} onBack={() => setScreen({ name: "home" })} notificationReason={pushReason} />
      )}
    </PhoneFrame>
  );
}
