# Demo-draaiboek — Kate Zoom

Voor wie de demo geeft. Doel: in **max. 3 minuten** tonen dat KBC op het juiste moment het juiste zegt, dat de klant
met één tik overstapt, en dat de besparing daarna groeit bij KBC of Bolero.

Alle data is **fictief** (Thomas Janssens, Lien Vermeulen, voorbeeldadressen, `example.be`).

---

## 1. Voorbereiding (5 min vóór je begint)

```bash
cd tectonic-hackaton
npm install        # eenmalig
npm run dev        # API op :4000, app op http://localhost:5180
```

1. Open **http://localhost:5180** in Chrome. Op een laptop zie je de app in een telefoonframe.
2. Tandwiel links boven → *Demo* → **Thomas**, dan **Reset feedback & meldingen**. Demodatum staat dan op 30 sep.
3. Terug naar het startscherm: na ±1 seconde komt de push binnen. Lukt dat niet: stap 2 opnieuw.
4. Meldingen op je laptop uit, browser op 100%.

---

## 2. Het verhaal in één zin

> "KBC ziet al elke maand waar je geld naartoe gaat. Kate Zoom zegt je **op het juiste moment** dat je te veel betaalt,
> vult de overstap voor je in, en laat wat je bespaart **groeien bij KBC**."

---

## 3. De demo, stap voor stap (± 2:50)

| Tijd | Wat je doet | Wat je zegt |
|---|---|---|
| 0:00 | Startscherm, wacht op de push. | "Dit is de gewone KBC-app. Kijk wat Kate net stuurt." |
| 0:10 | Wijs de push aan: *Morgen komt je loon. 18% duurder dan vorig jaar.* | "Het is eind van de maand, het budget is krap. **Dat** is het moment dat een besparing welkom is, niet midden in de maand." |
| 0:20 | Tik op de push → detail. | "Engie €168, Bolt €129, en Bolt scoort zelfs beter. €468 per jaar. De grafiek toont hoe de prijs stilletjes steeg." |
| 0:35 | Wijs het blauwe cadeauvak aan. | "Een KBC-partnerdeal. Die tonen we, maar hij telt niet mee in de vergelijking." |
| 0:45 | Tik **Overstappen naar Bolt Energie**. Vink **Gsm** uit. | "De klant ziet wat Kate deelt en kiest zelf. Geen saldo, geen uitgaven. De link werkt één keer, tien minuten." |
| 1:00 | **Ga naar Bolt Energie** → voorwaarden aanvinken → **Aanvraag versturen** → **Terug naar KBC**. | "Alles is al ingevuld, zonder gsm-nummer. Van melding tot aanvraag in 30 seconden." |
| 1:15 | Terug → **Alle communicatie** (Kate Zoom-overzicht). | "Alle tips op één plek, elk met zijn moment: contract loopt af, net afgeschreven." |
| 1:25 | Tik op **Sony WH-1000XM5**. | "Ook fysieke aankopen. Negen dagen geleden gekocht voor €399, nu €329 bij Coolblue, en je kan nog retourneren." |
| 1:40 | Terug → tik op **Beleggen** bij *Al bespaard*. | "€131 al bespaard, en door de overstap van daarnet €636 per jaar." |
| 1:50 | Kies **Bolero** → **Wereld-ETF** → **20 jaar**. | "Beleg het: beheerd door KBC of zelf via Bolero. Na 20 jaar wordt dat zoveel." (lees het groene bedrag voor) |
| 2:05 | **Start beleggingsplan via Bolero**. | "Besparen wordt beleggen, en het geld blijft in de KBC-groep." |
| 2:10 | Tandwiel → *Demodatum* **10 sep**. Terug naar start. | "Midden in de maand. Kate heeft dezelfde tips, maar zwijgt. Geen push." |
| 2:25 | Tandwiel → *Demo* → **Lien**. | "Lien zit al goed: geen push, en Kate zegt gewoon 'hier zit je goed'." |
| 2:40 | Tandwiel → toggle **Kate Zoom** uit. | "En één tik om alles uit te zetten. Dan wist Kate haar gegevens." |
| 2:50 | Afsluiten. | "Kate Zoom. No stress, Kate it." |

---

## 4. Beslissingen die we in de demo vertellen

Dit zijn de keuzes die ons onderscheiden. Noem er minstens vier.

| Beslissing | Waarom | Waar zie je het |
|---|---|---|
| **Organische meldingen.** Zachte tips (prijs stijgt, seizoen, dubbele abonnementen) wachten tot de laatste 5 dagen vóór *jouw* loon. Kate haalt de loondag uit je eigen loonstortingen. | Eind van de maand is het budget krap: dan is een besparing het meest welkom en het minst storend. | Push "Morgen komt je loon" · demodatum 10 vs 30 sep |
| **Dringende tips gaan meteen.** Contract loopt af, net afgeschreven, retour nog mogelijk. | Die kans is weg als je wacht. | 15 sep: Telenet-melding |
| **Geen moment, geen melding.** Max. 1 per week, pas vanaf €50. | Een melding moet welkom zijn, anders zet de klant ze uit. | Lien krijgt niets |
| **Nooit goedkoper maar slechter.** Een alternatief mag max. 0,3 lager scoren. | Vertrouwen: Kate is geen reclamezuil. | Telenet → Orange, niet Scarlet |
| **De marge beleggen.** Wat Kate Zoom bespaart, wordt bijgehouden en kan met één knop belegd worden, eenmalig en maandelijks. | Besparen voelt pas echt als je het ziet groeien. Voor KBC: nieuwe beleggers en een terugkerende inleg. | *Al bespaard* → Beleggen |
| **KBC of Bolero.** Beheerd volgens profiel, of zelf in ETF's via Bolero. | Elke klant belegt anders; beide blijven in de KBC-groep. | Beleggen-scherm |
| **Partnerdeals, maar neutraal.** KBC onderhandelt kortingen met leveranciers en winkels; die worden getoond maar tellen niet mee in de ranking. | Businessmodel voor KBC (vergoeding per overstap) zonder het vertrouwen te verliezen. | Cadeauvak bij Bolt en Coolblue |
| **Voorinvullen met toestemming per veld.** Eenmalige link, 10 minuten, enkel aangevinkte velden. | Frictie weg, privacy intact. | Delen-scherm |
| **Fysieke aankopen via het kasticket.** Zelfde EAN-code, enkel binnen de retourtermijn, enkel bij betrouwbare verkopers. | Bankdata alleen zegt niet wat je kocht. | Sony-koptelefoon |
| **Analyse is deterministisch, AI schrijft enkel de zin.** | Uitlegbaar en testbaar; AI-tekst wordt gelabeld (AI Act). | *Waarom zie ik dit?* |
| **Privacy by design.** Opt-in, uitzetten wist alles, download je gegevens. | AVG, en vertrouwen van de klant. | Instellingen |

## 5. Het businessmodel (voor vragen van de jury)

- **Klant:** bespaart zonder zelf te vergelijken of formulieren in te vullen.
- **KBC:** meer betrokkenheid in de app, en de besparing stroomt naar KBC-beleggingen of Bolero.
- **Partners:** KBC sluit samenwerkingen met leveranciers en winkels. Die bieden een exclusieve korting aan KBC-klanten
  en betalen per overstap. Een vooringevulde, toegestemde lead converteert veel beter dan een advertentie.
- **Neutraliteit:** partnerdeals tellen niet mee in de ranking (getest in de code).

## 6. Veiligheid en wetgeving (10% van de score)

Kort te vertellen, details in [SECURITY.md](SECURITY.md) en [docs/LEGAL.md](docs/LEGAL.md):

- AVG: opt-in, uitzetten wist alles, gegevens downloaden, enkel aangevinkte velden gaan naar een aanbieder.
- MiFID II: beleggen is een simulatie met risicowaarschuwing, geen advies.
- Consumentenrecht: KBC-producten en partnerdeals gelabeld, geen voorkeur in de ranking.
- AI Act: AI-tekst gelabeld, de analyse zelf is geen AI.
- Techniek: eenmalige tokens, rate limits, strikte headers, demo-logins werken niet in productie, CI met CodeQL,
  Dependabot en vastgepinde GitHub Actions, 0 kwetsbaarheden in `npm audit`, 16 tests.

## 7. Veelgestelde vragen

| Vraag | Antwoord |
|---|---|
| Hoe weet KBC wat voor product er gekocht werd? | Via het **digitaal kasticket** (Kate Wallet). Zonder kasticket geen producttip. |
| Waar komen prijzen en scores vandaan? | In de demo fictief. In productie een feed van vergelijkers en partners. |
| Hoe weet Kate wanneer mijn loon komt? | Uit je eigen loonstortingen: de dag waarop die meestal binnenkomt. |
| Wordt de klant niet overspoeld? | Max. 1 per week, vanaf €50, en enkel op een goed moment. |
| Is het beleggen advies? | Nee. Via KBC loopt het langs de beleggersvragenlijst; via Bolero belegt de klant zelf. |

## 8. Knoppen buiten de demo

Alle knoppen werken. Pagina's die niet bij Kate Zoom horen (MyHome, Mijn KBC, Overschrijven, rekeningen…) tonen
"Deze pagina bestaat voor demo-doeleinden" met een knop terug naar Kate Zoom. *Beleggen* in de onderste balk opent
het beleg-scherm van Kate Zoom, het belletje opent het Kate Zoom-overzicht.

## 9. Als er iets misgaat

| Probleem | Oplossing |
|---|---|
| Geen pushmelding | Tandwiel → *Reset feedback & meldingen*, terug naar start. Check dat de demodatum op 30 sep staat. |
| Rode balk "API niet bereikbaar" | `npm run dev` herstarten. |
| "Link niet meer geldig" | Dat is de beveiliging (eenmalige link). Terug en opnieuw via *Overstappen naar*. Gerust tonen bij het security-verhaal. |
| Tip staat al op "Aangevraagd" | Reset (zie hierboven). |
| Kate Zoom staat uit | Toggle terug aan, dan Reset (uitzetten wist de gegevens, ook in de demo). |
