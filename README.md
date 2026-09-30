# Kate Zoom — KBC knows what you pay, and tells you when it matters

> Hackathon prototype (Tectonic × KBC, Gent, 30 Sept 2026). Challenge: *understand what each customer needs and respond at exactly the right moment.*
> All data in this repo is fictional.

![Kate Zoom: five key screens](docs/kate-zoom-overview.png)

Every KBC customer already tells the bank, month after month, where their money goes. **Kate Zoom** turns that into a quiet, personal price-watch inside the KBC app:

1. **Spot** — builds a recurring-spend profile from the customer's own transactions (energy, telecom, mobile, insurance, groceries, fuel, streaming) plus physical purchases from digital receipts.
2. **Time it** — only nudges when there is a cheaper alternative of *comparable quality*, the saving is worth an interruption, and it is *the right moment*. Urgent moments (contract turns one year, debit just landed, product cheaper while you can still return it) push right away. Soft ones (price creep, season, overlapping subscriptions) wait for the customer's own end of month: the last 5 days before their payday, detected from their salary credits, when budgets are tight.
3. **Switch in one tap** — Kate prefills the provider's sign-up page with exactly the fields the customer approves, via a single-use 10-minute link. The provider never sees balances or spending.
4. **Grow it** — everything Kate Zoom saved is tracked and can be invested, managed by KBC per risk profile or self-directed in ETFs via Bolero, with a live projection of what it grows to.

**Why build it into Kate?** KBC customers already know and trust Kate as their assistant in the app. Advice about money only works when people trust who gives it, so Kate Zoom builds on that existing relationship instead of introducing a new app or brand.

Partners can offer exclusive **KBC-klantendeals**, shown transparently but excluded from the ranking, so the comparison stays on price and quality.

| | | |
|---|---|---|
| ![Push at the right moment](docs/screenshots/framed/01-home-push.png) | ![Kate Zoom overview](docs/screenshots/framed/02-overview.png) | ![Energy tip](docs/screenshots/framed/03-energy-tip.png) |
| ![Choose what to share](docs/screenshots/framed/04-share-consent.png) | ![Provider page, prefilled](docs/screenshots/framed/05-provider-prefilled.png) | ![Pause streaming services](docs/screenshots/framed/06-streaming-tip.png) |
| ![Same product, cheaper, still returnable](docs/screenshots/framed/07-purchase-tip.png) | ![Invest the savings via KBC or Bolero](docs/screenshots/framed/08-invest-bolero.png) | ![What Kate Zoom is](docs/screenshots/framed/09-about.png) |

Full-resolution screens and a description of each are in [docs/screenshots](docs/screenshots/).

## Run it

```bash
npm install
npm run dev          # API on :4000, KBC-styled app on http://localhost:5180
npm test             # 21 tests (node:test)
```

How to walk through the demo, and the design decisions behind it, are in **[DEMO.md](DEMO.md)** (Dutch).

| Persona | Situation | What Kate does |
|---|---|---|
| **Thomas** | Engie crept €142 → €168, Telenet contract turns 1 year (debited 2 days ago), 3 streaming services, Delhaize shopper, bought €399 headphones 9 days ago | Push *"Bespaar zo'n €468 per jaar"* on energy. Overview with 8 timed tips, headphones €70 cheaper at Coolblue within the return window, €131 already saved. |
| **Lien** | Bolt, Colruyt, DATS 24 | No push. "Hier zit je goed" for energy, groceries, fuel. One small mobile tip that waits for a moment. |

Optional: `ANTHROPIC_API_KEY` in `.env` lets Kate rewrite each explanation in her own voice (Claude Opus 5.5) from the engine's facts only. Without a key the deterministic Dutch templates are used; the demo works fully offline.

## How it works

```
transactions ─► categorize ─► detectRecurring ─► detectMoments ─┐
receipts ─────────────────────► purchaseMatches ────────────────┤
offers / product prices ─► bestAlternative (quality parity) ────┴─► insights ─► rank ─► notification policy ─► app
                                                                                          │
                          accept ─► handoff (consent, single-use token) ─► provider page   │
                                 └► savings ledger ─► invest plan + projection ◄───────────┘
```

`apps/api/src/engine/` — pure TypeScript, no framework, unit-tested:

| Module | Responsibility |
|---|---|
| `categorize.ts` | Merchant matching against a catalog. Swap for KBC's own categorisation. |
| `recurring.ts` | Cadence, current price, 14-month history, trend per merchant. |
| `moments.ts` | Timing signals: `price_creep`, `contract_window`, `post_debit`, `seasonal`, `overlap`. |
| `purchases.ts` | Same EAN cheaper at a seller with score ≥ 4.0, only inside the receipt's return window. |
| `match.ts` | Best cheaper alternative with quality parity (`quality ≥ current − 0.3`). Partner offers and deals get no ranking boost (tested). |
| `budget.ts` | Payday from the customer's salary credits; the last 5 days before payday are the budget-squeeze window. |
| `insights.ts` | `relevance = min(1, saving/500) × confidence × (1 + Σ moment weights)` and `pickNotification()`: ≥ €50, 1 push per 7 days, **no moment → no push**, urgent moments any day, soft ones only in the squeeze window, honours snooze/dismiss. |
| `privacy.ts` | Consent withdrawal erases Kate data and revokes links; GDPR export. |
| `handoff.ts` | Per-category prefill (EAN code, Easy Switch-ID, licence plate…), required vs optional fields, single-use 10-minute tokens. |
| `savings.ts` | Ledger of realised savings, run rate, KBC profiles and Bolero ETFs, monthly-compounding projection. |
| `explain.ts` / `kate.ts` | Deterministic Kate copy; optional Claude rewrite with a facts-only prompt and template fallback. |

REST API (`apps/api/src/routes/`), all `/api/me` routes scoped to the bearer token's own customer:

| Route | Purpose |
|---|---|
| `GET /api/me` · `POST /api/me/consent` · `GET /api/me/export` | Profile, opt-in toggle (off = erase), GDPR export. Everything below returns 403 without consent |
| `GET /api/me/spending` · `GET /api/me/insights` | Category breakdown, ranked and explained tips |
| `GET /api/me/notification` · `POST /api/me/notification/delivered` | The one push Kate would send now and why, cooldown |
| `POST /api/me/insights/:id/feedback` | `accept` / `snooze` / `dismiss`; accept adds to the savings ledger |
| `GET/POST /api/me/insights/:id/handoff` | Preview the prefill, then create a single-use token for the approved fields |
| `POST /api/handoff/redeem` | Provider side: redeem the token once (410 when used or expired) |
| `GET /api/me/savings` · `POST /api/me/invest/projection` · `POST /api/me/invest` | Savings ledger, projection, start plan (capped at what Kate actually saved) |

`apps/web/` — React + Tailwind mock of the KBC Mobile app (Kate search bar, account cards, "Voor jou" feed, bottom nav) with the Kate Zoom module: push, overview, detail, consent, simulated provider page, invest. Every button works; parts of the KBC app outside this demo open a page that says so and links back to Kate Zoom. The app shows only what a customer would see: the presenter controls (customer, date, reset, the live notification decision) sit in a separate panel next to the phone, or below it on a narrow screen with `?demo` in the URL.

## Business model

Customers save without comparing or filling in forms. KBC gets engagement and new recurring investment inflow. Partners (energy, telecom, retail) offer exclusive discounts to KBC customers and pay per switch; a prefilled, consented lead converts far better than an ad. Neutrality is a hard rule: deals are shown but never change the ranking.

## Security and legal

See [SECURITY.md](SECURITY.md) and [docs/LEGAL.md](docs/LEGAL.md) (GDPR, MiFID II, consumer law, AI Act). In short: bearer-scoped routes (no ids in URLs), consent gate, zod validation, helmet + CSP, rate limiting, single-use handoff tokens with field-level consent, data minimisation towards providers and the LLM, no secrets in the repo, demo logins disabled in production, CI with CodeQL and SHA-pinned actions, Dependabot, 0 `npm audit` findings.

## Repo layout

```
apps/api   Express + TypeScript API and the analysis engine (+ tests)
apps/web   Vite + React + Tailwind KBC-styled app
docs/      Legal & compliance mapping, screenshots
DEMO.md    Demo script for the presenter (Dutch)
```
