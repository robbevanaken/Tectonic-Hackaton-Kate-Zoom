import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, Bug, C, Caption, KbcTile, Sub, Wordmark, fontFamily, useIn } from "../brand";
import { Phone, PhoneClip } from "../phone";
import { Shot, type ShotId } from "../media";

/** KBC tile → Kate Zoom wordmark. */
export function Sting() {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const tile = useIn(0, 12);
  const word = useIn(18, 16);
  const shift = interpolate(word, [0, 1], [0, -1]);
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const vertical = height > width;
  return (
    <AbsoluteFill style={{ background: C.white, opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: vertical ? "column" : "row", gap: 60 }}>
        <div style={{ transform: `scale(${tile}) translate${vertical ? "Y" : "X"}(${shift * 20}px)` }}>
          <KbcTile size={vertical ? 200 : 180} />
        </div>
        <div style={{ opacity: word, transform: `translateX(${(1 - word) * 40}px)`, display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", gap: 12 }}>
          <Wordmark size={vertical ? 96 : 110} />
          <Sub delay={26} size={vertical ? 40 : 36} style={{ color: C.blue }}>In your KBC Mobile app</Sub>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const HOOK_SHOTS: { id: ShotId; word: string }[] = [
  { id: "energie", word: "Your energy" },
  { id: "verzekering", word: "Your car" },
  { id: "boodschappen", word: "Your groceries" },
  { id: "streaming", word: "Your shows" },
];

/** Four everyday bills, then the question. VO: "Every month, you pay…". */
export function Hook() {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  // The four shots cover the first sentence (~55%), then the question lands on navy.
  const montage = Math.round(durationInFrames * 0.56);
  const each = Math.floor(montage / HOOK_SHOTS.length);
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      {HOOK_SHOTS.map((s, i) => (
        <Sequence key={s.id} from={i * each} durationInFrames={each + 6}>
          <Shot id={s.id} from={0.5} zoom={0.08} />
          <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 110px 110px" }}>
            <Caption size={96} dark style={{ textShadow: "0 6px 30px rgba(0,0,0,.35)" }}>{s.word}</Caption>
          </AbsoluteFill>
        </Sequence>
      ))}
      <Sequence from={0} durationInFrames={montage}>
        <AbsoluteFill style={{ padding: "90px 110px", fontFamily }}>
          <Sub dark size={34} style={{ textShadow: "0 4px 20px rgba(0,0,0,.4)" }}>Every month, you pay…</Sub>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={montage}>
        <Backdrop dark>
          <AbsoluteFill style={{ justifyContent: "center", padding: "0 160px", gap: 36 }}>
            <Caption dark size={110}>Paying too much?</Caption>
            <Caption dark size={64} delay={Math.round(fps * 1.6)} style={{ color: C.light }}>
              Cheaper. Just as good or better.
            </Caption>
          </AbsoluteFill>
          <Bug dark />
        </Backdrop>
      </Sequence>
      <AbsoluteFill style={{ background: C.white, opacity: interpolate(frame, [0, 6], [1, 0], { extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
}

/** App intro: push arrives, Kate Zoom overview with all tips. */
export function Meet() {
  const { fps } = useVideoConfig();
  const phone = useIn(4, 16);
  return (
    <Backdrop>
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 150px", gap: 120 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 34 }}>
          <div style={{ opacity: useIn(0), transform: `translateY(${(1 - useIn(0)) * 20}px)` }}>
            <Wordmark size={92} />
          </div>
          <Caption size={60} delay={Math.round(fps * 1.4)}>Keeps an eye on what you pay every month.</Caption>
          <Sub size={36} delay={Math.round(fps * 4.2)} style={{ maxWidth: 820 }}>
            And only suggests something cheaper when it's <b style={{ color: C.green }}>at least as good</b>.
          </Sub>
        </div>
        <div style={{ transform: `translateY(${(1 - phone) * 120}px)`, opacity: phone }}>
          <Phone height={940}>
            <PhoneClip clip="meet" from="ready" />
          </Phone>
        </div>
      </AbsoluteFill>
      <Bug />
    </Backdrop>
  );
}
