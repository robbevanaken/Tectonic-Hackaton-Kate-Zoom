import type { Customer, Transaction } from "../engine/types.js";

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
  frequent(b, addDays(start, 3), 12, "Brasserie De Kroon", "Kaartbetaling", 28, 74);
  frequent(b, addDays(start, 9), 25, "bol.com", "Online aankoop", 15, 90);
  frequent(b, addDays(start, 17), 40, "Zalando SE", "Online aankoop", 45, 160);
  frequent(b, addDays(start, 1), 6, "Bakkerij Van Hoof", "Kaartbetaling", 4, 14);
  frequent(b, addDays(start, 2), 9, "De Lijn", "Mobiel ticket", 2.5, 2.5);
}

function thomas(): Customer {
  const b: Builder = { tx: [], rand: rng(42), seq: 0 };
  const start = new Date("2025-08-01");
  monthly(b, start, 27, "Payroll Novatek NV", "Loon", () => -3240); // credit
  // Energy: price creep — 142 → 148 → 168 (+18% vs first months)
  monthly(b, start, 5, "Engie Electrabel", "Domiciliëring energie", (i) => (i < 5 ? 142 : i < 11 ? 148 : 168));
  // Telecom: started 28/10/2025 → ~11 months at AS_OF (contract window) and debited 2 days ago (post-debit)
  monthly(b, new Date("2025-10-28"), 28, "Telenet BV", "Domiciliëring internet + tv", () => 89);
  monthly(b, start, 15, "Proximus Mobile", "Domiciliëring gsm", () => 25);
  monthly(b, start, 12, "Netflix.com", "Abonnement", () => 13.99);
  monthly(b, start, 3, "Disney Plus", "Abonnement", () => 9.99);
  monthly(b, new Date("2026-02-01"), 20, "Streamz", "Abonnement", () => 12.99);
  // Insurance: started 1/11/2025 → annual renewal approaching
  monthly(b, new Date("2025-11-01"), 1, "AG Insurance", "Autoverzekering premie", () => 62);
  frequent(b, addDays(start, 2), 7, "Delhaize Gent", "Kaartbetaling", 88, 142);
  frequent(b, addDays(start, 4), 9, "TotalEnergies Station", "Brandstof", 58, 78);
  noise(b, start);
  b.tx.sort((x, y) => x.date.localeCompare(y.date));
  return { id: "c-thomas", name: "Janssens Thomas", firstName: "Thomas", consent: true, transactions: b.tx, feedback: [], notified: [] };
}

/** Lien already has good deals: Kate should mostly stay quiet. */
function lien(): Customer {
  const b: Builder = { tx: [], rand: rng(7), seq: 0 };
  const start = new Date("2025-08-01");
  monthly(b, start, 25, "Payroll Zorgpunt VZW", "Loon", () => -2410);
  monthly(b, start, 8, "Bolt Energie", "Domiciliëring energie", () => 96);
  monthly(b, start, 10, "Orange Belgium", "Domiciliëring gsm", () => 20);
  monthly(b, start, 14, "Spotify AB", "Abonnement", () => 10.99);
  monthly(b, start, 12, "Netflix.com", "Abonnement", () => 13.99);
  frequent(b, addDays(start, 5), 7, "Colruyt Merelbeke", "Kaartbetaling", 60, 110);
  frequent(b, addDays(start, 1), 14, "DATS 24", "Brandstof", 40, 60);
  noise(b, start);
  b.tx.sort((x, y) => x.date.localeCompare(y.date));
  return { id: "c-lien", name: "Vermeulen Lien", firstName: "Lien", consent: true, transactions: b.tx, feedback: [], notified: [] };
}

export const CUSTOMERS: Customer[] = [thomas(), lien()];
