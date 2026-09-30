import { test } from "node:test";
import assert from "node:assert/strict";
import { CUSTOMERS, AS_OF } from "../data/customers.js";
import { categorize } from "./categorize.js";
import { detectRecurring } from "./recurring.js";
import { bestAlternative, QUALITY_TOLERANCE } from "./match.js";
import { analyze, pickNotification, PUSH_COOLDOWN_DAYS } from "./insights.js";
import type { RecurringSpend } from "./types.js";
import { purchaseMatches, MIN_SELLER_QUALITY } from "./purchases.js";
import { createHandoff, redeemHandoff, previewHandoff, HANDOFF_TTL_MS } from "./handoff.js";

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

test("physical purchase: same EAN cheaper at a reputable seller, only within the return window", () => {
  const [m] = purchaseMatches(thomas, AS_OF);
  assert.ok(m, "expected a purchase tip for the headphones");
  assert.equal(m.offer.seller, "Coolblue"); // the €299 marketplace seller has score 3.2 → excluded
  assert.ok(m.offer.quality >= MIN_SELLER_QUALITY);
  assert.equal(m.saving, 70);
  assert.ok(m.moments.some((x) => x.type === "return_window"));
  assert.equal(purchaseMatches(thomas, "2026-10-25").length, 0, "no tip after the return window closed");
  const insight = analyze(thomas, AS_OF).insights.find((i) => i.kind === "purchase")!;
  assert.equal(insight.period, "once");
});

test("handoff: required fields enforced, only approved fields shared, single use, expires", () => {
  const energy = analyze(thomas, AS_OF).insights.find((i) => i.category === "energy")!;
  const preview = previewHandoff(thomas, energy)!;
  assert.ok(preview.fields.some((f) => f.key === "ean"));
  assert.ok(!preview.fields.some((f) => /iban|saldo|transact/i.test(f.label)), "never financial data");

  assert.deepEqual(createHandoff(thomas, energy, ["name"]), { error: "required_fields_missing" });

  const required = preview.fields.filter((f) => f.required).map((f) => f.key);
  const h = createHandoff(thomas, energy, required);
  assert.ok(!("error" in h));
  if ("error" in h) return;
  assert.ok(!h.fields.some((f) => f.key === "phone"), "optional field not approved → not shared");
  assert.ok(redeemHandoff(h.token));
  assert.equal(redeemHandoff(h.token), null, "single use");

  const h2 = createHandoff(thomas, energy, required, 0);
  if ("error" in h2) throw new Error("unexpected");
  assert.equal(redeemHandoff(h2.token, HANDOFF_TTL_MS + 1), null, "expired");
});

test("savings ledger: recurring savings accrue per month, one-offs count once", async () => {
  const { realizedToDate, yearlyRunRate, project } = await import("./savings.js");
  const entries = [
    { id: "a", date: "2026-01-01", label: "", amount: 120, period: "year" as const },
    { id: "b", date: "2026-06-01", label: "", amount: 45, period: "once" as const },
    { id: "c", date: "2026-12-01", label: "", amount: 999, period: "once" as const }, // future → ignored
  ];
  assert.equal(realizedToDate(entries, "2026-07-01"), 60 + 45);
  assert.equal(yearlyRunRate(entries), 120);
  const pts = project(1000, 100, 0.05, 10);
  assert.equal(pts.length, 11);
  assert.equal(pts[10].invested, 13000);
  assert.ok(pts[10].value > pts[10].invested, "positive return grows the pot");
  assert.equal(project(1000, 0, 0, 5)[5].value, 1000);
});

test("organic timing: payday detected, soft tips wait for the end of the customer's month", async () => {
  const { budgetCycle } = await import("./budget.js");
  const txs = categorize(thomas.transactions);
  const endOfMonth = budgetCycle(txs, "2026-09-30");
  assert.equal(endOfMonth.payday, 1);
  assert.equal(endOfMonth.daysToPayday, 1);
  assert.ok(endOfMonth.inSqueeze);
  assert.ok(endOfMonth.spentSincePayday > 0);

  // 30 Sept: end of month → the energy tip (soft moments only) is pushed, with the budget moment.
  const sep30 = pickNotification(analyze(thomas, "2026-09-30").insights, thomas, "2026-09-30");
  assert.equal(sep30.insight?.category, "energy");
  assert.ok(sep30.insight!.moments.some((m) => m.type === "budget_squeeze"));
  assert.match(sep30.reason, /Eind van je maand/);

  // 10 Sept: mid-month, nothing urgent → stay quiet even though tips exist.
  const sep10 = analyze(thomas, "2026-09-10");
  assert.ok(sep10.insights.length > 0);
  assert.equal(pickNotification(sep10.insights, thomas, "2026-09-10").insight, null);

  // 15 Sept: mid-month but the Telenet contract window is open → urgent tips may push any day.
  const sep15 = pickNotification(analyze(thomas, "2026-09-15").insights, thomas, "2026-09-15");
  assert.ok(sep15.insight);
  assert.ok(sep15.insight!.moments.some((m) => m.type === "contract_window"));
  assert.match(sep15.reason, /^Dringend/);
});

test("investing: KBC profiles and Bolero options, unknown options rejected", async () => {
  const { optionFor, PLATFORMS } = await import("./savings.js");
  assert.ok(optionFor("kbc", "gebalanceerd"));
  assert.ok(optionFor("bolero", "wereld"));
  assert.equal(optionFor("bolero", "gebalanceerd"), null);
  assert.equal(Object.keys(PLATFORMS.bolero.options).length, 3);
});

test("privacy: withdrawing consent erases Kate data and revokes open handoff links", async () => {
  const { eraseKateData, exportKateData } = await import("./privacy.js");
  const c = structuredClone(thomas);
  const energy = analyze(c, AS_OF).insights.find((i) => i.category === "energy")!;
  const required = previewHandoff(c, energy)!.fields.filter((f) => f.required).map((f) => f.key);
  const h = createHandoff(c, energy, required);
  if ("error" in h) throw new Error("unexpected");
  c.feedback.push({ insightId: energy.id, action: "snooze", at: AS_OF });

  const before = exportKateData(c, AS_OF);
  assert.ok(before.insights.length > 0 && before.savings.length > 0);

  eraseKateData(c);
  assert.equal(c.consent, false);
  assert.deepEqual([c.feedback, c.notified, c.savings], [[], [], []]);
  assert.equal(redeemHandoff(h.token), null, "open link revoked");
  assert.equal(exportKateData(c, AS_OF).insights.length, 0);
  assert.ok(c.transactions.length > 0, "bank records are not Kate's to delete");
});

test("auth: demo tokens work in dev, never in production", async () => {
  const { customerForToken } = await import("../store.js");
  assert.equal(customerForToken("demo-thomas")?.id, "c-thomas");
  assert.equal(customerForToken("demo-thomas-x"), null);
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    assert.equal(customerForToken("demo-thomas"), null);
  } finally {
    process.env.NODE_ENV = prev;
  }
});

test("streaming overlap: lists services; pausing a chosen set books that saving", async () => {
  const { entryFromInsight } = await import("./savings.js");
  const overlap = analyze(thomas, AS_OF).insights.find((i) => i.kind === "overlap")!;
  assert.deepEqual(overlap.services!.map((s) => s.name), ["Netflix", "Streamz", "Disney+"]);
  const e = entryFromInsight(overlap, AS_OF, ["Streamz", "Disney+"]);
  assert.equal(e.amount, Math.round((12.99 + 9.99) * 12 * 100) / 100);
  assert.match(e.label, /Streamz, Disney\+/);
  assert.equal(entryFromInsight(overlap, AS_OF, ["Onbekend"]).amount, overlap.savingsYear, "unknown names fall back to the suggestion");
});
