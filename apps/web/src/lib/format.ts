export const eur = (n: number, digits = 0) =>
  `€ ${n.toLocaleString("nl-BE", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export const score = (n: number) => n.toFixed(1).replace(".", ",");

export const CATEGORY_LABEL: Record<string, string> = {
  energy: "Energie",
  telecom: "Internet & tv",
  mobile: "Gsm",
  streaming: "Streaming",
  insurance: "Verzekering",
  groceries: "Boodschappen",
  fuel: "Brandstof",
  fashion: "Kleding",
  leisure: "Vrije tijd",
  other: "Overige",
  income: "Inkomen",
};

export const MOMENT_LABEL: Record<string, string> = {
  price_creep: "Prijs stijgt",
  contract_window: "Contract loopt af",
  post_debit: "Net afgeschreven",
  overlap: "Dubbelop",
  seasonal: "Seizoen",
  better_deal: "Beter aanbod",
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("nl-BE", { day: "numeric", month: "long" });
