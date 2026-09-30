import type { Moment, RecurringSpend } from "./types.js";
import { monthsBetween } from "./recurring.js";

const eur = (n: number) => `€${n.toFixed(0)}`;

/**
 * "The right moment" — the timing signals that make a nudge welcome instead
 * of noise. Each moment adds relevance; the notification policy prefers
 * insights with a strong moment over merely large savings.
 */
export function detectMoments(r: RecurringSpend, asOf: string, peers: RecurringSpend[]): Moment[] {
  const moments: Moment[] = [];

  // 1. Price creep: the same merchant quietly costs more than it used to.
  if (r.cadence === "monthly" && r.trendPct >= 8) {
    const first = r.byMonth[0]?.total ?? r.monthlyAvg;
    const risePct = ((r.lastAmount - first) / first) * 100;
    moments.push({
      type: "price_creep",
      weight: Math.min(0.5, r.trendPct / 40),
      reason: `${risePct.toFixed(0)}% duurder dan vorig jaar (${eur(first)} → ${eur(r.lastAmount)}).`,
    });
  }

  // 2. Contract window: ~1 year since the first debit → renewal / switch window.
  const months = monthsBetween(r.firstDate, asOf);
  if (r.cadence === "monthly" && months >= 10.5 && months <= 12.5) {
    const anniversary = new Date(Date.parse(r.firstDate));
    anniversary.setUTCFullYear(anniversary.getUTCFullYear() + 1);
    moments.push({
      type: "contract_window",
      weight: 0.35,
      reason: `Contract 1 jaar op ${anniversary.toLocaleDateString("nl-BE", { day: "numeric", month: "long" })}: kosteloos overstappen.`,
    });
  }

  // 3. Post-debit: the payment just left the account — the customer is looking at it now.
  const daysSinceDebit = Math.round((Date.parse(asOf) - Date.parse(r.lastDate)) / 86_400_000);
  if (r.cadence === "monthly" && daysSinceDebit <= 3) {
    moments.push({
      type: "post_debit",
      weight: 0.3,
      reason: daysSinceDebit === 0 ? `Vandaag ${eur(r.lastAmount)} afgeschreven.` : `${daysSinceDebit} dag${daysSinceDebit === 1 ? "" : "en"} geleden ${eur(r.lastAmount)} afgeschreven.`,
    });
  }

  // 4. Seasonal: energy before winter, insurance before the renewal month.
  const month = Number(asOf.slice(5, 7));
  if (r.category === "energy" && (month === 9 || month === 10)) {
    moments.push({ type: "seasonal", weight: 0.2, reason: "De winter komt: je duurste energiemaanden." });
  }

  // 5. Overlap: several subscriptions in the same category.
  const sameCategory = peers.filter((p) => p.category === r.category && p.cadence === "monthly");
  if (r.category === "streaming" && sameCategory.length >= 3) {
    const total = sameCategory.reduce((s, p) => s + p.currentMonthly, 0);
    moments.push({ type: "overlap", weight: 0.25, reason: `${sameCategory.length} streamingdiensten, samen ${eur(total)}/maand.` });
  }

  return moments;
}
