import type { CategorizedTransaction, Moment } from "./types.js";

/** The last N days before payday: budgets are tight, so a saving tip is most welcome. */
export const SQUEEZE_DAYS = 5;

export interface BudgetCycle {
  /** Day of month the salary usually lands, or null when no salary is detected. */
  payday: number | null;
  daysToPayday: number | null;
  spentSincePayday: number;
  inSqueeze: boolean;
}

const DAY = 86_400_000;

function paydayDate(year: number, month: number, day: number): Date {
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, last)));
}

/**
 * The customer's own money rhythm, derived from salary credits.
 * Organic timing: soft tips wait for the end of *their* month, not the calendar's.
 */
export function budgetCycle(txs: CategorizedTransaction[], asOf: string): BudgetCycle {
  const salaries = txs.filter((t) => t.category === "income" && t.amount > 0 && t.date <= asOf).slice(-3);
  if (salaries.length === 0) return { payday: null, daysToPayday: null, spentSincePayday: 0, inSqueeze: false };
  const counts = new Map<number, number>();
  for (const s of salaries) {
    const d = Number(s.date.slice(8, 10));
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const payday = [...counts.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];

  const now = new Date(asOf);
  let next = paydayDate(now.getUTCFullYear(), now.getUTCMonth(), payday);
  if (next <= now) next = paydayDate(now.getUTCFullYear(), now.getUTCMonth() + 1, payday);
  const daysToPayday = Math.round((next.getTime() - now.getTime()) / DAY);

  const lastPayday = salaries[salaries.length - 1].date;
  const spentSincePayday = Math.round(txs.filter((t) => t.amount < 0 && t.date >= lastPayday && t.date <= asOf).reduce((s, t) => s - t.amount, 0));

  return { payday, daysToPayday, spentSincePayday, inSqueeze: daysToPayday >= 1 && daysToPayday <= SQUEEZE_DAYS };
}

export function squeezeMoment(c: BudgetCycle): Moment | null {
  if (!c.inSqueeze || c.daysToPayday === null) return null;
  const days = c.daysToPayday === 1 ? "Morgen komt je loon." : `Nog ${c.daysToPayday} dagen tot je loon.`;
  return { type: "budget_squeeze", weight: 0.25, reason: `${days} Deze maand al € ${c.spentSincePayday.toLocaleString("nl-BE")} uitgegeven.` };
}

