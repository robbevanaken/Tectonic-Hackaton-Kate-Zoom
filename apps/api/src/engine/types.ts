export type Category =
  | "energy"
  | "telecom"
  | "mobile"
  | "streaming"
  | "insurance"
  | "groceries"
  | "fuel"
  | "fashion"
  | "leisure"
  | "income"
  | "other";

export interface Transaction {
  id: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Negative = debit, positive = credit. EUR. */
  amount: number;
  counterparty: string;
  description: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: Category;
  /** Lower-cased substrings matched against counterparty/description. */
  patterns: string[];
  /** Independent quality score 0-5 (e.g. Test Aankoop / review aggregate). */
  quality: number;
  /** Optional monthly price index for basket-style categories (1.0 = reference). */
  priceIndex?: number;
}

export interface CategorizedTransaction extends Transaction {
  merchantId: string | null;
  merchantName: string;
  category: Category;
}

export type Cadence = "monthly" | "weekly" | "variable";

export interface MonthTotal {
  /** YYYY-MM */
  month: string;
  total: number;
}

export interface RecurringSpend {
  merchantId: string;
  merchantName: string;
  category: Category;
  cadence: Cadence;
  monthlyAvg: number;
  /** What the customer pays today: last debit for monthly cadence, average otherwise. */
  currentMonthly: number;
  lastAmount: number;
  lastDate: string;
  firstDate: string;
  occurrences: number;
  monthsActive: number;
  /** % change of last 3 months vs first 3 months (monthly cadence only). */
  trendPct: number;
  quality: number;
  priceIndex?: number;
  byMonth: MonthTotal[];
}

export interface Offer {
  id: string;
  provider: string;
  category: Category;
  /** Fixed monthly price, when applicable. */
  monthly?: number;
  /** Relative price index for basket-style categories (groceries, fuel). */
  priceIndex?: number;
  quality: number;
  source: string;
  /** True when this is a KBC product/partner. Shown transparently; no ranking boost. */
  partner: boolean;
  note: string;
  switchEffort: "low" | "medium";
}

export type MomentType =
  | "price_creep"
  | "contract_window"
  | "post_debit"
  | "overlap"
  | "seasonal"
  | "better_deal";

export interface Moment {
  type: MomentType;
  /** Additive relevance weight (0-1). */
  weight: number;
  reason: string;
}

export type InsightKind = "switch" | "overlap" | "creep";
export type InsightStatus = "new" | "snoozed" | "dismissed" | "accepted";

export interface Insight {
  id: string;
  kind: InsightKind;
  category: Category;
  title: string;
  current: { name: string; monthly: number; quality: number };
  alternative?: {
    offerId: string;
    provider: string;
    monthly: number;
    quality: number;
    source: string;
    partner: boolean;
    note: string;
    switchEffort: "low" | "medium";
  };
  savingsMonth: number;
  savingsYear: number;
  /** 0-1 */
  confidence: number;
  moments: Moment[];
  /** Composite score used for ranking + notification policy. */
  relevance: number;
  whyNow: string;
  explanation: string;
  explanationSource: "template" | "claude";
  /** How many transactions backed this insight (transparency). */
  dataPoints: number;
  byMonth: MonthTotal[];
  status: InsightStatus;
}

export interface Feedback {
  insightId: string;
  action: "snooze" | "dismiss" | "accept";
  at: string;
  /** ISO date until which the feedback suppresses the insight. */
  until?: string;
}

export interface Customer {
  id: string;
  name: string;
  firstName: string;
  consent: boolean;
  transactions: Transaction[];
  feedback: Feedback[];
  /** Dates (YYYY-MM-DD) on which a push notification was sent. */
  notified: { insightId: string; at: string }[];
}
