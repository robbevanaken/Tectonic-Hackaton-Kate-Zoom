import type { Customer, Insight } from "./types.js";

export interface SavingEntry {
  id: string;
  /** YYYY-MM-DD the switch / refund happened. */
  date: string;
  label: string;
  /** Yearly saving for recurring switches, or the one-off amount. */
  amount: number;
  period: "year" | "once";
}

export type Platform = "kbc" | "bolero";

export interface InvestOption {
  label: string;
  /** Illustrative long-term expected yearly return. Not a promise; shown with a risk disclaimer. */
  expectedReturn: number;
  risk: string;
}

/**
 * Two ways to invest the savings, both inside the KBC group:
 * KBC (managed, by risk profile) or Bolero (self-directed, e.g. ETFs).
 */
export const PLATFORMS: Record<Platform, { label: string; tagline: string; options: Record<string, InvestOption> }> = {
  kbc: {
    label: "KBC",
    tagline: "KBC beheert je portefeuille volgens je profiel",
    options: {
      defensief: { label: "Defensief", expectedReturn: 0.03, risk: "Laag risico, vooral obligaties" },
      gebalanceerd: { label: "Gebalanceerd", expectedReturn: 0.05, risk: "Mix van aandelen en obligaties" },
      dynamisch: { label: "Dynamisch", expectedReturn: 0.07, risk: "Vooral aandelen, grotere schommelingen" },
    },
  },
  bolero: {
    label: "Bolero",
    tagline: "Je belegt zelf via Bolero, met lage kosten",
    options: {
      obligaties: { label: "Obligatie-ETF", expectedReturn: 0.03, risk: "Breed mandje obligaties, lage kosten" },
      mix: { label: "Mix-ETF", expectedReturn: 0.05, risk: "Aandelen en obligaties in één tracker" },
      wereld: { label: "Wereld-ETF", expectedReturn: 0.07, risk: "Duizenden aandelen wereldwijd, schommelt meer" },
    },
  },
};

export const optionFor = (platform: Platform, option: string): InvestOption | null => PLATFORMS[platform]?.options[option] ?? null;

export interface InvestPlan {
  platform: Platform;
  option: string;
  lump: number;
  monthly: number;
  years: number;
  startedAt: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** How much a saving has actually yielded by `asOf`. Recurring savings accrue per month since the switch. */
export function realizedToDate(entries: SavingEntry[], asOf: string): number {
  let total = 0;
  for (const e of entries) {
    if (e.date > asOf) continue;
    if (e.period === "once") total += e.amount;
    else {
      const [y1, m1, d1] = e.date.split("-").map(Number);
      const [y2, m2, d2] = asOf.split("-").map(Number);
      const months = (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
      total += (e.amount / 12) * months;
    }
  }
  return round2(total);
}

export const yearlyRunRate = (entries: SavingEntry[]) => round2(entries.filter((e) => e.period === "year").reduce((s, e) => s + e.amount, 0));

export function entryFromInsight(i: Insight, asOf: string, paused?: string[]): SavingEntry {
  const chosen = i.kind === "overlap" && i.services && paused ? i.services.filter((s) => paused.includes(s.name)) : [];
  if (chosen.length) {
    const amount = Math.round(chosen.reduce((sum, s) => sum + s.monthly, 0) * 12 * 100) / 100;
    return { id: i.id, date: asOf, label: `Gepauzeerd: ${chosen.map((s) => s.name).join(", ")}`, amount, period: "year" };
  }
  return { id: i.id, date: asOf, label: i.alternative ? `${i.current.name} → ${i.alternative.provider}` : i.title, amount: i.savingsYear, period: i.period };
}

export interface ProjectionPoint {
  year: number;
  invested: number;
  value: number;
}

/** Lump sum + monthly contribution, compounded monthly. Pure and deterministic. */
export function project(lump: number, monthly: number, annualReturn: number, years: number): ProjectionPoint[] {
  const r = annualReturn / 12;
  const points: ProjectionPoint[] = [{ year: 0, invested: round2(lump), value: round2(lump) }];
  let value = lump;
  let invested = lump;
  for (let m = 1; m <= years * 12; m += 1) {
    value = value * (1 + r) + monthly;
    invested += monthly;
    if (m % 12 === 0) points.push({ year: m / 12, invested: round2(invested), value: round2(value) });
  }
  return points;
}

export function savingsSummary(c: Customer, asOf: string) {
  return { realized: realizedToDate(c.savings, asOf), yearly: yearlyRunRate(c.savings), entries: [...c.savings].sort((a, b) => b.date.localeCompare(a.date)), plan: c.investPlan ?? null };
}
