# Security notes — Kate Switch

Judged on security (10%), so here is what the prototype does and, honestly, what a production build would still need.

## What the prototype does

| Concern | Measure |
|---|---|
| Authentication | Bearer token on every `/api/me/*` route. Routes are **scoped to the token's own customer** — there is no customer id in any URL, so IDOR is impossible by construction. |
| Consent | `GET /spending`, `/insights`, `/notification` return **403 `consent_required`** when the customer has switched Kate Switch off. Consent is explicit and revocable in Settings. |
| Input validation | All bodies and route params validated with `zod` (enum actions, `^[a-z0-9-]{1,64}$` ids). JSON body limit 10 kB. |
| Rate limiting | `express-rate-limit`, 120 req/min per IP, standard headers. |
| Headers | `helmet()` defaults, `x-powered-by` disabled, CORS restricted to the configured origins. Frontend ships a CSP (`default-src 'self'`, fonts from Google only). |
| Error handling | Central error handler returns `{error: "internal_error"}` — no stack traces to clients. |
| Secrets | None in the repo. `.env.example` documents the optional `ANTHROPIC_API_KEY`; `.env` is git-ignored. |
| Data minimisation towards the LLM | Only an aggregate (merchant name, monthly amounts, saving, why-now sentence) is sent to Claude. **No transaction lines, no customer name other than first name, no account numbers.** The model may only rephrase facts; numbers come from the engine. Any failure or refusal falls back to the deterministic template, so the product never *depends* on the LLM. |
| Prompt injection | Facts are passed as a JSON blob inside `<feiten>` tags with a fixed system prompt; merchant strings come from KBC's own catalog, never from free-text transaction descriptions. |
| Determinism & auditability | `analyze(customer, asOf)` is a pure function: same data + same date → same insights. Every insight carries `dataPoints`, `confidence`, its `moments` and the source of the quality score — the "Waarom zie ik dit?" panel shows exactly that. |
| Dependencies | `npm audit` reports 0 vulnerabilities at submission time (see Aikido screenshots). |

## What production would need

- Real KBC authentication (Itsme / KBC Sign) instead of demo bearer tokens; short-lived session tokens.
- Persist consent + feedback in the customer profile with an audit trail (GDPR art. 7 — provable consent, art. 22 — the customer can always see why a suggestion was made and opt out).
- Run the engine inside KBC's data perimeter; the offer feed is the only external input and should be signed.
- Ranking must stay **provably neutral** towards KBC's own products (today: `partner` is display-only and unit-tested to have no ranking effect) — regulators will ask.
- Abuse monitoring on the feedback endpoints, and per-customer rate limits.
