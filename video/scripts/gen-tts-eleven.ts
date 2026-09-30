/**
 * Voice-over with ElevenLabs (more natural than Google's Chirp; Gemini-TTS is blocked in the lab).
 * Reads ELEVENLABS_API_KEY from ../.env.
 *
 *   npx tsx scripts/gen-tts-eleven.ts --library        # free: downloads preview clips of Flemish/Dutch library voices
 *   npx tsx scripts/gen-tts-eleven.ts --use <voiceId>  # adds a library voice to your account (needed before generating)
 *   npx tsx scripts/gen-tts-eleven.ts                  # generates every segment with Matilda (~1 credit per character)
 *
 * Writes public/gen/vo-<segment>.mp3 and src/generated/vo.json (the timeline follows the real lengths).
 * Files are cached by text+voice+settings, so re-runs don't spend credits twice.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SEGMENTS } from "../src/script";
import { GEN, cachedFor, hash, probeSeconds, saveKey, updateManifest } from "./gcp";

const API = "https://api.elevenlabs.io/v1";
const KEY = readFileSync(path.join(import.meta.dirname, "../../.env"), "utf8")
  .split("\n")
  .find((l) => l.startsWith("ELEVENLABS_API_KEY="))
  ?.slice("ELEVENLABS_API_KEY=".length)
  .trim();
if (!KEY) throw new Error("ELEVENLABS_API_KEY missing in .env");

const MODEL = process.env.ELEVEN_MODEL ?? "eleven_multilingual_v2";
/** The ad's voice: Matilda (premade, "Knowledgable, Professional", American). */
const MATILDA = "XrExE9yKIg1WjnnlVkGX";
const SETTINGS = { stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true, speed: 1.0 };

async function el(method: string, url: string, body?: unknown) {
  const res = await fetch(`${API}${url}`, {
    method,
    headers: { "xi-api-key": KEY!, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${(await res.text()).slice(0, 400)}`);
  return res;
}

async function library() {
  const dir = path.join(GEN, "samples-eleven");
  mkdirSync(dir, { recursive: true });
  const seen = new Set<string>();
  const found: any[] = [];
  for (const q of ["language=nl&accent=flemish", "language=nl&accent=belgian", "language=nl"]) {
    const r = await (await el("GET", `/shared-voices?page_size=40&${q}`)).json();
    for (const v of r.voices ?? []) if (!seen.has(v.voice_id)) seen.add(v.voice_id), found.push(v);
  }
  // Prefer narration/advertising voices with some usage.
  found.sort((a, b) => (b.cloned_by_count ?? 0) - (a.cloned_by_count ?? 0));
  const pick = found.slice(0, 16);
  for (const [i, v] of pick.entries()) {
    const name = `${String(i + 1).padStart(2, "0")}-${v.accent ?? "nl"}-${v.gender ?? ""}-${v.name}`.replace(/[^\w.-]+/g, "_");
    if (v.preview_url) writeFileSync(path.join(dir, `${name}.mp3`), Buffer.from(await (await fetch(v.preview_url)).arrayBuffer()));
    console.log(`${name}\n    id=${v.voice_id} owner=${v.public_owner_id} use=${v.use_case ?? ""} ${String(v.description ?? "").slice(0, 80)}`);
  }
  console.log(`\nPreviews in ${dir} (no credits used).`);
}

async function use(voiceId: string) {
  let v: any;
  for (const q of ["language=nl", "accent=flemish&gender=female", "accent=flemish&gender=male"]) {
    const r = await (await el("GET", `/shared-voices?page_size=100&${q}`)).json();
    v = (r.voices ?? []).find((x: any) => x.voice_id === voiceId);
    if (v) break;
  }
  if (!v) throw new Error("voice not found in the Dutch library listing");
  await el("POST", `/voices/add/${v.public_owner_id}/${voiceId}`, { new_name: `Kate Zoom – ${v.name}` });
  console.log(`✓ added ${v.name} to your voices`);
}

async function generate(voice: string) {
  const lengths: Record<string, number> = {};
  for (const s of SEGMENTS) {
    if (!s.vo) continue;
    const file = path.join(GEN, `vo-${s.id}.mp3`);
    const req = { text: s.vo, model_id: MODEL, voice_settings: SETTINGS };
    const key = hash({ voice, ...req });
    if (!cachedFor(file, key)) {
      const res = await el("POST", `/text-to-speech/${voice}?output_format=mp3_44100_128`, req);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      saveKey(file, key);
    }
    lengths[s.id] = Math.round(probeSeconds(file) * 100) / 100;
    console.log(`✓ ${s.id} ${lengths[s.id]}s`);
  }
  writeFileSync(path.join(import.meta.dirname, "../src/generated/vo.json"), JSON.stringify(lengths, null, 2));
  updateManifest();
}

const args = process.argv.slice(2);
const run = args[0] === "--library" ? library() : args[0] === "--use" ? use(args[1]) : generate(process.env.ELEVEN_VOICE ?? MATILDA);
run.catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
