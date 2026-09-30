/**
 * B-roll on the Higgsfield API: Seedance 2.5 at 720p (default) or Kling 3.0 Standard; text-to-video, no sound.
 * Vertex AI Gen AI models are blocked by the lab's org policy, so video comes from Higgsfield instead.
 *
 *   npx tsx scripts/gen-video.ts            # free: prints Higgsfield's price estimate per shot and the total
 *   npx tsx scripts/gen-video.ts --go       # generates missing shots, refuses if the total would pass MAX_USD
 *   npx tsx scripts/gen-video.ts --go close # only some shots
 *
 * Paid files are cached by prompt+settings (public/gen/veo-<id>.mp4.key), so re-runs never pay twice.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GEN, cachedFor, hash, saveKey, sleep, updateManifest } from "./gcp";

const MAX_USD = Number(process.env.MAX_USD ?? 10);
const API = "https://api.higgsfield.ai";
// Kling 3.0 Standard is what the ad uses; VIDEO_MODEL=seedance switches to Seedance 2.5 (720p, ~$1.85 per shot).
const MODEL = process.env.VIDEO_MODEL ?? "kling";
const ENDPOINT = MODEL === "kling" ? "kling-video/v3.0/std/text-to-video" : "bytedance/seedance-2.5/text-to-video";
const KEY = readFileSync(path.join(import.meta.dirname, "../../.env"), "utf8")
  .split("\n")
  .find((l) => l.startsWith("HF_KEY="))
  ?.slice("HF_KEY=".length)
  .trim();
if (!KEY) throw new Error("HF_KEY missing in .env");

const THOMAS = "Thomas, a Belgian man in his mid-thirties with short dark-brown hair, light stubble, wearing a navy knit sweater";
const STYLE =
  "Photorealistic cinematic commercial, 35mm lens, shallow depth of field, natural skin texture, subtle cool blue colour grade in the shadows. No on-screen text, no captions, no watermarks, no brand names or logos anywhere.";

/** Seconds per shot: each is on screen ≤ ~3.7 s, so 4 s (3 s for the close) is enough. */
const SHOTS: Record<string, { seconds: number; prompt: string }> = {
  energie: { seconds: 4, prompt: `Evening in a cosy Flemish row-house kitchen in Ghent. ${THOMAS} sits at a wooden kitchen table and opens a paper energy bill, reads it and frowns slightly at the amount, then reaches for his smartphone next to a mug of tea. Warm lamp light mixed with cool blue window light. Slow dolly-in.` },
  verzekering: { seconds: 4, prompt: `Early autumn afternoon on a quiet Belgian residential street with brick row houses. ${THOMAS} stands next to his parked dark-grey hatchback reading an opened letter with a doubtful expression, then looks up at the car. Soft overcast light, fallen leaves on the pavement. Slow tracking shot.` },
  boodschappen: { seconds: 4, prompt: `Inside a bright modern supermarket at the checkout. ${THOMAS} packs vegetables, bread and milk into a reusable shopping bag and looks at a long paper receipt, raising his eyebrows. Clean retail lighting, shelves softly blurred, all packaging generic without readable labels. Medium shot, gentle push-in.` },
  streaming: { seconds: 4, prompt: `Evening in a living room lit mostly by the glow of a large TV. ${THOMAS} sits on a grey sofa with a remote, idly scrolling through a generic video menu of thumbnails, looking slightly bored. Warm side lamp, cool blue TV light on his face. Static camera, slow push-in.` },
  close: { seconds: 4, prompt: `Sunny morning in the same cosy Flemish row-house kitchen in Ghent. ${THOMAS} leans against the counter, relaxed and smiling at his smartphone, then takes a sip of coffee, content. Bright warm daylight through the window, plants on the windowsill. Slow push-in.` },
};

const payload = (id: string) =>
  MODEL === "kling"
    ? { prompt: `${SHOTS[id].prompt} ${STYLE}`, duration: SHOTS[id].seconds, sound: "off", aspect_ratio: "16:9", cfg_scale: 0.5 }
    : { prompt: `${SHOTS[id].prompt} ${STYLE}`, duration: SHOTS[id].seconds, resolution: "720p", aspect_ratio: "16:9", generate_audio: false };

/** Seedance's estimate returns a text rate ("$0.4622 at 720p" per second) instead of USD. */
function priceOf(e: { usd?: string; pricing_description?: string }, seconds: number) {
  if (e.usd) return Number(e.usd);
  const m = /\$([0-9.]+) at 720p/.exec(e.pricing_description ?? "");
  if (!m) throw new Error(`no price in estimate: ${JSON.stringify(e).slice(0, 300)}`);
  return Number(m[1]) * seconds;
}

async function hf<T = any>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url.startsWith("http") ? url : `${API}/${url}`, {
    method,
    headers: { Authorization: `Key ${KEY}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

async function main() {
  const args = process.argv.slice(2);
  const go = args.includes("--go");
  const only = args.filter((a) => !a.startsWith("--"));
  const ids = only.length ? only : Object.keys(SHOTS);

  // 1. Free estimates for everything that isn't generated yet.
  const todo: { id: string; usd: number; file: string; key: string }[] = [];
  for (const id of ids) {
    const file = path.join(GEN, `veo-${id}.mp4`);
    const key = hash({ ENDPOINT, ...payload(id) });
    if (cachedFor(file, key)) {
      console.log(`= ${id} already generated`);
      continue;
    }
    const e = await hf<{ usd?: string; pricing_description?: string }>("POST", `estimate/${ENDPOINT}`, payload(id));
    const usd = priceOf(e, SHOTS[id].seconds);
    todo.push({ id, usd, file, key });
    console.log(`$ ${id.padEnd(13)} ${SHOTS[id].seconds}s  $${usd.toFixed(3)}  (${MODEL})`);
  }
  const total = todo.reduce((s, t) => s + t.usd, 0);
  console.log(`Total to generate: $${total.toFixed(3)} (cap $${MAX_USD.toFixed(2)})`);
  if (!go || todo.length === 0) return;
  if (total > MAX_USD) throw new Error(`Estimate $${total.toFixed(3)} is over the cap; nothing submitted`);

  // 2. Submit one at a time and record each request ID immediately (public/gen/jobs.json),
  //    so a crash or server error never loses a paid job; a re-run resumes polling instead of paying again.
  const jobsFile = path.join(GEN, "jobs.json");
  const saved: Record<string, { request_id: string; status_url?: string; key: string }> = existsSync(jobsFile) ? JSON.parse(readFileSync(jobsFile, "utf8")) : {};
  const jobs: (typeof todo[number] & { sub: { request_id: string; status_url?: string } })[] = [];
  for (const t of todo) {
    const prev = saved[t.id];
    if (prev && prev.key === t.key) {
      console.log(`↻ ${t.id} resuming ${prev.request_id}`);
      jobs.push({ ...t, sub: prev });
      continue;
    }
    let sub: { request_id: string; status_url?: string };
    try {
      sub = await hf("POST", ENDPOINT, payload(t.id));
    } catch (e: any) {
      console.error(`✗ submitting ${t.id} failed, stopping (nothing else submitted): ${e.message}`);
      break;
    }
    saved[t.id] = { ...sub, key: t.key };
    writeFileSync(jobsFile, JSON.stringify(saved, null, 2));
    console.log(`… ${t.id} submitted (${sub.request_id})`);
    jobs.push({ ...t, sub });
  }
  const failed: string[] = [];
  await Promise.all(
    jobs.map(async (j) => {
      for (;;) {
        await sleep(8000);
        const st = await hf<any>("GET", j.sub.status_url ?? `requests/${j.sub.request_id}/status`);
        if (st.status === "completed") {
          const url = st.video?.url ?? st.videos?.[0]?.url;
          const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
          writeFileSync(j.file, buf);
          saveKey(j.file, j.key);
          console.log(`✓ ${j.id}`);
          return;
        }
        if (["failed", "nsfw", "cancelled", "canceled"].includes(st.status)) {
          console.error(`✗ ${j.id}: ${st.status} ${JSON.stringify(st).slice(0, 300)}`);
          failed.push(j.id);
          return;
        }
      }
    }),
  );
  updateManifest();
  if (failed.length || jobs.length < todo.length) process.exit(1);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
