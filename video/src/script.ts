/**
 * Single source of truth for the ad: every segment's voice-over (English) and timing.
 * gen-tts.ts reads VO from here and writes the measured lengths to generated/vo.json;
 * segment lengths follow the real voice-over, with `min` as a floor.
 */
import voLengths from "./generated/vo.json";

export const FPS = 30;

export type SegmentId =
  | "sting" | "hook" | "meet"
  | "energie" | "handoff" | "verzekering" | "boodschappen" | "streaming"
  | "beleggen" | "schaal" | "vertrouwen" | "tech" | "close";

export interface Segment {
  id: SegmentId;
  /** Voice-over, English. null = music only. */
  vo: string | null;
  /** Seconds before the VO starts (room for a title card). */
  lead: number;
  /** Minimum length in seconds. */
  min: number;
}

export const SEGMENTS: Segment[] = [
  { id: "sting", vo: null, lead: 0, min: 3 },
  {
    id: "hook",
    vo: "Every month, you pay. For your energy, your car, your groceries, your shows. But are you paying too much? And could it be cheaper, without giving up on quality?",
    lead: 0.3,
    min: 11,
  },
  {
    id: "meet",
    vo: "Meet Kate Zoom, in your KBC app. Kate keeps an eye on what you pay every month. And she only suggests something cheaper when it's at least as good.",
    lead: 0.2,
    min: 9,
  },
  {
    id: "energie",
    vo: "Your energy bill quietly crept up from 142 to 168 euros a month. Bolt Energy is cheaper, and rated higher. That's 468 euros a year.",
    lead: 1.3,
    min: 12,
  },
  {
    id: "handoff",
    vo: "Want to switch? You choose what Kate shares. Everything else is already filled in. No forms, no hassle.",
    lead: 0.2,
    min: 8,
  },
  {
    id: "verzekering",
    vo: "Your car insurance renews soon. Same cover, a better rating, and you keep your no-claims bonus. And if it's a KBC product, it says so clearly. No special treatment.",
    lead: 1.3,
    min: 11,
  },
  {
    id: "boodschappen",
    vo: "Same brands, same quality, and still nine percent cheaper. And those headphones you bought last week? Now 70 euros cheaper, and you can still return them.",
    lead: 1.3,
    min: 11,
  },
  {
    id: "streaming",
    vo: "Three streaming services, and you mostly watch one. Pick what to pause, and see your savings right away.",
    lead: 1.3,
    min: 8,
  },
  {
    id: "beleggen",
    vo: "And what you save, you can grow. With one tap, you invest it in ETFs through Bolero. Your money keeps working, and it stays within the KBC group.",
    lead: 0.3,
    min: 11,
  },
  {
    id: "schaal",
    vo: "And this scales. More partners mean more exclusive deals. More switches mean more savings, invested through Bolero. And every new KBC service simply plugs in: more tips, with no extra effort for the customer.",
    lead: 0.3,
    min: 16,
  },
  {
    id: "vertrouwen",
    vo: "No good reason? Then Kate stays quiet. Already on a good deal? She'll tell you. And with one tap, you switch it all off.",
    lead: 0.2,
    min: 8,
  },
  {
    id: "tech",
    vo: "Under the hood: an explainable, tested engine. Never cheaper but worse, and partner deals never affect the ranking.",
    lead: 0.2,
    min: 8,
  },
  {
    id: "close",
    vo: "Kate Zoom. Cheaper. Just as good, or better. No stress, Kate it.",
    lead: 1.2,
    min: 7,
  },
];

const VO = voLengths as Partial<Record<SegmentId, number>>;

/** Rough estimate before TTS exists: ~2.5 words per second. */
const estimate = (text: string) => text.split(/\s+/).length / 2.5;

export function voSeconds(s: Segment) {
  if (!s.vo) return 0;
  return VO[s.id] ?? estimate(s.vo);
}

export function segmentFrames(s: Segment) {
  const seconds = Math.max(s.min, s.lead + voSeconds(s) + 0.7);
  return Math.ceil(seconds * FPS);
}

/** Start frame of each segment in the main ad. */
export function timeline() {
  let at = 0;
  return SEGMENTS.map((s) => {
    const from = at;
    const frames = segmentFrames(s);
    at += frames;
    return { ...s, from, frames };
  });
}

export const TOTAL_FRAMES = timeline().reduce((sum, s) => sum + s.frames, 0);

export const seg = (id: SegmentId) => SEGMENTS.find((s) => s.id === id)!;
