import type { Insight } from "./types.js";

const eur = (n: number) => `€${n.toLocaleString("nl-BE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const score = (n: number) => n.toFixed(1).replace(".", ",");

/**
 * Deterministic Kate copy. Used as-is when no LLM is configured, and as the
 * fallback when the LLM call fails. Tone: short, concrete, no pressure.
 */
export function explainTemplate(i: Insight): string {
  if (i.kind === "overlap") {
    return `Je betaalt ${eur(i.current.monthly)} per maand voor ${i.current.name}. Eén dienst pauzeren wanneer je ze weinig gebruikt, bespaart je zo'n ${eur(i.savingsYear)} per jaar. Je kan ze later altijd opnieuw activeren.`;
  }
  if (i.kind === "purchase") {
    const a = i.alternative!;
    return `${i.whyNow} ${a.provider} verkoopt exact hetzelfde model voor ${eur(a.monthly)} in plaats van ${eur(i.current.monthly)} (verkopersscore ${score(a.quality)}). Vraag ${i.current.name} eerst om het verschil bij te passen; lukt dat niet, dan kan je nog ruilen en bespaar je ${eur(i.savingsYear)}.`;
  }
  if (i.kind === "creep") {
    return `${i.whyNow} Er is nu geen betere aanbieder van dezelfde kwaliteit, maar ik hou het voor je in het oog.`;
  }
  const a = i.alternative!;
  const quality = a.quality >= i.current.quality ? `met een hogere klantscore (${score(a.quality)} vs ${score(i.current.quality)})` : `met een vergelijkbare klantscore (${score(a.quality)} vs ${score(i.current.quality)})`;
  const partner = a.partner ? " Dit is een KBC-product; ik toon het omdat het op prijs én kwaliteit wint, niet omdat het van ons is." : "";
  return `${i.whyNow} Bij ${a.provider} betaal je ${eur(a.monthly)} in plaats van ${eur(i.current.monthly)} per maand, ${quality}. Dat scheelt zo'n ${eur(i.savingsYear)} per jaar.${partner}`;
}
