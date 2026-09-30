import { randomBytes } from "node:crypto";
import type { Customer, Insight } from "./types.js";

export interface HandoffField {
  key: string;
  label: string;
  value: string;
  /** Required by the provider to start the switch. Optional fields can be unticked. */
  required: boolean;
}

export interface HandoffPreview {
  provider: string;
  purpose: string;
  fields: HandoffField[];
}

export interface Handoff {
  token: string;
  provider: string;
  purpose: string;
  insightId: string;
  customerId: string;
  fields: HandoffField[];
  expiresAt: number;
  used: boolean;
}

export const HANDOFF_TTL_MS = 10 * 60_000;
const handoffs = new Map<string, Handoff>();

const CURRENT_LABEL: Record<string, string> = {
  energy: "Current supplier",
  telecom: "Current operator",
  mobile: "Current operator",
  insurance: "Current insurer",
};

/**
 * What Kate would prefill, per category. Data minimisation: only fields the
 * provider needs for this specific switch — never transactions, balances or
 * spending data.
 */
export function previewHandoff(customer: Customer, insight: Insight): HandoffPreview | null {
  const a = insight.alternative;
  if (!a) return null;
  const p = customer.profile;
  const f = (key: string, label: string, value: string | number | undefined, required = true): HandoffField | null =>
    value === undefined || value === "" ? null : { key, label, value: String(value), required };
  const base = [
    f("name", "Name", customer.name.split(" ").reverse().join(" ")),
    f("email", "E-mail", p.email),
    f("phone", "Mobile", p.phone, false),
    f("address", "Address", `${p.street}, ${p.postcode} ${p.city}`),
  ];
  let extra: (HandoffField | null)[] = [];
  let purpose = `Switch to ${a.provider}`;
  switch (insight.category) {
    case "energy":
      extra = [f("ean", "EAN connection code", p.energyEan), f("current", CURRENT_LABEL.energy, insight.current.name), f("start", "Preferred start date", "As soon as possible", false)];
      break;
    case "telecom":
      extra = [f("easyswitch", "Easy Switch-ID", p.easySwitchId), f("current", CURRENT_LABEL.telecom, insight.current.name)];
      break;
    case "mobile":
      extra = [f("number", "Number to transfer", p.phone), f("current", CURRENT_LABEL.mobile, insight.current.name)];
      break;
    case "insurance":
      extra = [f("birth", "Date of birth", p.birthDate), f("plate", "Licence plate", p.licensePlate), f("bonusmalus", "Bonus-malus", p.bonusMalus), f("current", CURRENT_LABEL.insurance, insight.current.name)];
      break;
    case "electronics":
      purpose = `Order at ${a.provider}`;
      extra = [f("product", "Product", insight.product)];
      break;
    case "groceries":
    case "fuel":
      purpose = `Loyalty card at ${a.provider}`;
      return { provider: a.provider, purpose, fields: [base[0], base[1], f("postcode", "Postcode", p.postcode)].filter((x): x is HandoffField => x !== null) };
    default:
      return null;
  }
  return { provider: a.provider, purpose, fields: [...base, ...extra].filter((x): x is HandoffField => x !== null) };
}

/** Create a single-use token carrying only the fields the customer approved. Required fields cannot be dropped. */
export function createHandoff(customer: Customer, insight: Insight, approvedKeys: string[], now = Date.now()): Handoff | { error: string } {
  purgeExpired(now);
  const preview = previewHandoff(customer, insight);
  if (!preview) return { error: "no_handoff" };
  const approved = new Set(approvedKeys);
  const missing = preview.fields.filter((f) => f.required && !approved.has(f.key));
  if (missing.length) return { error: "required_fields_missing" };
  const handoff: Handoff = {
    token: randomBytes(24).toString("base64url"),
    provider: preview.provider,
    purpose: preview.purpose,
    insightId: insight.id,
    customerId: customer.id,
    fields: preview.fields.filter((f) => approved.has(f.key)),
    expiresAt: now + HANDOFF_TTL_MS,
    used: false,
  };
  handoffs.set(handoff.token, handoff);
  return handoff;
}

/** Consent withdrawn → every open link for this customer stops working. */
export function revokeHandoffsFor(customerId: string): void {
  for (const [token, h] of handoffs) if (h.customerId === customerId) handoffs.delete(token);
}

/** Housekeeping: drop expired tokens so the map can't grow unbounded. */
export function purgeExpired(now = Date.now()): void {
  for (const [token, h] of handoffs) if (now > h.expiresAt) handoffs.delete(token);
}

/** Provider side: redeem the token once. Expired or reused tokens return null. */
export function redeemHandoff(token: string, now = Date.now()): Handoff | null {
  const h = handoffs.get(token);
  if (!h) return null;
  handoffs.delete(token);
  if (h.used || now > h.expiresAt) return null;
  h.used = true;
  return h;
}
