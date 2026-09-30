import React from "react";
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";

export const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800", "900"], subsets: ["latin"] });

/** Same palette as apps/web/tailwind.config.js. */
export const C = {
  navy: "#0A2E5C",
  blue: "#0079C1",
  sky: "#29ABE2",
  light: "#5BC5F2",
  bg: "#F3F7FB",
  text: "#1F2A44",
  muted: "#6B7A90",
  green: "#2E9E5B",
  greenBg: "#E9F7EE",
  gold: "#F5B301",
  white: "#FFFFFF",
};

export const eur = (n: number, digits = 0) =>
  "€" + n.toLocaleString("en-IE", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const score = (n: number) => n.toLocaleString("en-IE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Eased 0→1 progress that starts at `delay` frames. */
export function useIn(delay = 0, damping = 18) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.8 } });
}

/** 1→0 at the end of a sequence of `total` frames. */
export function useOut(total: number, length = 10) {
  const frame = useCurrentFrame();
  return interpolate(frame, [total - length, total], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

/** The blue "KBC" tile the app uses for its push notifications. */
export function KbcTile({ size = 120, style }: { size?: number; style?: CSSProperties }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: C.blue,
        color: C.white,
        display: "grid",
        placeItems: "center",
        fontFamily,
        fontWeight: 900,
        fontSize: size * 0.34,
        letterSpacing: size * 0.005,
        boxShadow: "0 18px 50px rgba(0,121,193,.35)",
        ...style,
      }}
    >
      KBC
    </div>
  );
}

/** Kate's sound-wave mark (apps/web/src/components/kbc.tsx). */
export function KateMark({ size = 40, bg = C.blue, color = C.white }: { size?: number; bg?: string; color?: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "inline-grid", placeItems: "center", flexShrink: 0 }}>
      <svg viewBox="0 0 20 20" width={size * 0.6} height={size * 0.6} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M4 10h2M8 6v8M12 3v14M16 7v6" />
      </svg>
    </span>
  );
}

export function Wordmark({ size = 80, color = C.navy }: { size?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28, fontFamily, fontWeight: 900, fontSize: size, color, letterSpacing: -size * 0.02 }}>
      <KateMark size={size * 1.05} />
      Kate Zoom
    </div>
  );
}

/** Soft KBC backdrop: light blue-grey with two diagonal brand shapes (like the account cards). */
export function Backdrop({ dark = false, children }: { dark?: boolean; children?: ReactNode }) {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 20;
  return (
    <AbsoluteFill style={{ background: dark ? `linear-gradient(135deg, #1F4B84 0%, ${C.navy} 70%)` : `linear-gradient(160deg, #FFFFFF 0%, ${C.bg} 55%, #E3EEF8 100%)`, overflow: "hidden", fontFamily }}>
      <div style={{ position: "absolute", right: -260 + drift, top: -300, width: 900, height: 900, transform: "rotate(18deg)", background: dark ? "rgba(255,255,255,.05)" : "rgba(0,121,193,.06)", borderRadius: 80 }} />
      <div style={{ position: "absolute", left: -300 - drift, bottom: -420, width: 1000, height: 700, transform: "rotate(-14deg)", background: dark ? "rgba(41,171,226,.10)" : "rgba(41,171,226,.08)", borderRadius: 80 }} />
      {children}
    </AbsoluteFill>
  );
}

export function Pill({ children, bg = C.navy, color = C.white, size = 26, style }: { children: ReactNode; bg?: string; color?: string; size?: number; style?: CSSProperties }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.4, background: bg, color, borderRadius: 999, padding: `${size * 0.38}px ${size * 0.8}px`, fontFamily, fontWeight: 800, fontSize: size, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}

/** Category title card: slides in as a KBC-blue band, then hands over to the scene. */
export function TitleCard({ label, icon, total = 40 }: { label: string; icon: ReactNode; total?: number }) {
  const frame = useCurrentFrame();
  const inP = useIn(0, 16);
  const out = interpolate(frame, [total - 10, total], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame > total) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: C.blue, transform: `translateX(${(1 - inP) * -100 + out * 100}%)` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: inP * (1 - out) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36, color: C.white, fontFamily, fontWeight: 900, fontSize: 130, letterSpacing: -3 }}>
          <span style={{ width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.16)", display: "grid", placeItems: "center" }}>{icon}</span>
          {label}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** Big caption in KBC style; words appear with the VO. */
export function Caption({ children, delay = 0, style, dark = false, size = 64 }: { children: ReactNode; delay?: number; style?: CSSProperties; dark?: boolean; size?: number }) {
  const p = useIn(delay);
  return (
    <div style={{ fontFamily, fontWeight: 900, fontSize: size, lineHeight: 1.08, letterSpacing: -size * 0.02, color: dark ? C.white : C.navy, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, ...style }}>
      {children}
    </div>
  );
}

export function Sub({ children, delay = 0, style, dark = false, size = 32 }: { children: ReactNode; delay?: number; style?: CSSProperties; dark?: boolean; size?: number }) {
  const p = useIn(delay);
  return (
    <div style={{ fontFamily, fontWeight: 700, fontSize: size, lineHeight: 1.3, color: dark ? "rgba(255,255,255,.85)" : C.muted, opacity: p, transform: `translateY(${(1 - p) * 20}px)`, ...style }}>
      {children}
    </div>
  );
}

/** Lower third: green savings figure on a white KBC card. */
export function SavingsBadge({ amount, label = "per year", delay = 0, style }: { amount: string; label?: string; delay?: number; style?: CSSProperties }) {
  const p = useIn(delay, 14);
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 14, background: C.white, borderRadius: 22, padding: "18px 30px", boxShadow: "0 14px 40px rgba(10,46,92,.14)", fontFamily, transform: `scale(${0.8 + p * 0.2})`, opacity: p, transformOrigin: "left center", ...style }}>
      <span style={{ fontSize: 26, fontWeight: 800, color: C.muted }}>Save</span>
      <span style={{ fontSize: 64, fontWeight: 900, color: C.green, letterSpacing: -1 }}>{amount}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: C.green }}>{label}</span>
    </div>
  );
}

/** Small KBC signature bottom-right, on every scene of the ad. */
export function Bug({ dark = false }: { dark?: boolean }) {
  return (
    <div style={{ position: "absolute", right: 48, bottom: 40, display: "flex", alignItems: "center", gap: 14, fontFamily, fontWeight: 800, fontSize: 22, color: dark ? "rgba(255,255,255,.85)" : C.navy, opacity: 0.9 }}>
      <KbcTile size={44} style={{ boxShadow: "none" }} />
      Kate Zoom
    </div>
  );
}
