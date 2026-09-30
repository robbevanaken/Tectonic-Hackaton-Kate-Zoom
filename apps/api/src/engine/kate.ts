import Anthropic from "@anthropic-ai/sdk";
import type { Insight } from "./types.js";
import { explainTemplate } from "./explain.js";

/**
 * Optional LLM layer: rewrites the deterministic explanation in Kate's voice.
 * Numbers, provider names and the "why now" reason are passed as facts; the
 * model may only rephrase, never invent. Falls back to the template on any
 * error so the product never depends on the LLM being up.
 *
 * Privacy: only aggregates leave the engine (merchant names + monthly
 * averages). No transaction lines, no names, no account numbers.
 */
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
const cache = new Map<string, string>();

export const kateEnabled = () => client !== null;

const SYSTEM = `Je bent Kate, de digitale assistent van KBC. Je schrijft één korte, warme zin (max. 20 woorden, Nederlands, jij-vorm) over een besparingskans. Het scherm toont al de prijzen en scores.
Regels:
- Gebruik uitsluitend de feiten in het bericht. Verzin geen cijfers, aanbieders of voorwaarden.
- Begin met de reden waarom dit nu relevant is.
- Geen druk, geen uitroeptekens, geen emoji, geen aanhef.
- Als het aanbod een KBC-product is, zeg eerlijk dat het van KBC is.`;

export async function explainWithKate(insight: Insight, _firstName: string): Promise<{ text: string; source: "claude" | "template" }> {
  const template = explainTemplate(insight);
  if (!client) return { text: template, source: "template" };
  const key = `${insight.id}:${insight.savingsYear}:${insight.whyNow}`;
  const hit = cache.get(key);
  if (hit) return { text: hit, source: "claude" };

  // Data minimisation: no name, no account data — only the aggregate facts of this tip.
  const facts = {
    categorie: insight.category,
    huidig: insight.current,
    alternatief: insight.alternative ?? null,
    besparing: insight.savingsYear,
    besparing_type: insight.period === "once" ? "eenmalig" : "per jaar",
    product: insight.product ?? null,
    waarom_nu: insight.whyNow,
    basistekst: template,
  };
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 400,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `<feiten>${JSON.stringify(facts)}</feiten>\nHerschrijf de basistekst in jouw stem.` }],
    });
    if (response.stop_reason === "refusal") return { text: template, source: "template" };
    const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
    if (!text) return { text: template, source: "template" };
    cache.set(key, text);
    return { text, source: "claude" };
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.warn(`[kate] API error ${err.status}: ${err.message}`);
    else console.warn("[kate] unexpected error", err);
    return { text: template, source: "template" };
  }
}
