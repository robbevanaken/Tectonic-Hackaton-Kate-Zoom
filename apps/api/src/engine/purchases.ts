import { PRODUCT_OFFERS, type ProductOffer } from "../data/offers.js";
import { MERCHANT_BY_ID } from "../data/merchants.js";
import type { Customer, Moment, Receipt } from "./types.js";

/** Only sellers with at least this score qualify — a cheaper marketplace seller with bad reviews is not a tip. */
export const MIN_SELLER_QUALITY = 4.0;
/** Ignore differences too small to be worth a return trip. */
export const MIN_PURCHASE_SAVING = 20;

export interface PurchaseMatch {
  receipt: Receipt;
  offer: ProductOffer;
  saving: number;
  daysLeft: number;
  moments: Moment[];
}

const DAY = 86_400_000;

/**
 * Physical purchases: same EAN cheaper at a reputable seller while the
 * customer can still return the item. The moment is the return window.
 */
export function purchaseMatches(customer: Customer, asOf: string, offers: ProductOffer[] = PRODUCT_OFFERS): PurchaseMatch[] {
  const out: PurchaseMatch[] = [];
  for (const r of customer.receipts) {
    const daysSince = Math.round((Date.parse(asOf) - Date.parse(r.date)) / DAY);
    const daysLeft = r.returnDays - daysSince;
    if (daysSince < 0 || daysLeft <= 0) continue;
    const best = offers
      .filter((o) => o.ean === r.ean && o.quality >= MIN_SELLER_QUALITY && r.price - o.price >= MIN_PURCHASE_SAVING)
      .sort((a, b) => a.price - b.price)[0];
    if (!best) continue;
    const saving = Math.round((r.price - best.price) * 100) / 100;
    const shop = MERCHANT_BY_ID.get(r.merchantId)?.name ?? "de winkel";
    out.push({
      receipt: r,
      offer: best,
      saving,
      daysLeft,
      moments: [
        { type: "return_window", weight: daysLeft <= 10 ? 0.5 : 0.3, reason: `Je kocht dit ${daysSince} dagen geleden bij ${shop}; je retourtermijn loopt nog ${daysLeft} dagen.` },
        { type: "price_drop", weight: 0.2, reason: `Hetzelfde toestel (zelfde EAN) kost nu € ${saving.toFixed(0)} minder bij ${best.seller}.` },
      ],
    });
  }
  return out;
}
