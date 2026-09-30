import type { Offer } from "../engine/types.js";

/**
 * Market offers Kate compares against. In production this would be a
 * continuously refreshed feed (comparators, partner APIs, KBC product catalog).
 * Prices are illustrative for a 2-person household.
 */
export const OFFERS: Offer[] = [
  // Energy — monthly for ~3.500 kWh + 12.000 kWh gas
  { id: "o-bolt", provider: "Bolt Energie", category: "energy", monthly: 129, quality: 4.3, source: "Test Aankoop 09/2026", partner: false, partnerDeal: "KBC customer deal: €50 welcome discount on your first bill", note: "100% Belgian green electricity, variable rate", switchEffort: "low" },
  { id: "o-luminus", provider: "Luminus", category: "energy", monthly: 139, quality: 4.0, source: "Test Aankoop 09/2026", partner: false, note: "Fixed rate for 1 year", switchEffort: "low" },
  { id: "o-octa", provider: "Octa+", category: "energy", monthly: 131, quality: 3.7, source: "Test Aankoop 09/2026", partner: false, note: "Cheap, but lower customer score", switchEffort: "low" },
  { id: "o-engie", provider: "Engie", category: "energy", monthly: 149, quality: 4.1, source: "Test Aankoop 09/2026", partner: false, note: "New-customer rate (Easy Fixed)", switchEffort: "low" },
  // Telecom (internet + tv)
  { id: "o-orange-home", provider: "Orange Home", category: "telecom", monthly: 72, quality: 4.1, source: "Test Aankoop 08/2026", partner: false, note: "Internet + TV, same speed (1 Gbps)", switchEffort: "medium" },
  { id: "o-proximus-flex", provider: "Proximus Flex", category: "telecom", monthly: 79, quality: 4.2, source: "Test Aankoop 08/2026", partner: false, note: "Fibre where available", switchEffort: "medium" },
  { id: "o-scarlet", provider: "Scarlet", category: "telecom", monthly: 55, quality: 3.4, source: "Test Aankoop 08/2026", partner: false, note: "Budget brand, slower service", switchEffort: "medium" },
  // Mobile
  { id: "o-vikings", provider: "Mobile Vikings", category: "mobile", monthly: 15, quality: 4.0, source: "Test Aankoop 08/2026", partner: false, note: "20 GB, unlimited calls", switchEffort: "low" },
  { id: "o-hey", provider: "hey!", category: "mobile", monthly: 18, quality: 3.9, source: "Test Aankoop 08/2026", partner: false, note: "30 GB, Telenet network", switchEffort: "low" },
  { id: "o-orange-go", provider: "Orange Go", category: "mobile", monthly: 20, quality: 4.1, source: "Test Aankoop 08/2026", partner: false, note: "25 GB", switchEffort: "low" },
  // Insurance (car)
  { id: "o-kbc-auto", provider: "KBC Autoverzekering", category: "insurance", monthly: 54, quality: 4.4, source: "Test Aankoop 06/2026", partner: true, note: "Same cover (liability + comprehensive), bonus-malus carried over", switchEffort: "low" },
  { id: "o-ethias", provider: "Ethias", category: "insurance", monthly: 58, quality: 4.1, source: "Test Aankoop 06/2026", partner: false, note: "Liability + comprehensive", switchEffort: "medium" },
  // Groceries — price index vs Delhaize basket (Test Aankoop supermarktvergelijking)
  { id: "o-colruyt", provider: "Colruyt", category: "groceries", priceIndex: 0.91, quality: 4.2, source: "Test Aankoop supermarket index 2026", partner: false, note: "Same brands, lowest-price guarantee", switchEffort: "low" },
  { id: "o-ah", provider: "Albert Heijn", category: "groceries", priceIndex: 0.95, quality: 4.1, source: "Test Aankoop supermarket index 2026", partner: false, note: "Similar range", switchEffort: "low" },
  { id: "o-lidl", provider: "Lidl", category: "groceries", priceIndex: 0.84, quality: 3.8, source: "Test Aankoop supermarket index 2026", partner: false, note: "Mostly own brands", switchEffort: "low" },
  // Fuel — price index vs TotalEnergies
  { id: "o-dats", provider: "DATS 24", category: "fuel", priceIndex: 0.94, quality: 3.9, source: "Carbu.com average 09/2026", partner: false, note: "On average €0.10/l cheaper, 1.8 km from your usual station", switchEffort: "low" },
  { id: "o-gabriels", provider: "Gabriëls", category: "fuel", priceIndex: 0.95, quality: 3.9, source: "Carbu.com average 09/2026", partner: false, note: "On average €0.08/l cheaper", switchEffort: "low" },
];

/** Same-product prices (by EAN) from a price-comparison feed. Illustrative demo prices. */
export interface ProductOffer {
  id: string;
  ean: string;
  seller: string;
  price: number;
  /** Seller score 0-5. */
  quality: number;
  source: string;
  partnerDeal?: string;
  note: string;
}

export const PRODUCT_OFFERS: ProductOffer[] = [
  { id: "p-coolblue-xm5", ean: "4548736000017", seller: "Coolblue", price: 329, quality: 4.6, source: "Price comparison 30/09/2026", partnerDeal: "KBC customer deal: 2 years extra warranty", note: "Same model and colour, delivered tomorrow, 30-day return period" },
  { id: "p-bol-xm5", ean: "4548736000017", seller: "bol.com", price: 339, quality: 4.3, source: "Price comparison 30/09/2026", note: "Sold by bol.com itself" },
  { id: "p-market-xm5", ean: "4548736000017", seller: "GadgetDeals (marketplace)", price: 299, quality: 3.2, source: "Price comparison 30/09/2026", note: "Third-party seller, low score" },
];

export const OFFER_BY_ID = new Map(OFFERS.map((o) => [o.id, o]));
