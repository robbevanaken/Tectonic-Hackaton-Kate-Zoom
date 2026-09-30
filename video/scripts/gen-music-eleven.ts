/**
 * Music bed with ElevenLabs Music (~900 credits per minute). Instrumental, a bit longer than the ad;
 * Remotion fades it out and ducks it under the voice-over. Writes public/gen/music.mp3.
 * (scripts/gen-music.ts is the free, code-composed fallback.)
 *
 *   npx tsx scripts/gen-music-eleven.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GEN, cachedFor, hash, saveKey, updateManifest } from "./gcp";

const KEY = readFileSync(path.join(import.meta.dirname, "../../.env"), "utf8")
  .split("\n")
  .find((l) => l.startsWith("ELEVENLABS_API_KEY="))
  ?.slice("ELEVENLABS_API_KEY=".length)
  .trim();
if (!KEY) throw new Error("ELEVENLABS_API_KEY missing in .env");

const req = {
  prompt:
    "Warm, optimistic modern underscore for a Belgian bank app commercial. Soft plucked synths, light felt piano, subtle claps and a steady mid-tempo groove around 104 BPM. Bright, confident and friendly, calm intro, gentle lift in the middle, uplifting resolved ending. Clean, sparse mix that leaves room for a voice-over. Instrumental, no vocals.",
  music_length_ms: Number(process.env.MUSIC_MS ?? 150_000),
  force_instrumental: true,
};

const file = path.join(GEN, "music.mp3");
const key = hash(req);
if (cachedFor(file, key)) {
  console.log("= music.mp3 already generated");
} else {
  const res = await fetch("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`music → ${res.status} ${(await res.text()).slice(0, 500)}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  saveKey(file, key);
  console.log("✓ music.mp3");
}
updateManifest();
