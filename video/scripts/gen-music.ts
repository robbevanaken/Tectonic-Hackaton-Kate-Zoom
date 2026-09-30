/**
 * Music bed composed in code (Lyria is blocked by the lab's org policy): a warm, optimistic 104 BPM
 * underscore in F major — pad, plucked arpeggio, bass, soft kick/clap/hats, a little reverb.
 * Deterministic and royalty-free. Writes public/gen/music.wav; Remotion loops it and ducks it under the VO.
 *
 *   npx tsx scripts/gen-music.ts
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { GEN, updateManifest } from "./gcp";

const SR = 44100;
const BPM = 104;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const BARS = 68; // ~2:37, longer than the ad
const N = Math.ceil(BARS * BAR * SR) + SR * 2;

const L = new Float32Array(N);
const R = new Float32Array(N);
const padBus = new Float32Array(N);
const fxBus = new Float32Array(N);
const duck = new Float32Array(N).fill(1);

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

// F – C – Dm – Bb, voice-led.
const CHORDS = [
  { pad: [53, 57, 60, 65], bass: 41 },
  { pad: [52, 55, 60, 64], bass: 36 },
  { pad: [53, 57, 62, 65], bass: 38 },
  { pad: [53, 58, 62, 65], bass: 34 },
];

/** Arrangement per bar: which parts play. */
function parts(bar: number) {
  const drop = bar % 16 === 15; // one-bar breath every 16 bars
  return {
    pad: true,
    arp: bar >= 2,
    drums: bar >= 4 && !drop,
    bass: bar >= 4 && !drop,
    hats: bar >= 8 && !drop,
  };
}

function add(buf: Float32Array, start: number, samples: number, fn: (t: number, i: number) => number) {
  const s0 = Math.floor(start * SR);
  for (let i = 0; i < samples && s0 + i < N; i++) buf[s0 + i] += fn(i / SR, i);
}

function stereo(start: number, dur: number, pan: number, fn: (t: number) => number, send = 0) {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4), gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && s0 + i < N; i++) {
    const v = fn(i / SR);
    L[s0 + i] += v * gl;
    R[s0 + i] += v * gr;
    if (send) fxBus[s0 + i] += v * send;
  }
}

for (let bar = 0; bar < BARS; bar++) {
  const t0 = bar * BAR;
  const ch = CHORDS[bar % 4];
  const p = parts(bar);

  // Pad: detuned sines, slow swell, goes to its own (ducked) bus.
  if (p.pad) {
    for (const m of ch.pad) {
      const f = hz(m);
      add(padBus, t0, Math.floor((BAR + 0.6) * SR), (t) => {
        const env = Math.min(1, t / 0.5) * Math.min(1, Math.max(0, (BAR + 0.6 - t) / 0.6));
        return env * 0.028 * (Math.sin(2 * Math.PI * f * 0.997 * t) + Math.sin(2 * Math.PI * f * 1.003 * t) + 0.35 * Math.sin(4 * Math.PI * f * t));
      });
    }
  }

  // Plucked arpeggio in 8ths, alternating pan.
  if (p.arp) {
    const notes = [ch.pad[0] + 12, ch.pad[1] + 12, ch.pad[2] + 12, ch.pad[3] + 12, ch.pad[2] + 12, ch.pad[1] + 12, ch.pad[2] + 12, ch.pad[3] + 12];
    notes.forEach((m, k) => {
      const f = hz(m);
      const vel = k % 2 === 0 ? 1 : 0.75;
      stereo(t0 + k * (BEAT / 2), 0.9, k % 2 ? 0.35 : -0.35, (t) => {
        const env = Math.exp(-t / 0.22) * Math.min(1, t / 0.004);
        let v = 0;
        for (let h = 1; h <= 4; h++) v += Math.sin(2 * Math.PI * f * h * t) / Math.pow(h, 1.6);
        return v * env * 0.055 * vel;
      }, 0.5);
    });
  }

  // Bass on 1, 3 and the "and" of 4.
  if (p.bass) {
    const f = hz(ch.bass);
    for (const [beat, len] of [[0, 1.6], [2, 1.2], [3.5, 0.45]] as const) {
      stereo(t0 + beat * BEAT, len * BEAT, 0, (t) => {
        const env = Math.min(1, t / 0.01) * Math.exp(-t / 0.5) * Math.min(1, Math.max(0, (len * BEAT - t) / 0.03));
        return env * 0.16 * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t));
      });
    }
  }

  if (p.drums) {
    for (let b = 0; b < 4; b++) {
      const tb = t0 + b * BEAT;
      if (b === 0 || b === 2) {
        // Kick: pitch drop; also drives the sidechain duck on pad.
        let phase = 0;
        stereo(tb, 0.4, 0, (t) => {
          const f = 45 + 80 * Math.exp(-t / 0.035);
          phase += (2 * Math.PI * f) / SR;
          return Math.sin(phase) * Math.exp(-t / 0.16) * 0.42;
        });
        const s0 = Math.floor(tb * SR);
        for (let i = 0; i < SR * 0.35 && s0 + i < N; i++) duck[s0 + i] = Math.min(duck[s0 + i], 0.45 + 0.55 * (i / (SR * 0.35)));
      } else {
        // Clap: three quick noise bursts, crude band-pass.
        let prev = 0;
        stereo(tb, 0.25, 0.1, (t) => {
          const n = rand();
          const hp = n - prev;
          prev = n;
          const burst = t < 0.03 ? (Math.floor(t / 0.01) % 2 === 0 ? 1 : 0.4) : 1;
          return hp * burst * Math.exp(-t / 0.07) * 0.09;
        }, 0.4);
      }
    }
  }

  if (p.hats) {
    for (let k = 0; k < 8; k++) {
      let prev = 0;
      stereo(t0 + k * (BEAT / 2), 0.08, k % 2 ? 0.45 : -0.2, (t) => {
        const n = rand();
        const hp = n - prev;
        prev = n;
        return hp * Math.exp(-t / 0.018) * (k % 2 ? 0.05 : 0.03);
      });
    }
  }
}

// Pad bus with sidechain pump, slightly wide.
for (let i = 0; i < N; i++) {
  const v = padBus[i] * duck[i];
  L[i] += v;
  R[i] += i > 300 ? padBus[i - 300] * duck[i] : 0;
  fxBus[i] += v * 0.6;
}

// Simple reverb on the send bus: four feedback combs per side.
function reverb(input: Float32Array, delays: number[], out: Float32Array, wet: number) {
  for (const d of delays) {
    const buf = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      buf[i] = input[i] + (i >= d ? buf[i - d] * 0.72 : 0);
      out[i] += buf[i] * wet;
    }
  }
}
reverb(fxBus, [1557, 1617, 1491, 1422].map((d) => d * 1.3), L, 0.05);
reverb(fxBus, [1277, 1356, 1188, 1116].map((d) => d * 1.3), R, 0.05);

// Soft limit and normalise to -1 dBFS.
let peak = 0;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * 1.2);
  R[i] = Math.tanh(R[i] * 1.2);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.89 / peak;

// 16-bit stereo WAV.
const data = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), i * 4);
  data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.writeUInt32LE(data.length, 40);
writeFileSync(path.join(GEN, "music.wav"), Buffer.concat([header, data]));
updateManifest();
console.log(`✓ music.wav ${(N / SR).toFixed(1)}s`);
