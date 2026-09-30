# Security — Kate Zoom

Kate Zoom handles the most sensitive data a bank has: what people spend their money on. Security and privacy were design
constraints from the first commit, not a layer added afterwards. This document lists what is in place, how it was
verified, and what a production rollout at KBC would add.

Legal and compliance (GDPR, MiFID II, consumer law, AI Act, PSD2) are covered in [docs/LEGAL.md](docs/LEGAL.md).

## Verification (30 Sept 2026)

| Check | Tool | Result |
|---|---|---|
| Known vulnerabilities in dependencies | `npm audit` | **0** |
| Static analysis (JS/TS, React, Node, Express, OWASP Top 10) | Semgrep 1.178 | **0 findings** |
| Secrets in code and full git history | Semgrep `p/secrets` + `p/gitleaks`, history grep | **0** |
| CI / supply-chain configuration | Semgrep `p/github-actions` | **0 findings** |
| Dependency licences | license-checker | MIT, ISC, Apache-2.0, BSD only; no copyleft |
| Unit and HTTP tests (incl. security behaviour) | `node:test` | **21 / 21 pass** |
| Runtime behaviour | manual probes, see below | as expected |

Runtime probes against the running API:

| Request | Response |
|---|---|
| No or unknown bearer token | `401` |
| Malformed JSON | `400` |
| Body over 10 kB | `413` |
| Non-JSON content type | `422` |
| Unknown route | `404` JSON, no stack trace |
| Reused or expired handoff token | `410` |
| Invest more than Kate Zoom actually saved | `422` |
| Prototype-pollution style option (`__proto__`) | `422` |
| 25 token redemptions in one minute | `429` from call 21 |
| Request from a foreign origin | no CORS permission |

## Controls

### Identity and access

- Every customer route lives under `/api/me` and is **scoped to the bearer token's own customer**. No customer id
  ever appears in a URL or body, so there is nothing to tamper with (no IDOR by construction).
- Tokens are compared in **constant time** (`timingSafeEqual` over SHA-256 digests) and capped in length.
- **Demo logins do not exist in production.** With `NODE_ENV=production` every demo token is rejected, and the demo-only
  routes (`/reset`, `/demo-date`) answer `404`. Tested.
- Analysis routes require **explicit consent**; without it they return `403 consent_required`.

### Input and output

- Every body, parameter and query value is validated with **Zod** schemas: enums for actions, strict regexes for ids
  and tokens, numeric ranges for amounts. Unknown investment options are rejected against an allow-list.
- Bodies are **JSON only, max 10 kB**, read by our own strict reader (`apps/api/src/json-body.ts`, tested at HTTP level):
  the byte count is enforced while streaming, also without a `Content-Length`, and only JSON objects or arrays are accepted.
- React escapes all output; there is no `dangerouslySetInnerHTML` anywhere. LLM output is rendered as plain text.

### Transport and headers

- **API:** Helmet with a JSON-only CSP (`default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action
  'none'`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, HSTS,
  `Cross-Origin-Resource-Policy: same-origin`, `Permissions-Policy` denying camera, microphone, location, payment and USB.
- **Every `/api/me` response** is `Cache-Control: no-store`: financial data never lands in a browser or proxy cache.
- **CORS** allows only configured origins, only `GET`/`POST`, only the `Authorization` and `Content-Type` headers.
- **Web app:** CSP (`default-src 'self'`, no inline scripts, `object-src 'none'`, `base-uri 'none'`), no referrer, and
  the same hardening headers on the dev and preview servers. No source maps in production builds.

### Abuse resistance

- **Rate limits:** 120 requests per minute per IP overall; 20 per minute on token redemption, data sharing, investing
  and data export.
- **Server timeouts** against slow-request attacks: headers 10 s, request 15 s, keep-alive 5 s.
- The API binds to `127.0.0.1` by default and trusts `X-Forwarded-For` only when `TRUST_PROXY=1` is set, so rate
  limiting cannot be bypassed with spoofed headers.
- Errors are logged by **class name only**, never with request data, and clients only ever see a generic error code.

### Sharing data with providers (the handoff)

- The customer sees every field before anything is shared and can untick optional ones. Required fields are enforced
  on the server.
- Kate creates a **single-use token** (192 bits from `crypto.randomBytes`) that **expires after 10 minutes** and
  carries only the approved fields. Redeeming twice or late returns `410`. Expired tokens are purged.
- Balances, transactions and spending are **never** part of a handoff. Tested.
- Withdrawing consent **revokes every open link** immediately.

### Privacy by design

- Opt-in only. Switching Kate Zoom off **erases** its feedback, notifications and savings ledger (tested). Bank records,
  which KBC must retain by law, are untouched.
- `GET /api/me/export` gives the customer everything Kate Zoom holds, as JSON.
- Only fixed costs and receipts are compared; personal purchases elsewhere are not analysed.

### The AI layer

- The analysis is **deterministic code**, not a model: same data, same date, same result. That makes it testable and
  explainable ("Waarom zie ik dit?").
- Claude only rewrites one sentence. It receives **aggregates only**: merchant names, amounts and the reason. It gets no
  customer name, no account number and no transaction lines.
- Facts are passed as structured JSON with a fixed system prompt. Merchant strings come from KBC's own catalogue, never
  from free-text payment descriptions, which closes the prompt-injection path.
- On any error or refusal the deterministic sentence is used, so the product never depends on the model. AI text is
  labelled as such in the app.

### Supply chain

- **CI** runs typecheck, tests, build, `npm audit` and **Semgrep** on every push; **CodeQL** (`security-extended`)
  on every push and weekly.
- All GitHub Actions are **pinned to commit SHAs**, run with `permissions: contents: read` and
  `persist-credentials: false`; installs use `npm ci --ignore-scripts`.
- **Dependabot** covers npm and Actions, with a **7-day cooldown** so a freshly published (possibly compromised)
  release is never adopted on day one.
- Dependencies are on current major versions (Express 5, Vite 8, React 19, Zod 4), with a committed lockfile.
- No secrets in the repository; `.env` is git-ignored and `.env.example` holds no values.

## Known dependency findings

| Finding | Status |
|---|---|
| `raw-body` 3.0.2 (via Express → body-parser): an invalid `limit` value silently disables the size check (DoS, low) | **Not reachable.** The fix only exists in `raw-body` 4, which `body-parser` 2.x does not support yet: forcing it breaks every request (tested). We therefore no longer use `express.json()` at all; our own reader in `json-body.ts` never calls `raw-body`, and its limit is a fixed number. Dependabot will pick up a compatible `body-parser` release. |

## Threat model (summary)

| Threat | Mitigation |
|---|---|
| Customer A reads customer B's data | Token-scoped routes, no ids in URLs |
| Stolen handoff link | Single use, 10 minutes, only approved fields, revoked on consent withdrawal |
| Brute-forcing tokens | 192-bit tokens, 20 req/min limit, constant-time comparison |
| Kate pushes a biased or paid offer | Partner deals shown but excluded from ranking (tested), sources shown |
| Prompt injection via payment descriptions | LLM never sees free text; facts only; deterministic fallback |
| Leaking data via caches, referrers or errors | `no-store`, `no-referrer`, generic errors, no PII in logs |
| Malicious dependency update | Lockfile, `--ignore-scripts`, pinned actions, Dependabot cooldown, audit and SAST in CI |
| Demo shortcuts reaching production | Demo auth and demo routes disabled when `NODE_ENV=production` |

## What production at KBC would add

- KBC's own authentication (itsme / KBC Sign) with short-lived sessions instead of demo tokens.
- The handoff as a server-to-server call (mutual TLS or signed JWT) to allow-listed partners, instead of a token in
  the browser.
- Consent, feedback and savings persisted with an audit trail inside KBC's data perimeter.
- Runtime protection (WAF / RASP) and central security monitoring.
- MiFID suitability check before any investment order.

## Reporting a vulnerability

Please do not open a public issue. Contact the maintainers through the GitHub profile with steps to reproduce; we reply
within 72 hours.
