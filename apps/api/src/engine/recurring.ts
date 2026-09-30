import { MERCHANT_BY_ID } from "../data/merchants.js";
import type { Cadence, CategorizedTransaction, MonthTotal, RecurringSpend } from "./types.js";

const round2 = (n: number) => Math.round(n * 100) / 100;
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

/** Months between two YYYY-MM-DD dates, fractional. */
export function monthsBetween(a: string, b: string): number {
  return daysBetween(a, b) / 30.4375;
}

function detectCadence(dates: string[]): Cadence {
  if (dates.length < 3) return "variable";
  const gaps: number[] = [];
  for (let i = 1; i < dates.length; i += 1) gaps.push(daysBetween(dates[i - 1], dates[i]));
  const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const sd = Math.sqrt(gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length);
  if (mean >= 26 && mean <= 35 && sd <= 4) return "monthly";
  if (mean >= 4 && mean <= 12) return "weekly";
  return "variable";
}

function totalsByMonth(txs: CategorizedTransaction[]): MonthTotal[] {
  const map = new Map<string, number>();
  for (const t of txs) map.set(monthKey(t.date), (map.get(monthKey(t.date)) ?? 0) + Math.abs(t.amount));
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total: round2(total) }));
}

/**
 * Build the recurring-spend profile: one row per merchant with ≥ 3 debits
 * in the window. Trend compares the last 3 full months with the first 3.
 */
export function detectRecurring(txs: CategorizedTransaction[], asOf: string, windowMonths = 14): RecurringSpend[] {
  const from = new Date(Date.parse(asOf) - windowMonths * 30.4375 * 86_400_000).toISOString().slice(0, 10);
  const byMerchant = new Map<string, CategorizedTransaction[]>();
  for (const t of txs) {
    if (t.amount >= 0 || !t.merchantId || t.date < from || t.date > asOf) continue;
    const list = byMerchant.get(t.merchantId) ?? [];
    list.push(t);
    byMerchant.set(t.merchantId, list);
  }

  const out: RecurringSpend[] = [];
  for (const [merchantId, list] of byMerchant) {
    if (list.length < 3) continue;
    const merchant = MERCHANT_BY_ID.get(merchantId)!;
    if (merchant.category === "income" || merchant.category === "other" || merchant.category === "leisure" || merchant.category === "fashion") continue;
    list.sort((a, b) => a.date.localeCompare(b.date));
    const dates = list.map((t) => t.date);
    const cadence = detectCadence(dates);
    const byMonth = totalsByMonth(list);
    // Exclude the (possibly partial) current month from the average.
    const complete = byMonth.filter((m) => m.month !== monthKey(asOf));
    const basis = complete.length ? complete : byMonth;
    const monthlyAvg = basis.reduce((s, m) => s + m.total, 0) / basis.length;
    let trendPct = 0;
    if (cadence === "monthly" && complete.length >= 6) {
      const first = complete.slice(0, 3).reduce((s, m) => s + m.total, 0) / 3;
      const last = complete.slice(-3).reduce((s, m) => s + m.total, 0) / 3;
      trendPct = round2(((last - first) / first) * 100);
    }
    out.push({
      merchantId,
      merchantName: merchant.name,
      category: merchant.category,
      cadence,
      monthlyAvg: round2(monthlyAvg),
      currentMonthly: cadence === "monthly" ? Math.abs(list[list.length - 1].amount) : round2(monthlyAvg),
      lastAmount: Math.abs(list[list.length - 1].amount),
      lastDate: dates[dates.length - 1],
      firstDate: dates[0],
      occurrences: list.length,
      monthsActive: round2(monthsBetween(dates[0], asOf)),
      trendPct,
      quality: merchant.quality,
      priceIndex: merchant.priceIndex,
      byMonth,
    });
  }
  return out.sort((a, b) => b.monthlyAvg - a.monthlyAvg);
}
