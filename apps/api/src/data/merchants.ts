import type { Merchant } from "../engine/types.js";

/**
 * Merchant catalog. Quality scores are illustrative (0-5), modelled on
 * independent sources such as Test Aankoop / Trustpilot aggregates.
 */
export const MERCHANTS: Merchant[] = [
  // Energy
  { id: "engie", name: "Engie", category: "energy", patterns: ["engie", "electrabel"], quality: 4.1 },
  { id: "luminus", name: "Luminus", category: "energy", patterns: ["luminus"], quality: 4.0 },
  { id: "bolt", name: "Bolt Energie", category: "energy", patterns: ["bolt energie"], quality: 4.3 },
  // Telecom (internet + tv)
  { id: "telenet", name: "Telenet", category: "telecom", patterns: ["telenet"], quality: 4.0 },
  { id: "proximus-home", name: "Proximus (internet)", category: "telecom", patterns: ["proximus internet", "proximus flex"], quality: 4.2 },
  // Mobile
  { id: "proximus-mobile", name: "Proximus (mobiel)", category: "mobile", patterns: ["proximus mobile", "proximus gsm"], quality: 4.1 },
  { id: "orange", name: "Orange", category: "mobile", patterns: ["orange belgium", "orange mobile"], quality: 4.1 },
  { id: "mobile-vikings", name: "Mobile Vikings", category: "mobile", patterns: ["mobile vikings"], quality: 4.0 },
  // Streaming
  { id: "netflix", name: "Netflix", category: "streaming", patterns: ["netflix"], quality: 4.4 },
  { id: "disney", name: "Disney+", category: "streaming", patterns: ["disney"], quality: 4.1 },
  { id: "streamz", name: "Streamz", category: "streaming", patterns: ["streamz"], quality: 3.9 },
  { id: "spotify", name: "Spotify", category: "streaming", patterns: ["spotify"], quality: 4.5 },
  // Insurance
  { id: "ag", name: "AG Insurance (auto)", category: "insurance", patterns: ["ag insurance", "ag verzekeringen"], quality: 4.2 },
  { id: "kbc-verz", name: "KBC Verzekeringen", category: "insurance", patterns: ["kbc verzekeringen"], quality: 4.4 },
  // Groceries (basket price index, Delhaize = 1.00)
  { id: "delhaize", name: "Delhaize", category: "groceries", patterns: ["delhaize", "ad delhaize"], quality: 4.3, priceIndex: 1.0 },
  { id: "colruyt", name: "Colruyt", category: "groceries", patterns: ["colruyt"], quality: 4.2, priceIndex: 0.91 },
  { id: "albert-heijn", name: "Albert Heijn", category: "groceries", patterns: ["albert heijn"], quality: 4.1, priceIndex: 0.95 },
  { id: "lidl", name: "Lidl", category: "groceries", patterns: ["lidl"], quality: 3.8, priceIndex: 0.84 },
  // Fuel (price index, TotalEnergies = 1.00)
  { id: "total", name: "TotalEnergies", category: "fuel", patterns: ["totalenergies", "total station"], quality: 4.0, priceIndex: 1.0 },
  { id: "dats24", name: "DATS 24", category: "fuel", patterns: ["dats 24", "dats24"], quality: 3.9, priceIndex: 0.94 },
  { id: "gabriels", name: "Gabriëls", category: "fuel", patterns: ["gabriels", "gabriëls"], quality: 3.9, priceIndex: 0.95 },
  // Fashion / leisure / other (context only — no switch suggestions)
  { id: "zalando", name: "Zalando", category: "fashion", patterns: ["zalando"], quality: 4.2 },
  { id: "bol", name: "bol.com", category: "leisure", patterns: ["bol.com"], quality: 4.3 },
  { id: "delijn", name: "De Lijn", category: "other", patterns: ["de lijn"], quality: 3.5 },
  { id: "bakkerij", name: "Bakkerij Van Hoof", category: "other", patterns: ["bakkerij"], quality: 4.6 },
  { id: "restaurant", name: "Restaurants", category: "leisure", patterns: ["restaurant", "brasserie", "pizzeria"], quality: 4.0 },
  { id: "salary", name: "Loon", category: "income", patterns: ["loon", "salaris", "payroll"], quality: 0 },
];

export const MERCHANT_BY_ID = new Map(MERCHANTS.map((m) => [m.id, m]));
