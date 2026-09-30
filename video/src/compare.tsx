import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, fontFamily, score, useIn } from "./brand";

export interface Side {
  name: string;
  price: string;
  /** Quality score out of 5; omit for comparisons without a score (streaming). */
  quality?: number;
  note?: string;
}

function Stars({ value, delay }: { value: number; delay: number }) {
  const frame = useCurrentFrame();
  const shown = interpolate(frame - delay, [0, 18], [0, value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span style={{ position: "relative", fontSize: 30, letterSpacing: 2, color: "#D9E2EC" }}>
        ★★★★★
        <span style={{ position: "absolute", inset: 0, width: `${(shown / 5) * 100}%`, overflow: "hidden", color: C.gold, whiteSpace: "nowrap" }}>★★★★★</span>
      </span>
      <span style={{ fontSize: 28, fontWeight: 900, color: C.text }}>{score(value)}</span>
    </span>
  );
}

function Row({ label, side, highlight, delay }: { label: string; side: Side; highlight?: boolean; delay: number }) {
  const p = useIn(delay);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "22px 28px", borderRadius: 22, background: highlight ? C.greenBg : "#F6F9FC", opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: highlight ? C.green : C.muted }}>{label}</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: C.navy, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{side.name}</div>
        {side.quality !== undefined ? <Stars value={side.quality} delay={delay + 8} /> : side.note ? <div style={{ fontSize: 24, fontWeight: 700, color: C.muted }}>{side.note}</div> : null}
      </div>
      <div style={{ fontSize: 44, fontWeight: 900, color: highlight ? C.green : C.text, whiteSpace: "nowrap" }}>{side.price}</div>
    </div>
  );
}

/**
 * The recurring "Cheaper, same or better quality" card: now vs Kate's tip, price and quality, plus a verdict badge.
 */
export function CompareCard({ now, tip, badge, source, delay = 0, width = 720 }: { now: Side; tip: Side; badge: string; source?: string; delay?: number; width?: number }) {
  const card = useIn(delay, 16);
  const badgeP = useIn(delay + 34, 10);
  return (
    <div style={{ width, fontFamily, background: C.white, borderRadius: 32, padding: 28, boxShadow: "0 30px 70px rgba(10,46,92,.16)", opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Row label="Now" side={now} delay={delay + 6} />
        <Row label="Kate's tip" side={tip} highlight delay={delay + 16} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, gap: 16 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, background: C.navy, color: C.white, borderRadius: 999, padding: "14px 26px", fontSize: 30, fontWeight: 900, transform: `scale(${0.6 + badgeP * 0.4})`, opacity: badgeP, transformOrigin: "left center" }}>
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: C.green, display: "grid", placeItems: "center", fontSize: 22 }}>✓</span>
          {badge}
        </span>
        {source && <span style={{ fontSize: 20, fontWeight: 700, color: C.muted, opacity: badgeP }}>Source: {source}</span>}
      </div>
    </div>
  );
}
