import { CUSTOMERS } from "./data/customers.js";
import type { Customer } from "./engine/types.js";

/**
 * In-memory store for the demo. In production this is KBC's core banking
 * data behind the existing consent framework; the engine never needs raw
 * data outside this process.
 */
const customers = new Map<string, Customer>(CUSTOMERS.map((c) => [c.id, structuredClone(c)]));

/** Demo bearer tokens → customer id. Never reuse these in production. */
const TOKENS: Record<string, string> = {
  "demo-thomas": "c-thomas",
  "demo-lien": "c-lien",
};

export function customerForToken(token: string): Customer | null {
  const id = TOKENS[token];
  return id ? customers.get(id) ?? null : null;
}

export function resetCustomer(id: string): Customer | null {
  const fresh = CUSTOMERS.find((c) => c.id === id);
  if (!fresh) return null;
  const clone = structuredClone(fresh);
  customers.set(id, clone);
  return clone;
}
