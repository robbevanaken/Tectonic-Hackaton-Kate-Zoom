import React from "react";
import type { CSSProperties } from "react";
import { Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import marksJson from "../public/rec/marks.json";
import { C } from "./brand";

export type Clip = "meet" | "energie" | "verzekering" | "boodschappen" | "sony" | "streaming" | "beleggen" | "vertrouwen";
const MARKS = marksJson as Record<Clip, Record<string, number>>;

/** Seconds into a recording where a named step happened (see scripts/record.ts). */
export const mark = (clip: Clip, name: string) => {
  const t = MARKS[clip]?.[name];
  if (t === undefined) throw new Error(`no mark ${clip}.${name}`);
  return t;
};

const SCREEN = { w: 390, h: 844 };

/**
 * Plays part of an app recording (from → to, in seconds of the recording) and freezes on the last frame.
 * `cover` paints the app background over the lower part of the screen after a given moment (hides demo-only UI).
 */
export function PhoneClip({ clip, from, to, rate = 1, cover }: { clip: Clip; from: number | string; to?: number | string; rate?: number; cover?: { after: number; top: number } }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = typeof from === "string" ? mark(clip, from) : from;
  const end = to === undefined ? mark(clip, "end") : typeof to === "string" ? mark(clip, to) : to;
  const playable = Math.max(1, Math.floor(((end - start) * fps) / rate));
  const clipTime = start + (Math.min(frame, playable - 1) * rate) / fps;
  return (
    <>
      <Freeze frame={playable - 1} active={frame >= playable}>
        <OffthreadVideo src={staticFile(`rec/${clip}.webm`)} startFrom={Math.round(start * fps)} playbackRate={rate} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Freeze>
      {cover && clipTime >= cover.after && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: `${cover.top * 100}%`, background: C.bg }} />}
    </>
  );
}

/** Phone mockup sized by height; children fill the 390×844 screen. */
export function Phone({ height = 940, children, style }: { height?: number; children: React.ReactNode; style?: CSSProperties }) {
  const bezel = height * 0.014;
  const screenH = height - bezel * 2;
  const screenW = (screenH * SCREEN.w) / SCREEN.h;
  return (
    <div
      style={{
        width: screenW + bezel * 2,
        height,
        borderRadius: height * 0.065,
        background: "#111",
        padding: bezel,
        boxShadow: "0 40px 90px rgba(10,46,92,.35), 0 0 0 2px #2a2a2a inset",
        position: "relative",
        ...style,
      }}
    >
      <div style={{ width: screenW, height: screenH, borderRadius: height * 0.055, overflow: "hidden", position: "relative", background: C.bg }}>
        {children}
        <div style={{ position: "absolute", left: "50%", top: screenH * 0.012, width: screenW * 0.3, height: screenH * 0.034, transform: "translateX(-50%)", borderRadius: 999, background: "#111" }} />
      </div>
    </div>
  );
}
