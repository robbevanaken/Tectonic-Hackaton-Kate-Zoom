import React from "react";
import type { ComponentType } from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile } from "remotion";
import { FPS, TOTAL_FRAMES, seg, segmentFrames, timeline, type SegmentId } from "./script";
import { has, Voice } from "./media";
import { Hook, Meet, Sting } from "./scenes/intro";
import { CATEGORIES, Category, Handoff } from "./scenes/category";
import { Close, EndCard, Invest, Scale, Tech, Trust } from "./scenes/outro";

type Cat = keyof typeof CATEGORIES;

const SCENES: Record<SegmentId, ComponentType> = {
  sting: Sting,
  hook: Hook,
  meet: Meet,
  energie: () => <Category config={CATEGORIES.energie} />,
  handoff: Handoff,
  verzekering: () => <Category config={CATEGORIES.verzekering} />,
  boodschappen: () => <Category config={CATEGORIES.boodschappen} />,
  streaming: () => <Category config={CATEGORIES.streaming} />,
  beleggen: Invest,
  schaal: Scale,
  vertrouwen: Trust,
  tech: Tech,
  close: Close,
};

/** Music bed, ducked while someone speaks. `speech` = [from, to] frame ranges. */
function Music({ speech, total }: { speech: [number, number][]; total: number }) {
  // ElevenLabs track if present, else the code-composed fallback.
  const file = has("gen/music.mp3") ? "gen/music.mp3" : has("gen/music.wav") ? "gen/music.wav" : null;
  if (!file) return null;
  return (
    <Audio
      src={staticFile(file)}
      loop
      volume={(f) => {
        const talking = speech.some(([a, b]) => f >= a - 8 && f <= b + 8);
        const fade = interpolate(f, [0, 20, total - 45, total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (talking ? 0.13 : 0.38) * fade;
      }}
    />
  );
}

function speechRanges(parts: { id: SegmentId; from: number; frames: number }[]): [number, number][] {
  return parts
    .filter((p) => seg(p.id).vo)
    .map((p) => {
      const s = seg(p.id);
      const start = p.from + Math.round(s.lead * FPS);
      return [start, Math.min(p.from + p.frames, start + Math.round(((p.frames / FPS) - s.lead) * FPS))];
    });
}

function Segments({ parts }: { parts: { id: SegmentId; from: number; frames: number }[] }) {
  return (
    <>
      {parts.map((p) => {
        const Scene = SCENES[p.id];
        return (
          <Sequence key={p.id + p.from} from={p.from} durationInFrames={p.frames} name={p.id}>
            <Scene />
            <Sequence from={Math.round(seg(p.id).lead * FPS)} name={`vo-${p.id}`}>
              <Voice id={p.id} />
            </Sequence>
          </Sequence>
        );
      })}
    </>
  );
}

export function KateZoomAd() {
  const parts = timeline();
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Segments parts={parts} />
      <Music speech={speechRanges(parts)} total={TOTAL_FRAMES} />
    </AbsoluteFill>
  );
}

/** Vertical cutdown: short sting → category → end card with the tagline VO. */
function cutParts(cat: Cat) {
  const sting = { id: "sting" as SegmentId, from: 0, frames: Math.round(1.6 * FPS) };
  const main = { id: cat as SegmentId, from: sting.frames, frames: segmentFrames(seg(cat)) };
  const close = { id: "close" as SegmentId, from: main.from + main.frames, frames: Math.round(4 * FPS) };
  return [sting, main, close];
}

function Cut({ cat }: { cat: Cat }) {
  const parts = cutParts(cat);
  const [sting, main, close] = parts;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Sequence durationInFrames={sting.frames}><Sting /></Sequence>
      <Sequence from={main.from} durationInFrames={main.frames}>
        <Category config={CATEGORIES[cat]} />
        <Sequence from={Math.round(seg(cat).lead * FPS)}><Voice id={cat} /></Sequence>
      </Sequence>
      <Sequence from={close.from} durationInFrames={close.frames}>
        <EndCard />
        <Sequence from={6}><Voice id="close" /></Sequence>
      </Sequence>
      <Music speech={speechRanges([main])} total={close.from + close.frames} />
    </AbsoluteFill>
  );
}

const CUTS: { id: string; cat: Cat }[] = [
  { id: "Cut-Energie", cat: "energie" },
  { id: "Cut-Verzekering", cat: "verzekering" },
  { id: "Cut-Boodschappen", cat: "boodschappen" },
  { id: "Cut-Streaming", cat: "streaming" },
];

export function Root() {
  return (
    <>
      <Composition id="KateZoomAd" component={KateZoomAd} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
      {CUTS.map((c) => {
        const parts = cutParts(c.cat);
        const last = parts[parts.length - 1];
        return <Composition key={c.id} id={c.id} component={() => <Cut cat={c.cat} />} durationInFrames={last.from + last.frames} fps={FPS} width={1080} height={1920} />;
      })}
    </>
  );
}
