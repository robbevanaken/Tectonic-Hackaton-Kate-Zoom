export interface Moment { type: string; weight: number; reason: string }
export interface MonthTotal { month: string; total: number }
export interface Insight {
  id: string;
  kind: "switch" | "overlap" | "creep";
  category: string;
  title: string;
  current: { name: string; monthly: number; quality: number };
  alternative?: { offerId: string; provider: string; monthly: number; quality: number; source: string; partner: boolean; note: string; switchEffort: "low" | "medium" };
  savingsMonth: number;
  savingsYear: number;
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
export interface Me { id: string; name: string; firstName: string; consent: boolean; asOf: string; kate: "claude" | "template" }
export interface Recurring { merchantId: string; merchantName: string; category: string; cadence: string; monthlyAvg: number; currentMonthly: number; occurrences: number; trendPct: number; quality: number }
export interface Spending { asOf: string; months: number; categories: { category: string; monthlyAvg: number }[]; recurring: Recurring[] }
export interface Tx { id: string; date: string; amount: number; merchantName: string; category: string }

const PERSONA_KEY = "kate-switch-persona";
export const PERSONAS = [
  { token: "demo-thomas", label: "Thomas (kan besparen)" },
  { token: "demo-lien", label: "Lien (zit al goed)" },
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
  feedback: (id: string, action: "snooze" | "dismiss" | "accept") => call<{ ok: true; status: Insight["status"] }>(`/insights/${id}/feedback`, { method: "POST", body: JSON.stringify({ action }) }),
  transactions: (limit = 40) => call<{ transactions: Tx[] }>(`/transactions?limit=${limit}`),
  reset: () => call<{ ok: true }>("/reset", { method: "POST" }),
};
