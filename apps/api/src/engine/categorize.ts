import { MERCHANTS } from "../data/merchants.js";
import type { CategorizedTransaction, Merchant, Transaction } from "./types.js";

/**
 * Rule-based merchant matching. In production this is where a trained
 * classifier (or KBC's existing categorisation) plugs in; the rest of the
 * engine only depends on the CategorizedTransaction shape.
 */
export function matchMerchant(tx: Transaction, merchants: Merchant[] = MERCHANTS): Merchant | null {
  const hay = `${tx.counterparty} ${tx.description}`.toLowerCase();
  for (const m of merchants) {
    if (m.patterns.some((p) => hay.includes(p))) return m;
  }
  return null;
}

export function categorize(transactions: Transaction[], merchants: Merchant[] = MERCHANTS): CategorizedTransaction[] {
  return transactions.map((tx) => {
    const m = matchMerchant(tx, merchants);
    if (m) return { ...tx, merchantId: m.id, merchantName: m.name, category: m.category };
    return { ...tx, merchantId: null, merchantName: tx.counterparty, category: tx.amount > 0 ? "income" : "other" };
  });
}
