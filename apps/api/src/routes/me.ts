import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { AS_OF } from "../data/customers.js";
import { customerForToken, demoMode, resetCustomer } from "../store.js";
import { eraseKateData, exportKateData } from "../engine/privacy.js";
import { analyze, pickNotification } from "../engine/insights.js";
import { explainWithKate, kateEnabled } from "../engine/kate.js";
import { categorize } from "../engine/categorize.js";
import type { Customer } from "../engine/types.js";
import { createHandoff, previewHandoff } from "../engine/handoff.js";
import { entryFromInsight, optionFor, PLATFORMS, project, savingsSummary } from "../engine/savings.js";

interface AuthedRequest extends Request {
  customer: Customer;
}

/** Bearer-token auth. Every route below is scoped to the token's own customer — no ids in URLs. */
function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const customer = token ? customerForToken(token) : null;
  if (!customer) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  (req as AuthedRequest).customer = customer;
  next();
}

function requireConsent(req: Request, res: Response, next: NextFunction) {
  if (!(req as AuthedRequest).customer.consent) {
    res.status(403).json({ error: "consent_required", message: "Kate cannot analyse your spending without your consent." });
    return;
  }
  next();
}

const asOf = (c: Customer) => c.demoDate ?? process.env.AS_OF ?? AS_OF;
const DEMO_ENABLED = demoMode();

export const me = Router();
// Financial data: never cache in browsers or proxies.
me.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  next();
});
me.use(auth);

me.get("/", (req, res) => {
  const c = (req as AuthedRequest).customer;
  const cycle = analyze(c, asOf(c)).cycle;
  res.json({ id: c.id, name: c.name, firstName: c.firstName, consent: c.consent, asOf: asOf(c), demo: DEMO_ENABLED, payday: cycle.payday, daysToPayday: cycle.daysToPayday, kate: kateEnabled() ? "claude" : "template" });
});

const consentSchema = z.object({ enabled: z.boolean() });
me.post("/consent", (req, res) => {
  const parsed = consentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ error: "invalid_body", issues: parsed.error.issues });
    return;
  }
  const c = (req as AuthedRequest).customer;
  if (parsed.data.enabled) c.consent = true;
  else eraseKateData(c);
  res.json({ consent: c.consent });
});

/** Right of access / portability: download everything Kate Zoom holds. */
me.get("/export", (req, res) => {
  const c = (req as AuthedRequest).customer;
  res.setHeader("Content-Disposition", 'attachment; filename="kate-zoom-data.json"');
  res.json(exportKateData(c, asOf(c)));
});

me.get("/spending", requireConsent, (req, res) => {
  const c = (req as AuthedRequest).customer;
  const { recurring } = analyze(c, asOf(c));
  const txs = categorize(c.transactions).filter((t) => t.amount < 0 && t.date <= asOf(c));
  const byCategory = new Map<string, number>();
  const months = new Set(txs.map((t) => t.date.slice(0, 7)));
  for (const t of txs) byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + Math.abs(t.amount));
  const categories = [...byCategory.entries()]
    .map(([category, total]) => ({ category, monthlyAvg: Math.round(total / Math.max(1, months.size)) }))
    .sort((a, b) => b.monthlyAvg - a.monthlyAvg);
  res.json({ asOf: asOf(c), months: months.size, categories, recurring });
});

me.get("/insights", requireConsent, async (req, res) => {
  const c = (req as AuthedRequest).customer;
  const { insights } = analyze(c, asOf(c));
  const enriched = await Promise.all(
    insights.map(async (i) => {
      const { text, source } = await explainWithKate(i, c.firstName);
      return { ...i, explanation: text, explanationSource: source };
    }),
  );
  res.json({ asOf: asOf(c), insights: enriched });
});

me.get("/notification", requireConsent, async (req, res) => {
  const c = (req as AuthedRequest).customer;
  const { insights } = analyze(c, asOf(c));
  const decision = pickNotification(insights, c, asOf(c));
  if (!decision.insight) {
    res.json({ notification: null, reason: decision.reason });
    return;
  }
  const { text, source } = await explainWithKate(decision.insight, c.firstName);
  res.json({ notification: { ...decision.insight, explanation: text, explanationSource: source }, reason: decision.reason });
});

const feedbackSchema = z.object({ action: z.enum(["snooze", "dismiss", "accept"]), paused: z.array(z.string().max(40)).max(10).optional() });
me.post("/insights/:id/feedback", requireConsent, (req, res) => {
  const idParsed = z.string().regex(/^[a-z0-9-]{1,64}$/).safeParse(req.params.id);
  const parsed = feedbackSchema.safeParse(req.body);
  if (!idParsed.success || !parsed.success) {
    res.status(422).json({ error: "invalid_body" });
    return;
  }
  const c = (req as AuthedRequest).customer;
  const { insights } = analyze(c, asOf(c));
  if (!insights.some((i) => i.id === idParsed.data)) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  if (parsed.data.action === "accept" && !c.savings.some((s) => s.id === idParsed.data)) {
    c.savings.push(entryFromInsight(insights.find((i) => i.id === idParsed.data)!, asOf(c), parsed.data.paused));
  }
  const until = parsed.data.action === "snooze" ? new Date(Date.parse(asOf(c)) + 30 * 86_400_000).toISOString().slice(0, 10) : undefined;
  c.feedback.push({ insightId: idParsed.data, action: parsed.data.action, at: asOf(c), until });
  res.json({ ok: true, status: parsed.data.action === "snooze" ? "snoozed" : parsed.data.action === "dismiss" ? "dismissed" : "accepted" });
});

const idSchema = z.string().regex(/^[a-z0-9-]{1,64}$/);

/** What Kate would prefill at the provider (shown to the customer before anything is shared). */
me.get("/insights/:id/handoff", requireConsent, (req, res) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) {
    res.status(422).json({ error: "invalid_id" });
    return;
  }
  const c = (req as AuthedRequest).customer;
  const insight = analyze(c, asOf(c)).insights.find((i) => i.id === id.data);
  const preview = insight ? previewHandoff(c, insight) : null;
  if (!preview) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(preview);
});

/** Customer approved (a subset of) the fields → single-use, 10-minute token for the provider page. */
const handoffSchema = z.object({ fields: z.array(z.string().regex(/^[a-z]{1,20}$/)).max(20) });
me.post("/insights/:id/handoff", requireConsent, (req, res) => {
  const id = idSchema.safeParse(req.params.id);
  const body = handoffSchema.safeParse(req.body);
  if (!id.success || !body.success) {
    res.status(422).json({ error: "invalid_body" });
    return;
  }
  const c = (req as AuthedRequest).customer;
  const insight = analyze(c, asOf(c)).insights.find((i) => i.id === id.data);
  if (!insight) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const result = createHandoff(c, insight, body.data.fields);
  if ("error" in result) {
    res.status(422).json({ error: result.error });
    return;
  }
  res.json({ token: result.token, expiresAt: new Date(result.expiresAt).toISOString(), provider: result.provider });
});

/** What Kate Zoom already saved, and the active investment plan. */
me.get("/savings", requireConsent, (req, res) => {
  const c = (req as AuthedRequest).customer;
  res.json({ ...savingsSummary(c, asOf(c)), platforms: PLATFORMS });
});

const projectSchema = z.object({
  platform: z.enum(["kbc", "bolero"]),
  option: z.string().regex(/^[a-z]{1,20}$/),
  lump: z.number().min(0).max(1_000_000),
  monthly: z.number().min(0).max(10_000),
  years: z.number().int().min(1).max(40),
});

/** Projection only (no side effects) — used for the live chart. */
me.post("/invest/projection", requireConsent, (req, res) => {
  const body = projectSchema.safeParse(req.body);
  if (!body.success) {
    res.status(422).json({ error: "invalid_body" });
    return;
  }
  const { platform, option, lump, monthly, years } = body.data;
  const opt = optionFor(platform, option);
  if (!opt) {
    res.status(422).json({ error: "invalid_option" });
    return;
  }
  res.json({ points: project(lump, monthly, opt.expectedReturn, years) });
});

/** Start the plan. Lump sum is capped at what Kate Zoom actually saved; monthly at the recurring savings. */
me.post("/invest", requireConsent, (req, res) => {
  const body = projectSchema.safeParse(req.body);
  if (!body.success) {
    res.status(422).json({ error: "invalid_body" });
    return;
  }
  const c = (req as AuthedRequest).customer;
  if (!optionFor(body.data.platform, body.data.option)) {
    res.status(422).json({ error: "invalid_option" });
    return;
  }
  const s = savingsSummary(c, asOf(c));
  if (body.data.lump > s.realized + 0.01 || body.data.monthly > Math.ceil(s.yearly / 12)) {
    res.status(422).json({ error: "exceeds_savings" });
    return;
  }
  c.investPlan = { ...body.data, startedAt: asOf(c) };
  res.json({ plan: c.investPlan });
});

/** Mark the current notification as delivered (the app calls this when it shows the push). */
me.post("/notification/delivered", requireConsent, (req, res) => {
  const idParsed = z.object({ insightId: z.string().regex(/^[a-z0-9-]{1,64}$/) }).safeParse(req.body);
  if (!idParsed.success) {
    res.status(422).json({ error: "invalid_body" });
    return;
  }
  const c = (req as AuthedRequest).customer;
  c.notified.push({ insightId: idParsed.data.insightId, at: asOf(c) });
  res.json({ ok: true });
});

/** Masked transaction list — the module shows only what the customer already sees in the app. */
me.get("/transactions", requireConsent, (req, res) => {
  const c = (req as AuthedRequest).customer;
  const parsedLimit = z.coerce.number().int().min(1).max(200).default(40).safeParse(req.query.limit);
  const limit = parsedLimit.success ? parsedLimit.data : 40;
  const txs = categorize(c.transactions).filter((t) => t.date <= asOf(c)).slice(-limit).reverse().map(({ id, date, amount, merchantName, category }) => ({ id, date, amount, merchantName, category }));
  res.json({ transactions: txs });
});

/** Demo helper: travel in time within the seeded data, to show organic timing. Disabled in production. */
const demoDateSchema = z.object({ date: z.string().regex(/^2026-09-(0[1-9]|[12][0-9]|30)$/).nullable() });
me.post("/demo-date", (req, res) => {
  if (!DEMO_ENABLED) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const body = demoDateSchema.safeParse(req.body);
  if (!body.success) {
    res.status(422).json({ error: "invalid_date" });
    return;
  }
  const c = (req as AuthedRequest).customer;
  c.demoDate = body.data.date ?? undefined;
  c.notified = [];
  res.json({ asOf: asOf(c) });
});

/** Demo helper: reset feedback/notifications for this customer. Disabled in production. */
me.post("/reset", (req, res) => {
  if (!DEMO_ENABLED) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const c = (req as AuthedRequest).customer;
  resetCustomer(c.id);
  res.json({ ok: true });
});
