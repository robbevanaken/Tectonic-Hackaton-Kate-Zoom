/**
 * Minimal Google Cloud helpers for the gen-* scripts: auth via the `katezoom` gcloud configuration
 * (the Qwiklabs lab account, see ../.env), a JSON fetch, and the generated-asset manifest.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const env = Object.fromEntries(
  readFileSync(path.join(ROOT, "../.env"), "utf8")
    .split("\n")
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);

export const PROJECT = env.GCP_PROJECT;
export const REGION = env.GCP_REGION || "us-central1";
export const GEN = path.join(ROOT, "public/gen");
mkdirSync(GEN, { recursive: true });

let cached: { token: string; at: number } | null = null;
export function token() {
  if (cached && Date.now() - cached.at < 30 * 60_000) return cached.token;
  const t = execFileSync("gcloud", ["auth", "print-access-token", env.GCP_USER, "--configuration", "katezoom"], { encoding: "utf8" }).trim();
  cached = { token: t, at: Date.now() };
  return t;
}

export async function gcp<T = any>(url: string, body?: unknown, method = body === undefined ? "GET" : "POST"): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token()}`, "x-goog-user-project": PROJECT, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url.replace(/\?.*/, "")} → ${res.status}\n${text.slice(0, 1200)}`);
  return text ? JSON.parse(text) : ({} as T);
}

export const vertex = (model: string, verb: string) =>
  `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${REGION}/publishers/google/models/${model}:${verb}`;

export const hash = (x: unknown) => createHash("sha1").update(JSON.stringify(x)).digest("hex").slice(0, 10);

/** Skip paid work when the same prompt already produced this file. */
export function cachedFor(file: string, key: string) {
  const meta = `${file}.key`;
  return existsSync(file) && existsSync(meta) && readFileSync(meta, "utf8") === key;
}
export function saveKey(file: string, key: string) {
  writeFileSync(`${file}.key`, key);
}

/** Tells Remotion which generated files exist (src/generated/assets.json). */
export function updateManifest() {
  const files = execFileSync("find", [GEN, "-type", "f", "(", "-name", "*.mp4", "-o", "-name", "*.mp3", "-o", "-name", "music.wav", ")"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((f) => path.relative(path.join(ROOT, "public"), f))
    .sort();
  writeFileSync(path.join(ROOT, "src/generated/assets.json"), JSON.stringify({ files }, null, 2));
}

export function probeSeconds(file: string) {
  const out = execFileSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { cwd: ROOT, encoding: "utf8" });
  return parseFloat(out);
}

export function ffmpeg(args: string[]) {
  execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", ...args], { cwd: ROOT, stdio: "inherit" });
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
