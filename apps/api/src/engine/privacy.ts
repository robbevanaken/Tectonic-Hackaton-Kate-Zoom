import type { Customer } from "./types.js";
import { revokeHandoffsFor } from "./handoff.js";
import { analyze } from "./insights.js";

/**
 * GDPR art. 7(3) + 17: withdrawing consent erases everything Kate Zoom derived
 * or stored. Transactions are KBC's banking records (legal retention) and stay;
 * an investment plan is a separate KBC product and stays.
 */
export function eraseKateData(c: Customer): void {
  c.consent = false;
  c.feedback = [];
  c.notified = [];
  c.savings = [];
  revokeHandoffsFor(c.id);
}

/** GDPR art. 15 + 20: everything Kate Zoom holds about the customer, machine-readable. */
export function exportKateData(c: Customer, asOf: string) {
  const { insights, cycle } = c.consent ? analyze(c, asOf) : { insights: [], cycle: null };
  return {
    exportedAt: new Date().toISOString(),
    controller: "KBC Bank NV (demo)",
    purpose: "Kate Zoom: besparingstips op basis van je eigen uitgaven",
    legalBasis: "Toestemming (AVG art. 6.1.a), altijd intrekbaar",
    consent: c.consent,
    insights: insights.map(({ id, title, category, savingsYear, period, moments, status }) => ({ id, title, category, savingsYear, period, moments: moments.map((m) => m.type), status })),
    budgetCycle: cycle,
    feedback: c.feedback,
    notifications: c.notified,
    savings: c.savings,
    investPlan: c.investPlan ?? null,
  };
}
