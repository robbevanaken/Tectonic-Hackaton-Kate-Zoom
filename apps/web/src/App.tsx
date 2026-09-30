import { useCallback, useEffect, useMemo, useState } from "react";
import { PhoneFrame } from "@/components/phone";
import { KateMark } from "@/components/kbc";
import { Push } from "@/components/push";
import { HomeScreen } from "@/screens/home";
import { ZoomOverview } from "@/screens/zoom-overview";
import { InsightDetail } from "@/screens/insight-detail";
import { SettingsScreen } from "@/screens/settings";
import { HandoffConsent } from "@/screens/handoff-consent";
import { ProviderPage } from "@/screens/provider-page";
import { InvestScreen } from "@/screens/invest";
import { PlaceholderScreen } from "@/screens/placeholder";
import { AboutScreen } from "@/screens/about";
import { DemoPanel } from "@/components/demo-panel";
import { NavContext, type Nav } from "@/lib/nav";
import { api, ApiError, getPersona, setPersona, PERSONAS, type Insight, type Me, type Savings, type Spending } from "@/lib/api";

type Screen =
  | { name: "home" }
  | { name: "switch" }
  | { name: "insight"; id: string }
  | { name: "handoff"; id: string }
  | { name: "provider"; id: string; token: string }
  | { name: "invest" }
  | { name: "about" }
  | { name: "placeholder"; title: string; from: Screen }
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
      // Customer-facing wording, never raw status codes.
      setError(e instanceof ApiError && e.status === 429 ? "Even rustig aan. Probeer het zo opnieuw." : "Kate is even niet bereikbaar. Probeer het zo opnieuw.");
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

  const closePush = useCallback(() => setPush(null), []);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const nav: Nav = useMemo(
    () => ({
      home: () => setScreen({ name: "home" }),
      zoom: () => setScreen({ name: "switch" }),
      invest: () => setScreen({ name: "invest" }),
      settings: () => setScreen({ name: "settings" }),
      demo: (title: string) => setScreen((from) => ({ name: "placeholder", title, from })),
    }),
    [],
  );

  const openInsight = (i: Insight) => setScreen({ name: "insight", id: i.id });

  const openPush = async () => {
    if (!push) return;
    const id = push.id;
    setPush(null);
    await api.delivered(id).catch(() => undefined);
    setScreen({ name: "insight", id });
  };

  const feedback = async (id: string, action: "snooze" | "dismiss" | "accept", paused?: string[]) => {
    setBusy(true);
    try {
      await api.feedback(id, action, paused);
      await load(false);
    } finally {
      setBusy(false);
    }
  };

  const consent = async (enabled: boolean) => {
    await api.consent(enabled);
    await load(false);
  };

  const demoDate = async (date: string) => {
    await api.demoDate(date);
    setPush(null);
    setScreen({ name: "home" });
    await load(true);
  };

  const reset = async () => {
    await api.reset();
    setScreen({ name: "home" });
    await load(true);
  };

  const top = insights.find((i) => i.status === "new") ?? null;
  // With Kate Zoom off, every entry point explains what it is instead of showing an empty list.
  const openZoom = () => setScreen(me && !me.consent ? { name: "about" } : { name: "switch" });
  const current = "id" in screen ? insights.find((i) => i.id === screen.id) ?? null : null;

  return (
    <NavContext.Provider value={nav}>
    <div className="flex min-h-full flex-col items-center justify-center lg:flex-row lg:gap-10">
    <PhoneFrame>
      {error && (
        <div role="status" className="absolute inset-x-4 top-14 z-50 flex items-center gap-2 rounded-card bg-kbc-navy px-4 py-3 text-[13px] font-bold text-white shadow-card">
          <KateMark size={18} className="shrink-0" /> {error}
        </div>
      )}
      <Push
        insight={push}
        lead={pushReason.startsWith("Eind van je maand.") && me?.daysToPayday ? (me.daysToPayday === 1 ? "Morgen komt je loon." : `Nog ${me.daysToPayday} dagen tot je loon.`) : undefined}
        onOpen={openPush}
        onClose={closePush}
      />
      {screen.name === "home" && (
        <HomeScreen name={me?.name ?? ""} off={me ? !me.consent : false} top={top} hasPush={!!push} onOpenSwitch={openZoom} onOpenInsight={openInsight} onSettings={() => setScreen({ name: "settings" })} />
      )}
      {screen.name === "switch" && (
        <ZoomOverview firstName={me?.firstName ?? ""} insights={insights} spending={spending} savings={savings} onBack={() => setScreen({ name: "home" })} onOpen={openInsight} onSettings={() => setScreen({ name: "about" })} onInvest={() => setScreen({ name: "invest" })} />
      )}
      {screen.name === "insight" && current && (
        <InsightDetail insight={current} busy={busy} onBack={() => setScreen({ name: "switch" })} onFeedback={(a, paused) => feedback(current.id, a, paused)} onHandoff={() => setScreen({ name: "handoff", id: current.id })} />
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
        <ZoomOverview firstName={me?.firstName ?? ""} insights={insights} spending={spending} savings={savings} onBack={() => setScreen({ name: "home" })} onOpen={openInsight} onSettings={() => setScreen({ name: "about" })} onInvest={() => setScreen({ name: "invest" })} />
      )}
      {screen.name === "invest" && savings && (
        <InvestScreen savings={savings} onBack={() => setScreen({ name: "switch" })} onStarted={() => void load(false)} />
      )}
      {screen.name === "settings" && (
        <SettingsScreen me={me} onConsent={consent} onBack={() => setScreen({ name: "home" })} onAbout={() => setScreen({ name: "about" })} />
      )}
      {screen.name === "about" && (
        <AboutScreen
          on={me?.consent ?? false}
          onBack={() => setScreen({ name: "home" })}
          onTips={() => setScreen({ name: "switch" })}
          onEnable={async () => {
            await consent(true);
            setScreen({ name: "switch" });
          }}
        />
      )}
      {screen.name === "placeholder" && <PlaceholderScreen title={screen.title} onBack={() => setScreen(screen.from)} onZoom={() => setScreen({ name: "switch" })} />}
      {screen.name === "invest" && !savings && <PlaceholderScreen title="Beleggen" onBack={() => setScreen({ name: "home" })} onZoom={() => setScreen({ name: "switch" })} />}
    </PhoneFrame>
    <DemoPanel me={me} persona={persona} reason={pushReason} onPersona={changePersona} onDemoDate={demoDate} onReset={reset} />
    </div>
    </NavContext.Provider>
  );
}
