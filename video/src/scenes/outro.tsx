import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowRightLeft, Handshake, Home, PiggyBank, Receipt, Route, ShoppingCart, Shield, Sparkles, TrendingUp, Tv, Wifi, Zap } from "lucide-react";
import { Backdrop, Bug, C, Caption, KbcTile, KateMark, Pill, Sub, Wordmark, eur, fontFamily, useIn } from "../brand";
import { Phone, PhoneClip } from "../phone";
import { Shot } from "../media";
import facts from "../generated/facts.json";

const B = facts.beleggen;

/** Savings → Bolero, with the 20-year projection counting up. */
export function Invest() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const countStart = Math.round(fps * 3.2);
  const value = interpolate(frame, [countStart, countStart + fps * 2.4], [B.realized, B.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const counter = useIn(countStart - 6, 16);
  return (
    <Backdrop>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 150px 0 130px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 900 }}>
          <Caption size={104}>Saving becomes investing.</Caption>
          <Sub size={40} delay={12}>One tap into ETFs via <b style={{ color: C.navy }}>Bolero</b>, and your money stays within the KBC group.</Sub>
          <div style={{ marginTop: 26, background: C.white, borderRadius: 30, padding: "28px 36px", boxShadow: "0 30px 70px rgba(10,46,92,.16)", opacity: counter, transform: `translateY(${(1 - counter) * 30}px)`, fontFamily, alignSelf: "flex-start" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>
              {eur(B.realized)} + {eur(B.monthly)}/mo · {B.optionLabel.replace("Wereld-ETF", "World ETF")} · {B.years} years
            </div>
            <div style={{ fontSize: 110, fontWeight: 900, color: C.green, letterSpacing: -3, lineHeight: 1.05 }}>{eur(Math.round(value))}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.muted }}>Simulation, not advice. Investing involves risk; you may lose money.</div>
          </div>
        </div>
        <Phone height={930}>
          <PhoneClip clip="beleggen" from="invest" to="started" rate={1.1} />
        </Phone>
      </AbsoluteFill>
      <Bug />
    </Backdrop>
  );
}

/* ------------------------------------------------------------------ scale */

const LOOP = [
  { label: "Partners", sub: "energy · telecom · insurance · retail", icon: Handshake },
  { label: "Exclusive deals", sub: "KBC customer deals, never favoured", icon: Sparkles },
  { label: "Switching", sub: "pre-filled, with consent", icon: ArrowRightLeft },
  { label: "Savings", sub: "tracked by Kate", icon: PiggyBank },
  { label: "Investing via Bolero", sub: "new inflow into the KBC group", icon: TrendingUp },
];

const MODULES = [
  { label: "Energy", icon: Zap, live: true },
  { label: "Insurance", icon: Shield, live: true },
  { label: "Groceries", icon: ShoppingCart, live: true },
  { label: "Streaming", icon: Tv, live: true },
  { label: "Internet & mobile", icon: Wifi, live: true },
  { label: "Receipts", icon: Receipt, live: true },
  { label: "MyHome", icon: Home, live: false },
  { label: "Mobility", icon: Route, live: false },
  { label: "Partner APIs", icon: Handshake, live: false },
];

/** How KBC scales this: partner/deal/savings/Bolero flywheel, then more modules plugging in. */
export function Scale() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const cx = 560, cy = 500, r = 300;
  const stepF = Math.round(fps * 1.35);
  const loopStart = Math.round(fps * 0.6);
  const modulesStart = Math.round(durationInFrames * 0.58);
  const spin = interpolate(frame, [loopStart + stepF * 5, durationInFrames], [0, 40], { extrapolateLeft: "clamp" });
  const moveLeft = interpolate(frame, [modulesStart - 10, modulesStart + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nodes = LOOP.map((n, i) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    return { ...n, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), d: loopStart + i * stepF };
  });
  const perCustomer = B.yearly;
  const illustrative = 10000 * perCustomer;
  const counterIn = useIn(loopStart + stepF * 4 + 10);
  return (
    <Backdrop dark>
      {/* flywheel */}
      <AbsoluteFill style={{ transform: `translateX(${moveLeft * -40}px) scale(${1 - moveLeft * 0.12})`, transformOrigin: "30% 50%" }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={4} />
          {nodes.map((n, i) => {
            const next = nodes[(i + 1) % nodes.length];
            const p = interpolate(frame, [n.d + 10, n.d + stepF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const a0 = -90 + i * 72 + 12, a1 = -90 + (i + 1) * 72 - 12;
            const aEnd = a0 + (a1 - a0) * p;
            const rad = (deg: number) => (deg * Math.PI) / 180;
            const path = `M ${cx + r * Math.cos(rad(a0))} ${cy + r * Math.sin(rad(a0))} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(rad(aEnd))} ${cy + r * Math.sin(rad(aEnd))}`;
            return p > 0 ? <path key={i} d={path} fill="none" stroke={C.light} strokeWidth={7} strokeLinecap="round" /> : null;
          })}
        </svg>
        <div style={{ position: "absolute", left: cx - 120, top: cy - 120, width: 240, height: 240, display: "grid", placeItems: "center", transform: `rotate(${spin * 0}deg)` }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: useIn(0) }}>
            <KbcTile size={110} />
            <div style={{ fontFamily, fontWeight: 900, fontSize: 34, color: C.white }}>Kate Zoom</div>
          </div>
        </div>
        {nodes.map((n) => {
          const p = interpolate(frame - n.d, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const Icon = n.icon;
          return (
            <div key={n.label} style={{ position: "absolute", left: n.x, top: n.y, transform: `translate(-50%,-50%) scale(${0.6 + p * 0.4})`, opacity: p, fontFamily }}>
              <div style={{ width: 104, height: 104, borderRadius: "50%", background: C.white, color: C.blue, display: "grid", placeItems: "center", boxShadow: "0 12px 40px rgba(0,0,0,.3)" }}>
                <Icon size={50} strokeWidth={2.1} />
              </div>
              <div style={{ position: "absolute", top: 116, left: "50%", transform: "translateX(-50%)", width: 330, textAlign: "center", textShadow: "0 2px 12px rgba(10,46,92,.9)" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: C.white, lineHeight: 1.1 }}>{n.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,.72)" }}>{n.sub}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* right column: revenue + inflow, then modules */}
      <AbsoluteFill style={{ left: 1260, width: 580, justifyContent: "center", gap: 28, fontFamily }}>
        <Caption dark size={64} delay={loopStart}>More partners, more deals.</Caption>
        <Sub dark size={30} delay={loopStart + stepF}>Partners pay per switch. Deals are shown, never favoured.</Sub>
        <div style={{ opacity: counterIn, transform: `translateY(${(1 - counterIn) * 20}px)`, background: "rgba(255,255,255,.08)", borderRadius: 26, padding: "22px 28px", border: "1px solid rgba(255,255,255,.14)" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.light, letterSpacing: 1.5, textTransform: "uppercase" }}>New investment via Bolero</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: C.white }}>10,000 customers × {eur(perCustomer)}/yr</div>
          <div style={{ fontSize: 76, fontWeight: 900, color: C.white, letterSpacing: -2 }}>≈ {eur(illustrative / 1e6, 1)}M<span style={{ fontSize: 30 }}>/yr</span></div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,.6)" }}>Illustrative calculation based on the demo persona</div>
        </div>
      </AbsoluteFill>

      <Sequence from={modulesStart}>
        <AbsoluteFill style={{ background: C.navy, justifyContent: "center", alignItems: "center", gap: 44, fontFamily, opacity: useIn(0, 20) }}>
          <Caption dark size={72} style={{ textAlign: "center" }}>Every KBC service can plug in.</Caption>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 310px)", gap: 22, justifyContent: "center" }}>
            {MODULES.map((m, i) => {
              const Icon = m.icon;
              return <ModuleTile key={m.label} label={m.label} live={m.live} delay={8 + i * 5} icon={<Icon size={40} strokeWidth={2.1} />} />;
            })}
            <ModuleTile label="Kate Zoom" live hub delay={8 + MODULES.length * 5} icon={<KateMark size={48} />} />
          </div>
          <Sub dark size={32} delay={60} style={{ textAlign: "center" }}>More tips, no extra effort for the customer.</Sub>
          <div style={{ display: "flex", gap: 30, fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,.8)", opacity: useIn(70) }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 16, height: 16, borderRadius: 4, background: C.white }} /> live in the demo</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 16, height: 16, borderRadius: 4, border: "2px dashed rgba(255,255,255,.8)" }} /> next step</span>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Bug dark />
    </Backdrop>
  );
}

function ModuleTile({ label, icon, live, hub, delay }: { label: string; icon: React.ReactNode; live: boolean; hub?: boolean; delay: number }) {
  const p = useIn(delay, 14);
  return (
    <div style={{ height: 120, borderRadius: 24, display: "flex", alignItems: "center", gap: 18, padding: "0 26px", background: hub ? C.blue : live ? C.white : "transparent", border: live ? "none" : "3px dashed rgba(255,255,255,.55)", color: hub ? C.white : live ? C.navy : "rgba(255,255,255,.85)", fontSize: 27, fontWeight: 900, opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + p * 0.1})` }}>
      <span style={{ color: hub ? C.white : live ? C.blue : "inherit", display: "grid" }}>{icon}</span>
      <span style={{ lineHeight: 1.1 }}>{label}{!live && <span style={{ display: "block", fontSize: 18, fontWeight: 800, opacity: 0.8 }}>next step</span>}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ trust */

export function Trust() {
  const { fps } = useVideoConfig();
  const lines = [
    { t: "No good reason? Kate stays quiet.", d: 0 },
    { t: "Already on a good deal? She says so.", d: 2.2 },
    { t: "One tap: all off, data erased.", d: 4.6 },
  ];
  return (
    <Backdrop>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 150px 0 130px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, maxWidth: 1000 }}>
          {lines.map((l) => <Caption key={l.t} size={70} delay={Math.round(l.d * fps)}>{l.t}</Caption>)}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16, opacity: useIn(Math.round(fps * 5.5)) }}>
            <Pill size={24}>Opt-in</Pill>
            <Pill size={24}>Max. 1 notification a week</Pill>
            <Pill size={24}>Why am I seeing this?</Pill>
            <Pill size={24}>GDPR</Pill>
          </div>
        </div>
        <Phone height={930}>
          <PhoneClip clip="vertrouwen" from="overview" rate={1.1} />
        </Phone>
      </AbsoluteFill>
      <Bug />
    </Backdrop>
  );
}

/* ------------------------------------------------------------------ tech */

const PIPE = ["Transactions", "Categorise", "Recurring", "Right moment", "Compare", "Tip"];
const BADGES = ["Opt-in & erasure", "Per-field sharing", "Validation & CSP", "Rate limiting", "CodeQL in CI", "0 audit issues"];

export function Tech() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Backdrop dark>
      <AbsoluteFill style={{ padding: "110px 130px", gap: 56, fontFamily }}>
        <Caption dark size={72}>Explainable. Tested. Secure.</Caption>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {PIPE.map((p, i) => {
            const d = 8 + i * 6;
            const s = interpolate(frame - d, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 16, opacity: s }}>
                <div style={{ padding: "22px 26px", borderRadius: 20, background: i === PIPE.length - 1 ? C.blue : "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", color: C.white, fontSize: 30, fontWeight: 800 }}>{p}</div>
                {i < PIPE.length - 1 && <span style={{ color: C.light, fontSize: 36, fontWeight: 900 }}>→</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          <div style={{ flex: 1, background: "#0B1F3A", borderRadius: 24, padding: "26px 32px", fontFamily: "Menlo, monospace", fontSize: 28, color: "#C9D6E8", opacity: useIn(30), lineHeight: 1.5 }}>
            <div><span style={{ color: C.light }}>$</span> npm test</div>
            <div style={{ color: "#6EE7A8" }}>✔ quality parity: never cheaper but worse</div>
            <div style={{ color: "#6EE7A8" }}>✔ partner deals get no ranking boost</div>
            <div style={{ color: "#6EE7A8" }}>✔ consent withdrawal erases Kate data</div>
            <div style={{ marginTop: 6 }}>ℹ tests {facts.tests} · pass {facts.tests} · fail 0</div>
          </div>
          <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 16, alignContent: "flex-start" }}>
            {BADGES.map((b, i) => (
              <div key={b} style={{ opacity: useIn(Math.round(fps * 1.2) + i * 5) }}>
                <Pill bg="rgba(255,255,255,.12)" size={28}>🔒 {b}</Pill>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
      <Bug dark />
    </Backdrop>
  );
}

/* ------------------------------------------------------------------ close */

export function EndCard() {
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width;
  return (
    <Backdrop>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40, fontFamily, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, flexDirection: vertical ? "column" : "row", transform: `scale(${0.85 + useIn(0) * 0.15})`, opacity: useIn(0) }}>
          <KbcTile size={150} />
          <Wordmark size={120} />
        </div>
        <Caption size={vertical ? 76 : 84} delay={10} style={{ color: C.blue }}>Cheaper. Just as good or better.</Caption>
        <Sub size={44} delay={Math.round(fps * 1.2)} style={{ color: C.navy, fontWeight: 900 }}>No stress, Kate it.</Sub>
        <div style={{ opacity: useIn(Math.round(fps * 1.8)) }}>
          <Pill bg={C.navy} size={28}>In your KBC Mobile app</Pill>
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
}

export function Close() {
  const { fps } = useVideoConfig();
  const handover = Math.round(fps * 2.4);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={handover + 10}>
        <Shot id="close" from={0} />
      </Sequence>
      <Sequence from={handover}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
}
