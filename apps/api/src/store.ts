import { createHash, timingSafeEqual } from "node:crypto";
import { CUSTOMERS } from "./data/customers.js";
import type { Customer } from "./engine/types.js";

/**
 * In-memory store for the demo. In production this is KBC's core banking
 * data behind the existing consent framework; the engine never needs raw
 * data outside this process.
 */
const customers = new Map<string, Customer>(CUSTOMERS.map((c) => [c.id, structuredClone(c)]));

/**
 * Demo logins only exist outside production (or when DEMO_MODE=true is set
 * explicitly). A production build without real auth wired in rejects everyone.
 */
export const demoMode = () => process.env.NODE_ENV !== "production" || process.env.DEMO_MODE === "true";

const DEMO_TOKENS: [string, string][] = [
  ["demo-thomas", "c-thomas"],
  ["demo-lien", "c-lien"],
];

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Constant-time token comparison (no early exit that leaks how much of a token matched). */
export function customerForToken(token: string): Customer | null {
  if (!demoMode() || token.length > 128) return null;
  const given = digest(token);
  let match: string | null = null;
  for (const [t, id] of DEMO_TOKENS) {
    if (timingSafeEqual(given, digest(t))) match = id;
  }
  return match ? customers.get(match) ?? null : null;
}

export function resetCustomer(id: string): Customer | null {
  const fresh = CUSTOMERS.find((c) => c.id === id);
  if (!fresh) return null;
  const clone = structuredClone(fresh);
  customers.set(id, clone);
  return clone;
}
