import { OFFERS } from "../data/offers.js";
import type { Offer, RecurringSpend } from "./types.js";

/** An alternative may be at most this much lower in quality than what the customer has today. */
export const QUALITY_TOLERANCE = 0.3;

export interface Match {
  offer: Offer;
  /** Estimated monthly cost with the alternative. */
  monthly: number;
  savingsMonth: number;
}

/**
 * Find the best cheaper alternative of comparable quality. "Cheaper but
 * worse" never qualifies — that is the difference between a tip and spam.
 * Partner (KBC) offers get no boost; they compete on price and quality only.
 */
export function bestAlternative(r: RecurringSpend, offers: Offer[] = OFFERS): Match | null {
  const candidates = offers
    .filter((o) => o.category === r.category)
    .filter((o) => o.quality >= r.quality - QUALITY_TOLERANCE)
    .map((o) => {
      const monthly = o.monthly ?? (o.priceIndex !== undefined && r.priceIndex ? (r.currentMonthly * o.priceIndex) / r.priceIndex : null);
      if (monthly === null) return null;
      return { offer: o, monthly: Math.round(monthly * 100) / 100, savingsMonth: Math.round((r.currentMonthly - monthly) * 100) / 100 };
    })
    .filter((m): m is Match => m !== null && m.savingsMonth > 0)
    // Don't suggest "switching" to the provider the customer already has.
    .filter((m) => m.offer.provider.toLowerCase().split(" ")[0] !== r.merchantName.toLowerCase().split(" ")[0]);
  candidates.sort((a, b) => b.savingsMonth - a.savingsMonth);
  return candidates[0] ?? null;
}
