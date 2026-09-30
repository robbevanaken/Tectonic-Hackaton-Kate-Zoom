import type { Customer, Feedback, Insight, InsightStatus, Moment, RecurringSpend } from "./types.js";
import { categorize } from "./categorize.js";
import { detectRecurring } from "./recurring.js";
import { detectMoments } from "./moments.js";
import { bestAlternative } from "./match.js";
import { explainTemplate } from "./explain.js";
import { purchaseMatches } from "./purchases.js";
import { budgetCycle, squeezeMoment, type BudgetCycle } from "./budget.js";
import { MERCHANT_BY_ID } from "../data/merchants.js";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Below this yearly saving Kate doesn't bother the customer with a push. */
export const MIN_SAVINGS_YEAR_FOR_PUSH = 50;
/** Never more than one push per customer per week. */
export const PUSH_COOLDOWN_DAYS = 7;

const CONFIDENCE: Record<string, number> = {
  energy: 0.9,
  telecom: 0.9,
  mobile: 0.85,
  insurance: 0.75, // coverage details differ
  groceries: 0.6, // basket composition is an estimate
  fuel: 0.65,
  streaming: 0.7,
  electronics: 0.95, // exact same EAN
};

function relevance(savingsYear: number, confidence: number, moments: Moment[]): number {
  const base = Math.min(1, savingsYear / 500); // €500/yr saturates the money component
  const timing = moments.reduce((s, m) => s + m.weight, 0);
  return round2(base * confidence * (1 + timing));
}

function whyNow(moments: Moment[]): string {
  if (moments.length === 0) return "Goedkoper, zelfde kwaliteit.";
  return [...moments].sort((a, b) => b.weight - a.weight)[0].reason;
}

function statusFor(id: string, feedback: Feedback[], asOf: string): InsightStatus {
  const f = [...feedback].reverse().find((x) => x.insightId === id);
  if (!f) return "new";
  if (f.action === "accept") return "accepted";
  if (f.action === "dismiss") return "dismissed";
  if (f.action === "snooze") return f.until && f.until > asOf ? "snoozed" : "new";
  return "new";
}

function switchInsight(r: RecurringSpend, asOf: string, all: RecurringSpend[], feedback: Feedback[]): Insight | null {
  const match = bestAlternative(r);
  const moments = detectMoments(r, asOf, all);
  const creepOnly = !match && moments.some((m) => m.type === "price_creep");
  if (!match && !creepOnly) return null;

  const savingsMonth = match ? match.savingsMonth : 0;
  const savingsYear = round2(savingsMonth * 12);
  const confidence = CONFIDENCE[r.category] ?? 0.5;
  const id = `${r.merchantId}-${match ? match.offer.id : "creep"}`;
  const insight: Insight = {
    id,
    kind: match ? "switch" : "creep",
    category: r.category,
    title: match ? `${r.merchantName} → ${match.offer.provider}` : `${r.merchantName} wordt duurder`,
    current: { name: r.merchantName, monthly: r.currentMonthly, quality: r.quality },
    alternative: match
      ? { offerId: match.offer.id, provider: match.offer.provider, monthly: match.monthly, quality: match.offer.quality, source: match.offer.source, partner: match.offer.partner, partnerDeal: match.offer.partnerDeal, note: match.offer.note, switchEffort: match.offer.switchEffort }
      : undefined,
    savingsMonth,
    savingsYear,
    period: "year",
    confidence,
    moments,
    relevance: relevance(savingsYear, confidence, moments),
    whyNow: whyNow(moments),
    explanation: "",
    explanationSource: "template",
    dataPoints: r.occurrences,
    byMonth: r.byMonth,
    status: statusFor(id, feedback, asOf),
  };
  insight.explanation = explainTemplate(insight);
  return insight;
}

function overlapInsight(all: RecurringSpend[], asOf: string, feedback: Feedback[]): Insight | null {
  const streaming = all.filter((r) => r.category === "streaming" && r.cadence === "monthly");
  if (streaming.length < 3) return null;
  const cheapest = [...streaming].sort((a, b) => a.currentMonthly - b.currentMonthly)[0];
  const total = round2(streaming.reduce((s, r) => s + r.currentMonthly, 0));
  const moments = detectMoments(cheapest, asOf, all).filter((m) => m.type === "overlap");
  const savingsMonth = cheapest.currentMonthly;
  const savingsYear = round2(savingsMonth * 12);
  const id = `overlap-streaming`;
  const insight: Insight = {
    id,
    kind: "overlap",
    category: "streaming",
    title: `${streaming.length} streamingdiensten`,
    current: { name: streaming.map((s) => s.merchantName).join(", "), monthly: total, quality: 0 },
    savingsMonth,
    savingsYear,
    period: "year",
    confidence: CONFIDENCE.streaming,
    moments,
    relevance: relevance(savingsYear, CONFIDENCE.streaming, moments),
    whyNow: whyNow(moments),
    explanation: "",
    explanationSource: "template",
    dataPoints: streaming.reduce((s, r) => s + r.occurrences, 0),
    byMonth: [],
    status: statusFor(id, feedback, asOf),
  };
  insight.explanation = explainTemplate(insight);
  return insight;
}

export interface Analysis {
  recurring: RecurringSpend[];
  insights: Insight[];
  cycle: BudgetCycle;
}

/** Moments that are time-bound: the chance is gone if we wait. These may push any day. */
export const URGENT_MOMENTS = new Set(["contract_window", "post_debit", "return_window"]);

/** Full pipeline for one customer. Pure: same input + asOf → same output. */
export function analyze(customer: Customer, asOf: string): Analysis {
  const txs = categorize(customer.transactions);
  const recurring = detectRecurring(txs, asOf);
  const insights: Insight[] = [];
  for (const r of recurring) {
    const i = switchInsight(r, asOf, recurring, customer.feedback);
    if (i) insights.push(i);
  }
  const overlap = overlapInsight(recurring, asOf, customer.feedback);
  if (overlap) insights.push(overlap);
  for (const m of purchaseMatches(customer, asOf)) {
    const id = `purchase-${m.receipt.ean}-${m.offer.id}`;
    const shop = MERCHANT_BY_ID.get(m.receipt.merchantId)?.name ?? "Winkel";
    const confidence = CONFIDENCE.electronics;
    const insight: Insight = {
      id,
      kind: "purchase",
      category: "electronics",
      title: m.receipt.product.split(" (")[0],
      product: m.receipt.product,
      current: { name: shop, monthly: m.receipt.price, quality: MERCHANT_BY_ID.get(m.receipt.merchantId)?.quality ?? 0 },
      alternative: { offerId: m.offer.id, provider: m.offer.seller, monthly: m.offer.price, quality: m.offer.quality, source: m.offer.source, partner: false, partnerDeal: m.offer.partnerDeal, note: m.offer.note, switchEffort: "low" },
      savingsMonth: 0,
      savingsYear: m.saving,
      period: "once",
      confidence,
      moments: m.moments,
      relevance: relevance(m.saving, confidence, m.moments),
      whyNow: m.moments[0].reason,
      explanation: "",
      explanationSource: "template",
      dataPoints: 1,
      byMonth: [],
      status: statusFor(id, customer.feedback, asOf),
    };
    insight.explanation = explainTemplate(insight);
    insights.push(insight);
  }
  // Organic timing: in the last days before payday every tip gets the budget moment.
  const cycle = budgetCycle(txs, asOf);
  const squeeze = squeezeMoment(cycle);
  if (squeeze) {
    for (const i of insights) {
      i.moments.push(squeeze);
      i.relevance = relevance(i.savingsYear, i.confidence, i.moments);
      i.whyNow = whyNow(i.moments);
      i.explanation = explainTemplate(i);
    }
  }
  insights.sort((a, b) => b.relevance - a.relevance);
  return { recurring, insights, cycle };
}

export interface NotificationDecision {
  insight: Insight | null;
  reason: string;
}

/**
 * Notification policy — the "exactly the right moment" part:
 *  - only insights the customer hasn't snoozed/dismissed/accepted
 *  - only when the saving is worth an interruption
 *  - only with a live timing moment (no moment → no push, the tip waits in the module)
 *  - organic delivery: urgent moments (contract window, just debited, return window) push any day;
 *    soft ones (price creep, season, overlap) wait for the customer's own end of month (payday − 5 days)
 *  - at most one push per week, never the same insight twice
 */
export function pickNotification(insights: Insight[], customer: Customer, asOf: string, cycle: BudgetCycle = budgetCycle(categorize(customer.transactions), asOf)): NotificationDecision {
  const last = customer.notified[customer.notified.length - 1];
  if (last) {
    const days = (Date.parse(asOf) - Date.parse(last.at)) / 86_400_000;
    if (days < PUSH_COOLDOWN_DAYS) return { insight: null, reason: `Deze week al een melding gestuurd.` };
  }
  const alreadySent = new Set(customer.notified.map((n) => n.insightId));
  const eligible = insights.filter((i) => i.status === "new" && i.savingsYear >= MIN_SAVINGS_YEAR_FOR_PUSH && !alreadySent.has(i.id));
  if (eligible.length === 0) return { insight: null, reason: "Geen melding nodig." };
  // No moment, no push: tips without a timing signal wait in the module until one appears
  // (a debit, a contract date, a price change) — that is what "the right moment" means.
  const withMoment = eligible.filter((i) => i.moments.length > 0);
  if (withMoment.length === 0) return { insight: null, reason: "Tip wacht op een goed moment." };
  const urgent = (i: Insight) => i.moments.some((m) => URGENT_MOMENTS.has(m.type));
  const pool = cycle.inSqueeze ? withMoment : withMoment.filter(urgent);
  if (pool.length === 0) {
    const wait = cycle.daysToPayday !== null ? ` over ${Math.max(0, cycle.daysToPayday - 5)} dagen` : " eind van de maand";
    return { insight: null, reason: `Stil. Volgende melding${wait}.` };
  }
  pool.sort((a, b) => b.relevance - a.relevance);
  const pick = pool[0];
  const why = cycle.inSqueeze && !urgent(pick) ? `Eind van je maand. ${pick.moments.find((m) => m.type === "budget_squeeze")!.reason}` : `Dringend. ${pick.moments.filter((m) => URGENT_MOMENTS.has(m.type))[0]?.reason ?? pick.whyNow}`;
  return { insight: pick, reason: why };
}
