import type { Insight } from "./types.js";

const eur = (n: number) => `€${n.toLocaleString("nl-BE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/**
 * Kate's one-liner. Short on purpose: the screen already shows prices,
 * scores and savings; the text only says why this matters now.
 */
export function explainTemplate(i: Insight): string {
  if (i.kind === "overlap") return `${i.whyNow} Pauzeer er één die je weinig gebruikt.`;
  if (i.kind === "creep") return `${i.whyNow} Nog geen beter aanbod; ik hou het in het oog.`;
  if (i.kind === "purchase") return `${i.whyNow} Vraag eerst of ${i.current.name} het verschil bijpast.`;
  return `${i.whyNow} Bespaar ${eur(i.savingsYear)} per jaar.`;
}
