# Legal & compliance — Kate Zoom

How the prototype maps to the rules a Belgian bank has to follow. This is a hackathon prototype, not legal advice; a production launch goes through KBC Legal, Compliance and the DPO.

| Rule | What it asks | How Kate Zoom handles it | Where |
|---|---|---|---|
| **GDPR art. 6.1(a), 7** — consent | Freely given, specific, withdrawable at any time, as easy to withdraw as to give | Kate Zoom is **opt-in** with one toggle. Without consent every analysis route returns `403 consent_required`. | Settings → toggle · `requireConsent` in `routes/me.ts` |
| **GDPR art. 7(3), 17** — withdrawal and erasure | Withdrawing consent stops processing; derived data is erased | Switching off calls `eraseKateData()`: feedback, notifications and the savings ledger are wiped, open handoff links are revoked. Bank records stay (legal retention). | `engine/privacy.ts` · tested |
| **GDPR art. 15, 20** — access and portability | Customer can get their data in a machine-readable format | **Download mijn gegevens** returns a JSON export with purpose, legal basis and all Kate Zoom data. | Settings · `GET /api/me/export` |
| **GDPR art. 5.1(c), 25** — data minimisation, privacy by design | Only process what is needed | Only fixed costs and receipts are compared. Providers receive only fields the customer ticks; balances and transactions are never shared (tested). The LLM gets aggregates only: no name, no account data. | `engine/handoff.ts` · `engine/kate.ts` |
| **GDPR art. 13, 22** — transparency on automated decisions | Explain the logic; no solely automated decisions with legal effect | Every tip has "Waarom zie ik dit?" (payments used, confidence, timing reasons). Kate never switches, buys or invests on her own: the customer confirms every step and signs at the provider. | Insight detail |
| **ePrivacy / push notifications** | Marketing messages need consent | Pushes only with Kate Zoom consent, max. 1 per week, never the same tip twice, snooze/dismiss honoured. | `pickNotification()` |
| **Unfair Commercial Practices Directive (2005/29/EC), Belgian WER boek VI** | No misleading comparisons; disclose commercial relationships | Ranking uses price and quality only. KBC products and partner deals are **labelled** and get **no ranking boost** (tested). Every price and score shows its source. | `engine/match.ts` · detail screen |
| **MiFID II** — investment services | Suitability test before advice; clear risk warnings; no guaranteed returns | The invest screen is a **simulation, not advice**, with a risk warning. A real order goes through KBC's investor questionnaire (KBC) or is execution-only (Bolero). Amounts are capped server-side at what was actually saved. | Invest screen · `POST /api/me/invest` |
| **EU AI Act, art. 50** — transparency | People must know when text is AI-generated | When Claude writes Kate's line, the detail screen says "Tekst door AI (Claude)". The analysis itself is deterministic and not AI. The system does no credit scoring, so it is not a high-risk system. | Insight detail · `engine/kate.ts` |
| **PSD2** | Third parties need a licence to access account data | Not applicable to the core: KBC analyses its **own** customers' data inside the bank. No data leaves KBC except the fields the customer approves in a handoff. | Architecture |
| **Belgian Easy Switch (telecom, 2021)** | Operator switching with an Easy Switch-ID | The telecom handoff passes the Easy Switch-ID so the new operator can terminate the old contract. | `engine/handoff.ts` |
| **DORA / security of ICT** | Secure development, third-party risk | See [SECURITY.md](../SECURITY.md): scoped auth, validation, rate limits, headers, pinned CI, CodeQL, Dependabot, audit clean. | Repo |

## Demo data

All customers, addresses, e-mail addresses (`example.be`), phone numbers, EAN codes and IDs in this repository are **fictional**. Prices, quality scores and partner deals are illustrative and do not describe real offers.
