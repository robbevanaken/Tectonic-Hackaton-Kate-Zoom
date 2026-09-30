# Kate Zoom demo video

A 2:11 English, KBC-branded ad and demo of Kate Zoom, plus four vertical cutdowns of 14–20 s (Energy, Insurance, Groceries, Streaming). The app screens are recorded from the real app; everything else is built in code with [Remotion](https://remotion.dev).

Output: `out/kate-zoom.mp4` (1920×1080) and `out/cut-*.mp4` (1080×1920), loudness-normalised to −14 LUFS.

## Storyline

| Part | What you see |
|---|---|
| Hook | Four everyday bills: "Paying too much? Cheaper. Just as good or better." |
| Kate Zoom | The KBC app and the Kate Zoom overview |
| Energy · Insurance · Groceries · Streaming | Per category: a B-roll shot, then the app plus a card comparing price **and** quality score |
| Switching | Per-field consent, a prefilled provider page, the request sent: "Zero forms" |
| Investing | Savings into ETFs via Bolero, with a 20-year projection |
| Scaling | Flywheel: partners → deals → switches → savings → Bolero; more KBC services plug in |
| Trust · Tech · Close | "You're on a good deal", one-tap off; the tested engine and security; "No stress, Kate it." |

The script (voice-over text and timing) lives in `src/script.ts`. The numbers on screen come from the running API (`scripts/facts.ts`).

## Rebuild

```bash
npm run dev                          # at the repo root: the app, needed for recording and facts
cd video && npm install
npx tsx scripts/record.ts            # app footage (Playwright, one clip per scene)
npx tsx scripts/facts.ts             # prices, scores, projection, test count
npx tsx scripts/gen-tts-eleven.ts    # voice-over: ElevenLabs, Matilda (~1 credit per character)
npx tsx scripts/gen-music-eleven.ts  # music: ElevenLabs Music (~900 credits per minute)
npx tsx scripts/gen-video.ts [--go]  # B-roll: Kling 3.0 via Higgsfield; prints the price, pays only with --go
npm run studio                       # preview
npm run render && npm run render:cuts
```

Keys go in the repo-root `.env`: `HF_KEY` (Higgsfield) and `ELEVENLABS_API_KEY`. Generated files are cached by prompt, so a re-run never pays twice. Generated assets and renders are gitignored.
