import type { Offer } from "../engine/types.js";

/**
 * Market offers Kate compares against. In production this would be a
 * continuously refreshed feed (comparators, partner APIs, KBC product catalog).
 * Prices are illustrative for a 2-person household.
 */
export const OFFERS: Offer[] = [
  // Energy — monthly for ~3.500 kWh + 12.000 kWh gas
  { id: "o-bolt", provider: "Bolt Energie", category: "energy", monthly: 129, quality: 4.3, source: "Test Aankoop 09/2026", partner: false, partnerDeal: "KBC-klantendeal: € 50 welkomstkorting op je eerste afrekening", note: "100% Belgische groene stroom, variabel tarief", switchEffort: "low" },
  { id: "o-luminus", provider: "Luminus", category: "energy", monthly: 139, quality: 4.0, source: "Test Aankoop 09/2026", partner: false, note: "Vast tarief 1 jaar", switchEffort: "low" },
  { id: "o-octa", provider: "Octa+", category: "energy", monthly: 131, quality: 3.7, source: "Test Aankoop 09/2026", partner: false, note: "Goedkoop, maar lagere klantscore", switchEffort: "low" },
  { id: "o-engie", provider: "Engie", category: "energy", monthly: 149, quality: 4.1, source: "Test Aankoop 09/2026", partner: false, note: "Nieuw-klantentarief (Easy Fixed)", switchEffort: "low" },
  // Telecom (internet + tv)
  { id: "o-orange-home", provider: "Orange Home", category: "telecom", monthly: 72, quality: 4.1, source: "Test Aankoop 08/2026", partner: false, note: "Internet + tv, zelfde snelheid (1 Gbps)", switchEffort: "medium" },
  { id: "o-proximus-flex", provider: "Proximus Flex", category: "telecom", monthly: 79, quality: 4.2, source: "Test Aankoop 08/2026", partner: false, note: "Fiber waar beschikbaar", switchEffort: "medium" },
  { id: "o-scarlet", provider: "Scarlet", category: "telecom", monthly: 55, quality: 3.4, source: "Test Aankoop 08/2026", partner: false, note: "Budgetmerk, tragere service", switchEffort: "medium" },
  // Mobile
  { id: "o-vikings", provider: "Mobile Vikings", category: "mobile", monthly: 15, quality: 4.0, source: "Test Aankoop 08/2026", partner: false, note: "20 GB, onbeperkt bellen", switchEffort: "low" },
  { id: "o-hey", provider: "hey!", category: "mobile", monthly: 18, quality: 3.9, source: "Test Aankoop 08/2026", partner: false, note: "30 GB, Telenet-netwerk", switchEffort: "low" },
  { id: "o-orange-go", provider: "Orange Go", category: "mobile", monthly: 20, quality: 4.1, source: "Test Aankoop 08/2026", partner: false, note: "25 GB", switchEffort: "low" },
  // Insurance (car)
  { id: "o-kbc-auto", provider: "KBC Autoverzekering", category: "insurance", monthly: 54, quality: 4.4, source: "Test Aankoop 06/2026", partner: true, note: "Zelfde dekking (BA + omnium), bonus-malus overgenomen", switchEffort: "low" },
  { id: "o-ethias", provider: "Ethias", category: "insurance", monthly: 58, quality: 4.1, source: "Test Aankoop 06/2026", partner: false, note: "BA + omnium", switchEffort: "medium" },
  // Groceries — price index vs Delhaize basket (Test Aankoop supermarktvergelijking)
  { id: "o-colruyt", provider: "Colruyt", category: "groceries", priceIndex: 0.91, quality: 4.2, source: "Test Aankoop supermarktindex 2026", partner: false, note: "Zelfde A-merken, laagsteprijsgarantie", switchEffort: "low" },
  { id: "o-ah", provider: "Albert Heijn", category: "groceries", priceIndex: 0.95, quality: 4.1, source: "Test Aankoop supermarktindex 2026", partner: false, note: "Vergelijkbaar assortiment", switchEffort: "low" },
  { id: "o-lidl", provider: "Lidl", category: "groceries", priceIndex: 0.84, quality: 3.8, source: "Test Aankoop supermarktindex 2026", partner: false, note: "Vooral huismerken", switchEffort: "low" },
  // Fuel — price index vs TotalEnergies
  { id: "o-dats", provider: "DATS 24", category: "fuel", priceIndex: 0.94, quality: 3.9, source: "Carbu.com gemiddelde 09/2026", partner: false, note: "Gem. €0,10/l goedkoper, 1,8 km van je vaste station", switchEffort: "low" },
  { id: "o-gabriels", provider: "Gabriëls", category: "fuel", priceIndex: 0.95, quality: 3.9, source: "Carbu.com gemiddelde 09/2026", partner: false, note: "Gem. €0,08/l goedkoper", switchEffort: "low" },
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
  { id: "p-coolblue-xm5", ean: "4548736000017", seller: "Coolblue", price: 329, quality: 4.6, source: "Prijsvergelijking 30/09/2026", partnerDeal: "KBC-klantendeal: 2 jaar extra garantie", note: "Zelfde model en kleur, morgen geleverd, 30 dagen bedenktijd" },
  { id: "p-bol-xm5", ean: "4548736000017", seller: "bol.com", price: 339, quality: 4.3, source: "Prijsvergelijking 30/09/2026", note: "Verkocht door bol.com zelf" },
  { id: "p-market-xm5", ean: "4548736000017", seller: "GadgetDeals (marktplaats)", price: 299, quality: 3.2, source: "Prijsvergelijking 30/09/2026", note: "Derde verkoper, lage score" },
];

export const OFFER_BY_ID = new Map(OFFERS.map((o) => [o.id, o]));
