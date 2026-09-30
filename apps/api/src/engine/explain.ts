import type { Insight } from "./types.js";

const eur = (n: number) => `€${n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/**
 * Kate's one-liner. Short on purpose: the screen already shows prices,
 * scores and savings; the text only says why this matters now.
 */
export function explainTemplate(i: Insight): string {
  if (i.kind === "overlap") return `${i.whyNow} Pause what you rarely use.`;
  if (i.kind === "creep") return `${i.whyNow} No better offer yet; Kate keeps watching.`;
  if (i.kind === "purchase") return `${i.whyNow} Ask ${i.current.name} to match the price first.`;
  return `${i.whyNow} Save ${eur(i.savingsYear)} a year.`;
}
