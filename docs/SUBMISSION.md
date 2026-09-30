# Submission — Kate Switch

## Short description (paste into the form)

**Kate Switch** is a module inside the KBC Mobile app that turns a customer's own transaction history into a personal price-watch. It builds a recurring-spend profile (energy, internet, mobile, insurance, groceries, fuel, streaming), compares every fixed cost with the market, and only nudges the customer when three things are true at once: there is a cheaper alternative of *comparable quality*, the saving is worth an interruption, and it is *the right moment* — the bill just crept up, the contract turns one year old, the debit just landed, winter is coming, or subscriptions overlap.

The engine is deterministic and explainable: every tip shows how many payments it is based on, its confidence, the timing reason, and the independent quality source. Suggestions with a lower quality score are never shown, KBC's own products get no ranking boost, pushes are capped at one per week, and the customer can snooze, dismiss or switch Kate Switch off entirely (consent-first). Kate writes the message in her own voice (Claude), strictly from the engine's facts, with a template fallback so the feature never depends on the LLM.

Two demo personas show adaptivity: Thomas gets a push worth €468/year on energy (price creep + season) and an overview of €1.715/year in timed tips; Lien, who already has good deals, gets no push and a "Hier zit je goed" list.

Stack: TypeScript end-to-end — Express API with a pure, unit-tested analysis engine; React + Tailwind mock of the KBC app in KBC's UX; zod validation, helmet, CSP, rate limiting, bearer-scoped routes, 0 npm audit findings.

## Judging map

| Criterion | Where |
|---|---|
| Originality (30%) | Timing as a first-class ranking signal ("moments"), quality parity rule, explicit notification policy, "you're already fine" state, partner neutrality. |
| Technical ability (30%) | Pure engine with 9 unit tests, deterministic synthetic data, ranking formula, feedback loop, optional LLM layer with fact-only prompt + fallback, KBC-faithful UI. |
| Applicability (30%) | Built inside the KBC app UX, uses data KBC already has, extends Kate, GDPR-aware (consent, explanation, opt-out). |
| Security (10%) | SECURITY.md: scoped auth, validation, headers, rate limit, data minimisation, no secrets, audit clean. |

## Video script (< 3 min)

**0:00 – 0:20 — Hook.** *"KBC sees where every customer spends money each month: energy, telecom, groceries. What if Kate used that to tell you, at exactly the right moment, that you're paying too much — without ever nagging?"*

**0:20 – 0:50 — The push.** Open the app as Thomas. Push slides in: *"Bespaar zo'n €468 per jaar — je betaalt 18% meer dan in het begin."* *"Kate noticed Engie crept from €142 to €168 and that winter is coming. That's the moment."* Tap.

**0:50 – 1:30 — The insight.** Show Engie → Bolt: €168 vs €129, quality 4,1 vs 4,3 (Test Aankoop), €468/year, chart of 14 months with the creep. Open *Waarom zie ik dit?*: 14 payments, 90% confidence, the rules (no worse quality, 1 push a week, opt-out). *"Everything is explainable. Kate never shows something cheaper but worse."* Tap **Later** → it parks.

**1:30 – 2:05 — The overview.** Back to Kate Switch: €1.715/year across 7 tips, each with its timing pill — Telenet: contract ends + just debited; 3 streaming services; Delhaize → Colruyt via price index. Scroll to *Waar je geld naartoe gaat*.

**2:05 – 2:35 — Adaptivity + trust.** Settings: consent toggle + notification policy text. Switch to Lien: no push, *"Hier zit je goed"* for energy, groceries, fuel. *"Same engine, different customer, different behaviour — including silence."* Toggle consent off → 403, module empty.

**2:35 – 2:55 — Under the hood.** 5-second flash of the engine folder + tests passing + SECURITY.md. *"Pure TypeScript engine, unit-tested, bearer-scoped API, zero audit findings. Kate writes the words with Claude, but only from the engine's facts."*

**2:55 – 3:00 — Close.** *"Kate Switch. No stress. Kate it."*

## Checklist

- [ ] Make the GitHub repo **public** (`gh repo edit thomasvanaken/tectonic-hackaton --visibility public --accept-visibility-change-consequences`)
- [ ] Record the video (script above), upload, paste link
- [ ] Run the repo through Aikido, upload screenshots
- [ ] Paste the short description
