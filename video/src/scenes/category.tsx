import React from "react";
import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Headphones, ShoppingCart, Shield, Tv, Zap } from "lucide-react";
import { Backdrop, Bug, C, Caption, Pill, SavingsBadge, Sub, TitleCard, eur, fontFamily, useIn } from "../brand";
import { CompareCard, type Side } from "../compare";
import { Phone, PhoneClip, mark, type Clip } from "../phone";
import { Shot, type ShotId } from "../media";
import facts from "../generated/facts.json";

interface Part {
  clip: Clip;
  from: string | number;
  to?: string | number;
  rate?: number;
  now: Side;
  tip: Side;
  badge: string;
  source?: string;
  savings: string;
  savingsLabel?: string;
  /** Extra note under the card (e.g. KBC-product labelling). */
  note?: ReactNode;
}

export interface CategoryConfig {
  label: string;
  icon: ReactNode;
  shot: ShotId;
  headline: string;
  parts: Part[];
}

const monthly = (n: number) => `${eur(n)}/mo`;
const F = facts;

export const CATEGORIES: Record<"energie" | "verzekering" | "boodschappen" | "streaming", CategoryConfig> = {
  energie: {
    label: "Energy",
    icon: <Zap size={84} strokeWidth={2.2} />,
    shot: "energie",
    headline: "Quietly getting more expensive.",
    parts: [
      {
        clip: "energie",
        from: "detail",
        // stop before the tap on "Overstappen": the handoff scene picks it up from there
        to: mark("energie", "chart") + 0.7,
        rate: 0.8,
        now: { name: F.energie.current.name, price: monthly(F.energie.current.monthly), quality: F.energie.current.quality },
        tip: { name: F.energie.alternative!.provider, price: monthly(F.energie.alternative!.monthly), quality: F.energie.alternative!.quality },
        badge: "Better quality",
        source: F.energie.alternative!.source,
        savings: eur(F.energie.savingsYear),
        note: <Pill bg="#E6F4FB" color={C.blue} size={22}>🎁 KBC customer deal: shown, never counted in the comparison</Pill>,
      },
    ],
  },
  verzekering: {
    label: "Insurance",
    icon: <Shield size={84} strokeWidth={2.2} />,
    shot: "verzekering",
    headline: "Your contract renews soon.",
    parts: [
      {
        clip: "verzekering",
        from: "detail",
        rate: 0.9,
        now: { name: "AG Insurance", price: monthly(F.verzekering.current.monthly), quality: F.verzekering.current.quality },
        tip: { name: F.verzekering.alternative!.provider, price: monthly(F.verzekering.alternative!.monthly), quality: F.verzekering.alternative!.quality },
        badge: "Better quality",
        source: F.verzekering.alternative!.source,
        savings: eur(F.verzekering.savingsYear),
        note: <Pill bg="#E6F4FB" color={C.blue} size={22}>KBC product? Clearly labelled, no priority</Pill>,
      },
    ],
  },
  boodschappen: {
    label: "Groceries",
    icon: <ShoppingCart size={84} strokeWidth={2.2} />,
    shot: "boodschappen",
    headline: "Same brands, different checkout.",
    parts: [
      {
        clip: "boodschappen",
        from: "detail",
        rate: 0.75,
        now: { name: F.boodschappen.current.name, price: monthly(F.boodschappen.current.monthly), quality: F.boodschappen.current.quality },
        tip: { name: F.boodschappen.alternative!.provider, price: monthly(F.boodschappen.alternative!.monthly), quality: F.boodschappen.alternative!.quality },
        badge: "Same quality",
        source: "Test Aankoop",
        savings: eur(F.boodschappen.savingsYear),
      },
      {
        clip: "sony",
        from: "detail",
        rate: 0.6,
        now: { name: `Sony XM5 · ${F.sony.current.name}`, price: eur(F.sony.current.monthly), quality: F.sony.current.quality },
        tip: { name: `Same · ${F.sony.alternative!.provider}`, price: eur(F.sony.alternative!.monthly), quality: F.sony.alternative!.quality },
        badge: "Same product",
        savings: eur(F.sony.savingsYear),
        savingsLabel: "still returnable",
        note: <Pill bg="#E6F4FB" color={C.blue} size={22}><Headphones size={22} /> Via your digital receipt</Pill>,
      },
    ],
  },
  streaming: {
    label: "Streaming",
    icon: <Tv size={84} strokeWidth={2.2} />,
    shot: "streaming",
    headline: "Three services. You watch one.",
    parts: [
      {
        clip: "streaming",
        from: "detail",
        rate: 0.85,
        now: { name: "3 streaming services", price: monthly(F.streaming.current.monthly), note: "Netflix · Streamz · Disney+" },
        tip: { name: F.streamingKeep.keep, price: monthly(F.streamingKeep.keepMonthly), note: "what you actually watch" },
        badge: "Nothing lost",
        savings: eur(F.streamingKeep.pausedYear),
      },
    ],
  },
};

/** Seconds of full-screen Veo footage before the app takes over. */
const SHOT_SECONDS = 3.4;
const TITLE_FRAMES = 38;

function PartView({ part, vertical, frames }: { part: Part; vertical: boolean; frames: number }) {
  const phone = useIn(0, 16);
  const noteIn = useIn(62);
  const cardW = vertical ? 940 : 760;
  const card = (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
      <CompareCard now={part.now} tip={part.tip} badge={part.badge} source={part.source} delay={6} width={cardW} />
      <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
        <SavingsBadge amount={part.savings} label={part.savingsLabel ?? "per year"} delay={46} />
        {part.note && <div style={{ opacity: noteIn, fontFamily }}>{part.note}</div>}
      </div>
    </div>
  );
  const phoneEl = (
    <div style={{ transform: `translateY(${(1 - phone) * 140}px)`, opacity: phone }}>
      <Phone height={vertical ? 860 : 930}>
        <PhoneClip clip={part.clip} from={part.from} to={part.to} rate={part.rate} />
      </Phone>
    </div>
  );
  return vertical ? (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 90, gap: 40 }}>
      {phoneEl}
      <div style={{ position: "absolute", bottom: 150, left: 70 }}>{card}</div>
    </AbsoluteFill>
  ) : (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 150px 0 130px" }}>
      {card}
      {phoneEl}
    </AbsoluteFill>
  );
}

/** Title card → Veo shot with headline → app + comparison card (price and quality). */
export function Category({ config }: { config: CategoryConfig }) {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const vertical = height > width;
  const shotEnd = Math.round(SHOT_SECONDS * fps);
  const wipe = interpolate(frame, [shotEnd - 8, shotEnd + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const appFrames = durationInFrames - shotEnd;
  // Parts share the app phase, weighted towards the first (the main tip).
  const weights = config.parts.length === 1 ? [1] : [0.62, 0.38];
  let at = shotEnd;
  const parts = config.parts.map((p, i) => {
    const len = Math.round(appFrames * weights[i]);
    const from = at;
    at += len;
    return { p, from, len };
  });
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop />
      {parts.map(({ p, from, len }, i) => (
        <Sequence key={i} from={from - 4} durationInFrames={len + 4}>
          <PartView part={p} vertical={vertical} frames={len} />
          <Bug />
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={shotEnd + 10}>
        <AbsoluteFill style={{ clipPath: `inset(0 ${wipe * 100}% 0 0)` }}>
          {vertical ? (
            // 720p footage would blur if cropped to 9:16: show it as a 16:9 band on KBC navy instead.
            <Backdrop dark>
              <div style={{ position: "absolute", left: 40, right: 40, top: 360, height: 1000 * (9 / 16) * 1.0, borderRadius: 36, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,.4)" }}>
                <Shot id={config.shot} from={0} />
              </div>
            </Backdrop>
          ) : (
            <Shot id={config.shot} from={0} />
          )}
          <AbsoluteFill style={{ justifyContent: "flex-end", padding: vertical ? "0 70px 380px" : "0 110px 110px", gap: 18 }}>
            <Pill bg={C.blue} size={30} style={{ alignSelf: "flex-start" }}>{config.label}</Pill>
            <Caption dark size={vertical ? 84 : 92} delay={TITLE_FRAMES - 4} style={{ textShadow: "0 6px 30px rgba(0,0,0,.35)", maxWidth: 1300 }}>
              {config.headline}
            </Caption>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>
      <TitleCard label={config.label} icon={config.icon} total={TITLE_FRAMES} />
    </AbsoluteFill>
  );
}

/** Energy switch in one flow: consent per field → prefilled provider page → sent. */
export function Handoff() {
  const { fps } = useVideoConfig();
  const steps = ["You choose what to share", "Everything is pre-filled", "No balances, no spending data"];
  return (
    <Backdrop>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0 150px 0 130px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <Caption size={112}>Zero forms.</Caption>
          <Sub size={38} delay={10}>Switch to Bolt Energie in one flow.</Sub>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 20 }}>
            {steps.map((s, i) => {
              const d = Math.round(fps * (1.2 + i * 1.3));
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 20, fontFamily, fontWeight: 800, fontSize: 40, color: C.navy, opacity: useIn(d), transform: `translateX(${(1 - useIn(d)) * -30}px)` }}>
                  <span style={{ width: 52, height: 52, borderRadius: "50%", background: C.green, color: C.white, display: "grid", placeItems: "center", fontSize: 30 }}>✓</span>
                  {s}
                </div>
              );
            })}
          </div>
        </div>
        <Phone height={930}>
          <PhoneClip clip="energie" from="consent" to={mark("energie", "sent") - 0.3} rate={0.95} />
        </Phone>
      </AbsoluteFill>
      <Bug />
    </Backdrop>
  );
}
