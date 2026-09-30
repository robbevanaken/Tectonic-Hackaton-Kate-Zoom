/**
 * Voice-over per segment with Cloud Text-to-Speech (nl-BE Chirp 3 HD), then writes the measured
 * lengths to src/generated/vo.json so the timeline follows the real voice.
 *
 *   npx tsx scripts/gen-tts.ts                # all segments
 *   npx tsx scripts/gen-tts.ts --voices       # list nl-BE voices
 *   TTS_VOICE=nl-BE-Chirp3-HD-Charon npx tsx scripts/gen-tts.ts
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { SEGMENTS } from "../src/script";
import { GEN, cachedFor, gcp, hash, probeSeconds, saveKey, updateManifest } from "./gcp";

const TTS = "https://texttospeech.googleapis.com/v1";

async function voices() {
  const r = await gcp<{ voices: { name: string; ssmlGender: string }[] }>(`${TTS}/voices?languageCode=nl-BE`);
  return r.voices;
}

async function main() {
  const list = await voices();
  if (process.argv.includes("--voices")) {
    for (const v of list) console.log(v.name, v.ssmlGender);
    return;
  }
  const chirp = list.filter((v) => v.name.includes("Chirp3-HD"));
  const voice = process.env.TTS_VOICE ?? chirp.find((v) => v.ssmlGender === "FEMALE")?.name ?? chirp[0]?.name ?? list[0].name;
  console.log("voice:", voice);
  const lengths: Record<string, number> = {};
  for (const s of SEGMENTS) {
    if (!s.vo) continue;
    const file = path.join(GEN, `vo-${s.id}.mp3`);
    const req = {
      input: { text: s.vo },
      voice: { languageCode: "nl-BE", name: voice },
      audioConfig: { audioEncoding: "MP3", sampleRateHertz: 48000, speakingRate: Number(process.env.TTS_RATE ?? 1.04) },
    };
    const key = hash(req);
    if (!cachedFor(file, key)) {
      const r = await gcp<{ audioContent: string }>(`${TTS}/text:synthesize`, req);
      writeFileSync(file, Buffer.from(r.audioContent, "base64"));
      saveKey(file, key);
    }
    lengths[s.id] = Math.round(probeSeconds(file) * 100) / 100;
    console.log(`✓ ${s.id} ${lengths[s.id]}s`);
  }
  writeFileSync(path.join(import.meta.dirname, "../src/generated/vo.json"), JSON.stringify(lengths, null, 2));
  updateManifest();
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
