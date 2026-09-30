import type { Customer, Receipt, Transaction } from "../engine/types.js";

/** Demo "today". The engine is pure w.r.t. this date so the demo is reproducible. */
export const AS_OF = "2026-09-30";

/** Deterministic PRNG (mulberry32) so synthetic data is identical on every run. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
const round2 = (n: number) => Math.round(n * 100) / 100;

interface Builder {
  tx: Transaction[];
  rand: () => number;
  seq: number;
}

function push(b: Builder, date: Date, amount: number, counterparty: string, description: string) {
  if (date > new Date(AS_OF)) return;
  b.seq += 1;
  b.tx.push({ id: `t${b.seq.toString().padStart(5, "0")}`, date: iso(date), amount: round2(amount), counterparty, description });
}

/** Monthly debit on a fixed day. `amountFor(monthIndex)` lets us model price creep. */
function monthly(b: Builder, start: Date, day: number, counterparty: string, description: string, amountFor: (i: number) => number) {
  let i = 0;
  for (let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), day)); d <= new Date(AS_OF); d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, day))) {
    if (d < start) continue;
    push(b, d, -amountFor(i), counterparty, description);
    i += 1;
  }
}

/** Roughly every `everyDays` days with jitter, amount in [min,max]. */
function frequent(b: Builder, start: Date, everyDays: number, counterparty: string, description: string, min: number, max: number) {
  let d = start;
  while (d <= new Date(AS_OF)) {
    push(b, d, -(min + b.rand() * (max - min)), counterparty, description);
    d = addDays(d, Math.max(1, Math.round(everyDays + (b.rand() - 0.5) * everyDays * 0.6)));
  }
}

function noise(b: Builder, start: Date) {
  // Restaurants, bol.com, Zalando, bakery, public transport
  frequent(b, addDays(start, 3), 12, "Brasserie De Kroon", "Card payment", 28, 74);
  frequent(b, addDays(start, 9), 25, "bol.com", "Online purchase", 15, 90);
  frequent(b, addDays(start, 17), 40, "Zalando SE", "Online purchase", 45, 160);
  frequent(b, addDays(start, 1), 6, "Bakkerij Van Hoof", "Card payment", 4, 14);
  frequent(b, addDays(start, 2), 9, "De Lijn", "Mobile ticket", 2.5, 2.5);
}

function thomas(): Customer {
  const b: Builder = { tx: [], rand: rng(42), seq: 0 };
  const start = new Date("2025-08-01");
  monthly(b, start, 1, "Payroll Novatek NV", "Salary", () => -3240); // credit
  // Energy: price creep — 142 → 148 → 168 (+18% vs first months)
  monthly(b, start, 5, "Engie Electrabel", "Direct debit energy", (i) => (i < 5 ? 142 : i < 11 ? 148 : 168));
  // Telecom: started 28/10/2025 → ~11 months at AS_OF (contract window) and debited 2 days ago (post-debit)
  monthly(b, new Date("2025-10-28"), 28, "Telenet BV", "Direct debit internet + TV", () => 89);
  monthly(b, start, 15, "Proximus Mobile", "Direct debit mobile", () => 25);
  monthly(b, start, 12, "Netflix.com", "Subscription", () => 13.99);
  monthly(b, start, 3, "Disney Plus", "Subscription", () => 9.99);
  monthly(b, new Date("2026-02-01"), 20, "Streamz", "Subscription", () => 12.99);
  // Insurance: started 1/11/2025 → annual renewal approaching
  monthly(b, new Date("2025-11-01"), 1, "AG Insurance", "Car insurance premium", () => 62);
  frequent(b, addDays(start, 2), 7, "Delhaize Gent", "Card payment", 88, 142);
  frequent(b, addDays(start, 4), 9, "TotalEnergies Station", "Fuel", 58, 78);
  noise(b, start);
  // A physical one-off purchase with a digital receipt (e-ticket via Kate Wallet).
  push(b, new Date("2026-09-21"), -399, "MediaMarkt Gent", "Card payment");
  const tvTx = b.tx[b.tx.length - 1];
  const receipts: Receipt[] = [
    { transactionId: tvTx.id, merchantId: "mediamarkt", product: "Sony WH-1000XM5 headphones (black)", ean: "4548736000017", price: 399, date: tvTx.date, returnDays: 30 },
  ];
  b.tx.sort((x, y) => x.date.localeCompare(y.date));
  return {
    id: "c-thomas",
    name: "Janssens Thomas",
    firstName: "Thomas",
    consent: true,
    // Entirely fictional demo identity.
    profile: { email: "thomas.janssens@example.be", phone: "+32 470 00 12 34", street: "Voorbeeldstraat 12", postcode: "9000", city: "Gent", birthDate: "1991-04-12", energyEan: "541448800000123456", easySwitchId: "ES-4821-7730", licensePlate: "1-ABC-123", bonusMalus: 3 },
    transactions: b.tx,
    receipts,
    // Fictional history: two tips Thomas already acted on earlier this year.
    savings: [
      { id: "hist-gym", date: "2026-02-01", label: "Fitness Plus → SportCity (same gyms)", amount: 96, period: "year" },
      { id: "hist-laptop", date: "2026-06-14", label: "Laptop: price difference refunded", amount: 45, period: "once" },
      { id: "hist-home", date: "2026-04-01", label: "Home insurance → KBC Home Insurance", amount: 72, period: "year" },
    ],
    feedback: [],
    notified: [],
  };
}

/** Lien already has good deals: Kate should mostly stay quiet. */
function lien(): Customer {
  const b: Builder = { tx: [], rand: rng(7), seq: 0 };
  const start = new Date("2025-08-01");
  monthly(b, start, 25, "Payroll Zorgpunt VZW", "Salary", () => -2410);
  monthly(b, start, 8, "Bolt Energie", "Direct debit energy", () => 96);
  monthly(b, start, 10, "Orange Belgium", "Direct debit mobile", () => 20);
  monthly(b, start, 14, "Spotify AB", "Subscription", () => 10.99);
  monthly(b, start, 12, "Netflix.com", "Subscription", () => 13.99);
  frequent(b, addDays(start, 5), 7, "Colruyt Merelbeke", "Card payment", 60, 110);
  frequent(b, addDays(start, 1), 14, "DATS 24", "Fuel", 40, 60);
  noise(b, start);
  b.tx.sort((x, y) => x.date.localeCompare(y.date));
  return {
    id: "c-lien",
    name: "Vermeulen Lien",
    firstName: "Lien",
    consent: true,
    profile: { email: "lien.vermeulen@example.be", phone: "+32 470 00 56 78", street: "Proefdreef 3", postcode: "9820", city: "Merelbeke", birthDate: "1994-11-02", energyEan: "541448800000987654", easySwitchId: "ES-1093-5521" },
    transactions: b.tx,
    receipts: [],
    savings: [{ id: "hist-energy", date: "2025-11-01", label: "Engie → Bolt Energie", amount: 380, period: "year" }],
    feedback: [],
    notified: [],
  };
}

export const CUSTOMERS: Customer[] = [thomas(), lien()];
