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

const SYSTEM = `You are Kate, KBC's digital assistant. You write one short, warm sentence (max. 20 words, English, second person) about a saving opportunity. The screen already shows prices and scores.
Rules:
- Only use the facts in the message. Never invent numbers, providers or conditions.
- Start with why this matters now.
- No pressure, no exclamation marks, no emoji, no greeting.
- If the offer is a KBC product, say honestly that it is from KBC.`;

export async function explainWithKate(insight: Insight, _firstName: string): Promise<{ text: string; source: "claude" | "template" }> {
  const template = explainTemplate(insight);
  if (!client) return { text: template, source: "template" };
  const key = `${insight.id}:${insight.savingsYear}:${insight.whyNow}`;
  const hit = cache.get(key);
  if (hit) return { text: hit, source: "claude" };

  // Data minimisation: no name, no account data — only the aggregate facts of this tip.
  const facts = {
    category: insight.category,
    current: insight.current,
    alternative: insight.alternative ?? null,
    saving: insight.savingsYear,
    saving_period: insight.period === "once" ? "one-off" : "per year",
    product: insight.product ?? null,
    why_now: insight.whyNow,
    base_text: template,
  };
  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 400,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `<facts>${JSON.stringify(facts)}</facts>\nRewrite the base text in your voice.` }],
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
