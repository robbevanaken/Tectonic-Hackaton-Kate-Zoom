/**
 * Snapshots the numbers the video shows (prices, quality scores, savings) from the running API,
 * so captions and comparison cards always match the app. Writes src/generated/facts.json.
 */
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const API = "http://localhost:4000/api/me";
const T = "demo-thomas";
const call = async (p: string, body?: unknown) => {
  const r = await fetch(API + p, { method: body ? "POST" : "GET", headers: { Authorization: `Bearer ${T}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(`${p} ${r.status}`);
  return r.json();
};

const pick = (list: any[], id: string) => {
  const i = list.find((x) => x.id === id || x.id.startsWith(id));
  if (!i) throw new Error(`missing insight ${id}`);
  return { id: i.id, title: i.title, current: i.current, alternative: i.alternative ?? null, savingsYear: Math.round(i.savingsYear), savingsMonth: i.savingsMonth };
};

await call("/reset", {});
await call("/demo-date", { date: "2026-09-30" });
const late = (await call("/insights")).insights;
await call("/demo-date", { date: "2026-09-15" });
const mid = (await call("/insights")).insights;
const facts = {
  energie: pick(mid, "engie-o-bolt"),
  verzekering: pick(late, "ag-o-kbc-auto"),
  boodschappen: pick(mid, "delhaize-o-colruyt"),
  sony: pick(late, "purchase-"),
  streaming: pick(mid, "overlap-streaming"),
  total: Math.round(mid.reduce((s: number, i: any) => s + i.savingsYear, 0)),
};
// Invest scene: after the energy switch, Bolero Wereld-ETF over 20 years (same as the recording).
await call("/insights/engie-o-bolt/feedback", { action: "accept" });
const sv = await call("/savings");
const invest = { platform: "bolero", option: "world", lump: Math.floor(sv.realized), monthly: Math.ceil(sv.yearly / 12), years: 20 };
const proj = await call("/invest/projection", invest);
const last = proj.points[proj.points.length - 1];
const beleggen = { ...invest, realized: sv.realized, yearly: sv.yearly, value: Math.round(last.value), invested: Math.round(last.invested), optionLabel: sv.platforms.bolero.options.world.label, expectedReturn: sv.platforms.bolero.options.world.expectedReturn };
const netflix = 13.99; // the service Kate suggests keeping (apps/api/src/data/customers.ts)
const streamingKeep = { keep: "Netflix", keepMonthly: netflix, pausedYear: Math.round((facts.streaming.current.monthly - netflix) * 12) };
const testOut = execSync("npm test", { cwd: path.join(import.meta.dirname, "../.."), encoding: "utf8" });
const tests = Number(/tests (\d+)/.exec(testOut)?.[1] ?? 0);
Object.assign(facts, { beleggen, streamingKeep, tests });
await call("/reset", {});
await call("/demo-date", { date: "2026-09-30" });
writeFileSync(path.join(import.meta.dirname, "../src/generated/facts.json"), JSON.stringify(facts, null, 2));
console.log(JSON.stringify(facts, null, 1).slice(0, 1500));
