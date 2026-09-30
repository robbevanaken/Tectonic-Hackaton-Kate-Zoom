export interface Moment { type: string; weight: number; reason: string }
export interface MonthTotal { month: string; total: number }
export interface Insight {
  id: string;
  kind: "switch" | "overlap" | "creep" | "purchase";
  category: string;
  title: string;
  current: { name: string; monthly: number; quality: number };
  alternative?: { offerId: string; provider: string; monthly: number; quality: number; source: string; partner: boolean; partnerDeal?: string; note: string; switchEffort: "low" | "medium" };
  savingsMonth: number;
  savingsYear: number;
  period: "year" | "once";
  product?: string;
  services?: { name: string; monthly: number }[];
  confidence: number;
  moments: Moment[];
  relevance: number;
  whyNow: string;
  explanation: string;
  explanationSource: "template" | "claude";
  dataPoints: number;
  byMonth: MonthTotal[];
  status: "new" | "snoozed" | "dismissed" | "accepted";
}
export interface Me { id: string; name: string; firstName: string; consent: boolean; asOf: string; demo: boolean; payday: number | null; daysToPayday: number | null; kate: "claude" | "template" }
export interface Recurring { merchantId: string; merchantName: string; category: string; cadence: string; monthlyAvg: number; currentMonthly: number; occurrences: number; trendPct: number; quality: number }
export interface Spending { asOf: string; months: number; categories: { category: string; monthlyAvg: number }[]; recurring: Recurring[] }
export interface HandoffField { key: string; label: string; value: string; required: boolean }
export interface HandoffPreview { provider: string; purpose: string; fields: HandoffField[] }
export interface HandoffRedeemed { provider: string; purpose: string; fields: Omit<HandoffField, "required">[] }

export type Platform = "kbc" | "bolero";
export interface InvestOption { label: string; expectedReturn: number; risk: string }
export interface SavingEntry { id: string; date: string; label: string; amount: number; period: "year" | "once" }
export interface InvestPlan { platform: Platform; option: string; lump: number; monthly: number; years: number; startedAt: string }
export interface Savings {
  realized: number;
  yearly: number;
  entries: SavingEntry[];
  plan: InvestPlan | null;
  platforms: Record<Platform, { label: string; tagline: string; options: Record<string, InvestOption> }>;
}
export interface ProjectionPoint { year: number; invested: number; value: number }

export interface Tx { id: string; date: string; amount: number; merchantName: string; category: string }

const PERSONA_KEY = "kate-zoom-persona";
export const PERSONAS = [
  { token: "demo-thomas", label: "Thomas (can save)" },
  { token: "demo-lien", label: "Lien (already on good deals)" },
];

export function getPersona(): string {
  try {
    return localStorage.getItem(PERSONA_KEY) ?? PERSONAS[0].token;
  } catch {
    return PERSONAS[0].token;
  }
}
export function setPersona(token: string) {
  try {
    localStorage.setItem(PERSONA_KEY, token);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/me${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${getPersona()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let code = "error";
    try {
      code = (await res.json()).error ?? code;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, code);
  }
  return res.json() as Promise<T>;
}

export const api = {
  me: () => call<Me>("/"),
  consent: (enabled: boolean) => call<{ consent: boolean }>("/consent", { method: "POST", body: JSON.stringify({ enabled }) }),
  spending: () => call<Spending>("/spending"),
  insights: () => call<{ asOf: string; insights: Insight[] }>("/insights"),
  notification: () => call<{ notification: Insight | null; reason: string }>("/notification"),
  delivered: (insightId: string) => call<{ ok: true }>("/notification/delivered", { method: "POST", body: JSON.stringify({ insightId }) }),
  feedback: (id: string, action: "snooze" | "dismiss" | "accept", paused?: string[]) => call<{ ok: true; status: Insight["status"] }>(`/insights/${id}/feedback`, { method: "POST", body: JSON.stringify({ action, paused }) }),
  transactions: (limit = 40) => call<{ transactions: Tx[] }>(`/transactions?limit=${limit}`),
  handoffPreview: (id: string) => call<HandoffPreview>(`/insights/${id}/handoff`),
  handoffCreate: (id: string, fields: string[]) => call<{ token: string; expiresAt: string; provider: string }>(`/insights/${id}/handoff`, { method: "POST", body: JSON.stringify({ fields }) }),
  /** Provider side — no customer auth, the one-time token is the credential. */
  handoffRedeem: async (token: string): Promise<HandoffRedeemed> => {
    const res = await fetch("/api/handoff/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if (!res.ok) throw new ApiError(res.status, (await res.json().catch(() => ({}))).error ?? "error");
    return res.json();
  },
  savings: () => call<Savings>("/savings"),
  projection: (p: Omit<InvestPlan, "startedAt">) => call<{ points: ProjectionPoint[] }>("/invest/projection", { method: "POST", body: JSON.stringify(p) }),
  invest: (p: Omit<InvestPlan, "startedAt">) => call<{ plan: InvestPlan }>("/invest", { method: "POST", body: JSON.stringify(p) }),
  demoDate: (date: string | null) => call<{ asOf: string }>("/demo-date", { method: "POST", body: JSON.stringify({ date }) }),
  /** GDPR export, downloaded as a file. */
  exportData: async () => {
    const res = await fetch("/api/me/export", { headers: { Authorization: `Bearer ${getPersona()}` } });
    if (!res.ok) throw new ApiError(res.status, "export_failed");
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "kate-zoom-data.json";
    a.click();
    URL.revokeObjectURL(url);
  },
  reset: () => call<{ ok: true }>("/reset", { method: "POST" }),
};
