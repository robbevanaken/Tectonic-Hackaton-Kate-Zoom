export const eur = (n: number, digits = 0) =>
  `€${n.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export const score = (n: number) => n.toFixed(1);

export const CATEGORY_LABEL: Record<string, string> = {
  energy: "Energy",
  telecom: "Internet & TV",
  mobile: "Mobile",
  streaming: "Streaming",
  insurance: "Insurance",
  groceries: "Groceries",
  fuel: "Fuel",
  fashion: "Clothing",
  leisure: "Leisure",
  electronics: "Purchase",
  other: "Other",
  income: "Income",
};

export const MOMENT_LABEL: Record<string, string> = {
  price_creep: "Price going up",
  contract_window: "Contract ending",
  post_debit: "Just debited",
  overlap: "Overlap",
  seasonal: "Season",
  better_deal: "Better offer",
  return_window: "Still returnable",
  price_drop: "Now cheaper",
  budget_squeeze: "End of the month",
};

export const periodLabel = (period: "year" | "once") => (period === "once" ? "one-off" : "a year");

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
