# Security notes — Kate Zoom

Judged on security (10%), so here is what the prototype does and, honestly, what a production build would still need.

## What the prototype does

| Concern | Measure |
|---|---|
| Demo auth never in production | Demo bearer tokens only work when `NODE_ENV !== production` (or `DEMO_MODE=true` explicitly). Tokens are compared in constant time (`timingSafeEqual` over SHA-256 digests). Demo-only routes (`/reset`, `/demo-date`) return 404 in production. |
| Authentication | Bearer token on every `/api/me/*` route. Routes are **scoped to the token's own customer** — there is no customer id in any URL, so IDOR is impossible by construction. |
| Consent | `GET /spending`, `/insights`, `/notification` return **403 `consent_required`** when the customer has switched Kate Zoom off. Consent is explicit and revocable in Settings. |
| Input validation | All bodies and route params validated with `zod` (enum actions, `^[a-z0-9-]{1,64}$` ids). JSON body limit 10 kB. |
| Rate limiting | `express-rate-limit`: 120 req/min per IP globally, 20 req/min on token redemption, handoff creation, investing and export. |
| Consent withdrawal | Switching Kate Zoom off erases feedback, notifications and the savings ledger and revokes open handoff links (`engine/privacy.ts`, tested). `GET /api/me/export` gives the customer all their Kate Zoom data (GDPR art. 15/20). |
| Caching | Every `/api/me` response sends `Cache-Control: no-store`. |
| Headers (API) | Helmet with a JSON-only CSP (`default-src 'none'; frame-ancestors 'none'`), `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, HSTS, CORP `same-origin`. CORS limited to configured origins, `GET`/`POST`, two headers. Unknown routes → 404 JSON; malformed JSON → 400. |
| Headers | `helmet()` defaults, `x-powered-by` disabled, CORS restricted to the configured origins. Frontend ships a CSP (`default-src 'self'`, fonts from Google only). |
| Error handling | Central error handler returns `{error: "internal_error"}` — no stack traces to clients. |
| Secrets | None in the repo. `.env.example` documents the optional `ANTHROPIC_API_KEY`; `.env` is git-ignored. |
| Data minimisation towards the LLM | Only an aggregate (merchant name, monthly amounts, saving, why-now sentence) is sent to Claude. **No transaction lines, no customer name, no account numbers.** The model may only rephrase facts; numbers come from the engine. Any failure or refusal falls back to the deterministic template, so the product never *depends* on the LLM. |
| Provider handoff | The customer sees every field before it is shared and can untick optional ones; required fields are enforced server-side. Kate creates a **single-use, 10-minute token** (`crypto.randomBytes(24)`) carrying only the approved fields. The provider redeems it once (`410` afterwards, `Cache-Control: no-store`). Balances, transactions and spending are never part of a handoff (tested). |
| Investing | The plan is validated server-side: the lump sum is capped at what Kate Zoom actually saved and the monthly amount at the recurring savings. Projections are labelled as illustrative, not advice. |
| Prompt injection | Facts are passed as a JSON blob inside `<feiten>` tags with a fixed system prompt; merchant strings come from KBC's own catalog, never from free-text transaction descriptions. |
| Determinism & auditability | `analyze(customer, asOf)` is a pure function: same data + same date → same insights. Every insight carries `dataPoints`, `confidence`, its `moments` and the source of the quality score — the "Waarom zie ik dit?" panel shows exactly that. |
| Supply chain | GitHub Actions pinned to commit SHAs, `permissions: contents: read`, `persist-credentials: false`, `npm ci --ignore-scripts`. CodeQL (`security-extended`) on every push and weekly. Dependabot for npm and actions. |
| Logging | Errors are logged by class name only, never with request data. |
| Dependencies | `npm audit` reports 0 vulnerabilities at submission time (see Aikido screenshots). |

## What production would need

- Real KBC authentication (Itsme / KBC Sign) instead of demo bearer tokens; short-lived session tokens.
- Persist consent + feedback in the customer profile with an audit trail (GDPR art. 7 — provable consent, art. 22 — the customer can always see why a suggestion was made and opt out).
- Run the engine inside KBC's data perimeter; the offer feed is the only external input and should be signed.
- Handoff redemption as a server-to-server call (mTLS or signed JWT) instead of a token in the browser, with partner allow-listing.
- Investing via KBC's MiFID suitability questionnaire before any order.
- Ranking must stay **provably neutral** towards KBC's own products (today: `partner` is display-only and unit-tested to have no ranking effect) — regulators will ask.
- Abuse monitoring on the feedback endpoints, and per-customer rate limits.

## Reporting a vulnerability

Please do not open a public issue. Mail the maintainers (see the GitHub profile) with steps to reproduce; we answer within 72 hours during the hackathon period.

See also [docs/LEGAL.md](docs/LEGAL.md) for the GDPR, MiFID II, consumer-law and AI Act mapping.
