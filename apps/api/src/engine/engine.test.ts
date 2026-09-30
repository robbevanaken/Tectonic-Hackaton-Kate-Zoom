import { test } from "node:test";
import assert from "node:assert/strict";
import { CUSTOMERS, AS_OF } from "../data/customers.js";
import { categorize } from "./categorize.js";
import { detectRecurring } from "./recurring.js";
import { bestAlternative, QUALITY_TOLERANCE } from "./match.js";
import { analyze, pickNotification, PUSH_COOLDOWN_DAYS } from "./insights.js";
import type { RecurringSpend } from "./types.js";

const thomas = CUSTOMERS.find((c) => c.id === "c-thomas")!;
const lien = CUSTOMERS.find((c) => c.id === "c-lien")!;

test("categorizes known merchants and leaves the rest as other/income", () => {
  const txs = categorize(thomas.transactions);
  assert.ok(txs.some((t) => t.merchantId === "engie" && t.category === "energy"));
  assert.ok(txs.some((t) => t.category === "income" && t.amount > 0));
  assert.ok(txs.every((t) => t.merchantId !== null || t.category === "other" || t.category === "income"));
});

test("detects monthly cadence and price creep on energy", () => {
  const rec = detectRecurring(categorize(thomas.transactions), AS_OF);
  const engie = rec.find((r) => r.merchantId === "engie")!;
  assert.equal(engie.cadence, "monthly");
  assert.ok(engie.trendPct > 10, `expected creep, got ${engie.trendPct}%`);
  const delhaize = rec.find((r) => r.merchantId === "delhaize")!;
  assert.equal(delhaize.cadence, "weekly");
});

test("never proposes a cheaper but clearly worse alternative", () => {
  const rec = detectRecurring(categorize(thomas.transactions), AS_OF);
  const telenet = rec.find((r) => r.merchantId === "telenet")!;
  const match = bestAlternative(telenet)!;
  assert.ok(match, "expected a telecom alternative");
  assert.notEqual(match.offer.provider, "Scarlet"); // cheapest, but quality 3.4 < 4.0 - tolerance
  assert.ok(match.offer.quality >= telenet.quality - QUALITY_TOLERANCE);
});

test("does not suggest switching to the provider you already have", () => {
  const r: RecurringSpend = { merchantId: "bolt", merchantName: "Bolt Energie", category: "energy", cadence: "monthly", monthlyAvg: 96, currentMonthly: 96, lastAmount: 96, lastDate: "2026-09-08", firstDate: "2025-08-08", occurrences: 14, monthsActive: 13.7, trendPct: 0, quality: 4.3, byMonth: [] };
  assert.equal(bestAlternative(r), null);
});

test("Thomas: timing moments fire for energy (creep + seasonal) and telecom (contract window + post-debit)", () => {
  const { insights } = analyze(thomas, AS_OF);
  const energy = insights.find((i) => i.category === "energy")!;
  const telecom = insights.find((i) => i.category === "telecom")!;
  assert.ok(energy.moments.some((m) => m.type === "price_creep"));
  assert.ok(energy.moments.some((m) => m.type === "seasonal"));
  assert.ok(telecom.moments.some((m) => m.type === "contract_window"));
  assert.ok(telecom.moments.some((m) => m.type === "post_debit"));
  assert.ok(insights.some((i) => i.kind === "overlap"), "3 streaming services → overlap insight");
  assert.ok(energy.savingsYear > 300);
});

test("Lien already has good deals: at most one small tip and no push", () => {
  const { insights } = analyze(lien, AS_OF);
  assert.ok(insights.every((i) => i.category !== "energy"), "Bolt is already the best energy offer");
  assert.ok(insights.length <= 2, `expected ≤2 insights, got ${insights.map((i) => i.id).join(",")}`);
  const push = pickNotification(insights, lien, AS_OF);
  assert.equal(push.insight, null, "a tip without a timing moment is never pushed");
});

test("notification policy: one push per week, honours snooze/dismiss", () => {
  const { insights } = analyze(thomas, AS_OF);
  const first = pickNotification(insights, thomas, AS_OF);
  assert.ok(first.insight, "expected a push for Thomas");
  assert.ok(first.insight!.moments.length > 0, "push should have a timing moment");

  const cooled = { ...thomas, notified: [{ insightId: first.insight!.id, at: AS_OF }] };
  assert.equal(pickNotification(insights, cooled, AS_OF).insight, null);

  const later = new Date(Date.parse(AS_OF) + PUSH_COOLDOWN_DAYS * 86_400_000).toISOString().slice(0, 10);
  const next = pickNotification(analyze(cooled, later).insights, cooled, later);
  assert.notEqual(next.insight?.id, first.insight!.id, "never the same insight twice");
  assert.ok(next.insight === null || next.insight.moments.length > 0, "a push always has a timing moment");

  const dismissed = { ...thomas, feedback: [{ insightId: first.insight!.id, action: "dismiss" as const, at: AS_OF }] };
  const afterDismiss = pickNotification(analyze(dismissed, AS_OF).insights, dismissed, AS_OF);
  assert.notEqual(afterDismiss.insight?.id, first.insight!.id);
});

test("analysis is deterministic", () => {
  const a = JSON.stringify(analyze(thomas, AS_OF).insights.map((i) => [i.id, i.relevance]));
  const b = JSON.stringify(analyze(thomas, AS_OF).insights.map((i) => [i.id, i.relevance]));
  assert.equal(a, b);
});

test("KBC partner offers get no ranking boost", () => {
  const r: RecurringSpend = { merchantId: "ag", merchantName: "AG Insurance (auto)", category: "insurance", cadence: "monthly", monthlyAvg: 62, currentMonthly: 62, lastAmount: 62, lastDate: "2026-09-01", firstDate: "2025-11-01", occurrences: 11, monthsActive: 11, trendPct: 0, quality: 4.2, byMonth: [] };
  const offers = [
    { id: "p", provider: "KBC Autoverzekering", category: "insurance" as const, monthly: 58, quality: 4.4, source: "t", partner: true, note: "", switchEffort: "low" as const },
    { id: "n", provider: "Ethias", category: "insurance" as const, monthly: 55, quality: 4.1, source: "t", partner: false, note: "", switchEffort: "low" as const },
  ];
  assert.equal(bestAlternative(r, offers)!.offer.id, "n");
});
