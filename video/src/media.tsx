import React from "react";
import type { CSSProperties } from "react";
import { AbsoluteFill, Audio, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import assets from "./generated/assets.json";
import { C, fontFamily } from "./brand";

/** Files that the gen-* scripts have produced (public/gen/…); missing ones render as placeholders. */
const HAVE = new Set<string>((assets as { files: string[] }).files);
export const has = (file: string) => HAVE.has(file);

export type ShotId = "energie" | "verzekering" | "boodschappen" | "streaming" | "close";

/** A Veo B-roll shot with a slow push-in. `from` = seconds into the shot. */
export function Shot({ id, from = 0, style, zoom = 0.06 }: { id: ShotId; from?: number; style?: CSSProperties; zoom?: number }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const scale = 1 + interpolate(frame, [0, durationInFrames], [0, zoom]);
  const file = `gen/veo-${id}.mp4`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      {has(file) ? (
        <OffthreadVideo src={staticFile(file)} startFrom={Math.round(from * fps)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }} />
      ) : (
        <AbsoluteFill style={{ background: `linear-gradient(135deg, ${C.sky}, ${C.navy})`, justifyContent: "center", alignItems: "center", color: "rgba(255,255,255,.7)", fontFamily, fontSize: 48, fontWeight: 800 }}>
          Veo · {id}
        </AbsoluteFill>
      )}
      {/* Cool KBC-blue grade so generated footage sits with the brand. */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,46,92,0) 50%, rgba(10,46,92,.55) 100%)", mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
}

export function Voice({ id }: { id: string }) {
  const file = `gen/vo-${id}.mp3`;
  return has(file) ? <Audio src={staticFile(file)} /> : null;
}
