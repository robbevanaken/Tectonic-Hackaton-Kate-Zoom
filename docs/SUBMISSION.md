# Submission — Kate Zoom

## Short description (paste into the form)

**Kate Zoom** is a module inside the KBC Mobile app that turns a customer's own transactions into a personal price-watch, and turns what it saves into investments at KBC.

It builds a spending profile from the customer's payments (energy, internet, mobile, insurance, groceries, fuel, streaming) and from digital receipts for physical purchases. Kate only speaks up when three things are true at once: there is a cheaper alternative of *comparable quality*, the saving is worth an interruption, and it is *the right moment*: the bill just crept up, the contract turns one year old, the debit just landed, winter is coming, subscriptions overlap, or the headphones you bought 9 days ago are €70 cheaper elsewhere while you can still return them. No moment, no push.

Switching takes one tap. Kate shows exactly which details she will share (name, address, EAN code…), the customer unticks what they want, and the provider's page opens prefilled through a single-use, 10-minute link. Providers never see balances or spending. Everything Kate Zoom saves is tracked, and with one button the customer invests it in a KBC risk profile, with a live projection of what it grows to.

KBC can partner with providers and retailers for exclusive customer deals. Those are shown transparently but never change the ranking: the comparison stays on price and quality, which keeps Kate trustworthy.

Everything is explainable ("Waarom zie ik dit?"), opt-in, and capped at one push a week. Two fictional personas show adaptivity: Thomas gets a €468/year energy push and eight timed tips; Lien, who already has good deals, gets no push and a "Hier zit je goed" list.

Stack: TypeScript end to end. Express API with a pure, unit-tested engine (12 tests); React + Tailwind mock in KBC's existing UX; zod validation, helmet, CSP, rate limiting, bearer-scoped routes, single-use handoff tokens, 0 npm audit findings. Claude optionally writes Kate's wording, strictly from the engine's facts.

## Judging map

| Criterion | Where |
|---|---|
| Originality (30%) | Timing as a ranking signal and a hard push condition, quality parity rule, receipt-based purchase tips inside the return window, consented prefill handoff, savings-to-investment loop, "you're already fine" state. |
| Technical ability (30%) | Pure engine with 12 unit tests, deterministic synthetic data, ranking formula, feedback loop, token-based handoff, compounding projection, optional LLM layer with facts-only prompt and fallback, KBC-faithful UI with zero overflow at 375px. |
| Applicability (30%) | Built into the KBC app and Kate, uses data KBC already has, creates investment inflow and partner revenue for KBC, GDPR-aware (consent, explanation, field-level sharing, opt-out). |
| Security (10%) | SECURITY.md: scoped auth, consent gate, validation, headers, rate limit, single-use tokens, data minimisation, no secrets, audit clean. |

## Video script (< 3 min)

Follow **[DEMO.md](../DEMO.md)** section 3; it is timed for 2:45. Suggested voice-over hooks:

- **Open (0:00):** "KBC already sees where every customer's money goes. What if Kate used that to tell you, at exactly the right moment, that you're paying too much?"
- **Handoff (1:00):** "The customer types nothing. Kate prefills the provider's page with only what the customer approves, through a link that works once."
- **Purchase (1:50):** "Not just subscriptions: same headphones, same barcode, €70 cheaper, and you can still return them."
- **Invest (2:05):** "Saving becomes investing. Good for the customer, and the money stays at KBC."
- **Close (2:45):** "Kate Zoom. No stress, Kate it."

End with a 5-second flash of the engine folder, `npm test` passing, and SECURITY.md.

## Checklist

- [ ] Make the GitHub repo **public**: `gh repo edit robbevanaken/tectonic-hackaton --visibility public --accept-visibility-change-consequences`
- [ ] Record the video with DEMO.md, upload, paste the link
- [ ] Run the repo through Aikido, upload the screenshots
- [ ] Paste the short description above
