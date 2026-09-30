# Demo-draaiboek — Kate Zoom

Voor wie de demo geeft. Doel: in **max. 3 minuten** tonen dat KBC op het juiste moment het juiste zegt, dat de klant
met één tik kan overstappen, en dat de besparing daarna gaat groeien bij KBC.

Alle data is **fictief** (Thomas Janssens, Lien Vermeulen, voorbeeldadressen, `example.be`).

---

## 1. Voorbereiding (5 min vóór je begint)

```bash
cd tectonic-hackaton
npm install        # eenmalig
npm run dev        # API op :4000, app op http://localhost:5180
```

1. Open **http://localhost:5180** in Chrome. Op een laptop zie je de app in een telefoonframe.
   Wil je hem op volledig scherm: DevTools → toestelmodus → iPhone 14 Pro.
2. Controleer dat je persona **Thomas** actief is (tandwiel links boven → *Demo* → Thomas).
3. Klik in datzelfde scherm op **Reset feedback & meldingen**. Dan start alles schoon en komt de pushmelding opnieuw.
4. Ga terug naar het startscherm. Na ±1 seconde glijdt de pushmelding binnen. Lukt dat niet: stap 3 opnieuw.
5. Zet meldingen op je laptop uit en zoom de browser op 100%.

> Tip: laat de `npm run dev`-terminal open maar buiten beeld. Bij een rode foutbalk bovenaan draait de API niet.

---

## 2. Het verhaal in één zin

> "KBC ziet al elke maand waar je geld naartoe gaat. Kate Zoom gebruikt dat om je op **het juiste moment** te vertellen
> dat je te veel betaalt, vult de overstap voor je in, en laat wat je bespaart **groeien bij KBC**."

---

## 3. De demo, stap voor stap (± 2:45)

| Tijd | Wat je doet | Wat je zegt |
|---|---|---|
| 0:00 | Startscherm, wacht op de push "Bespaar zo'n € 468 per jaar". | "Dit is de gewone KBC-app. Kijk wat Kate net stuurt." |
| 0:10 | Wijs de reden in de push aan: *18% meer dan in het begin*. | "Engie is stilletjes van €142 naar €168 gegaan, en de winter komt eraan. **Dat** is het moment." |
| 0:20 | Tik op de push → detailscherm. Scroll langzaam. | "Engie €168, Bolt €129, en Bolt scoort zelfs beter bij Test Aankoop. €468 per jaar. Onderaan zie je 14 maanden aan facturen." |
| 0:35 | Wijs het blauwe vak **KBC-klantendeal** aan. | "KBC onderhandelt extra deals met partners. Die tonen we eerlijk, maar ze tellen niet mee in de vergelijking." |
| 0:45 | Open **Waarom zie ik dit?** | "Alles is uitlegbaar: 14 betalingen, 90% zekerheid, nooit iets goedkopers dat slechter is, max. 1 melding per week." |
| 0:55 | Tik **Overstappen naar Bolt Energie**. | "En nu het mooiste: de klant hoeft niets te typen." |
| 1:00 | Toestemmingsscherm. **Vink 'Gsm' uit.** | "Kate toont wat ze deelt: naam, adres, EAN-code. De klant kiest. Bolt ziet niets van je rekeningen of uitgaven. De link werkt één keer, 10 minuten." |
| 1:15 | Tik **Ga naar Bolt Energie**. | "Dit is de pagina van de leverancier, alles al ingevuld. Het gsm-nummer staat er niet, want dat vinkten we uit." |
| 1:25 | Vink de voorwaarden aan → **Aanvraag versturen** → **Terug naar KBC**. | "Klaar. Van melding tot aanvraag in 30 seconden." |
| 1:35 | Terug (pijltje links) → **Kate Zoom-overzicht**. | "Hier alles op één plek: €1.317 aan tips, elk met zijn eigen moment: contract loopt af, net afgeschreven." |
| 1:50 | Scroll naar **Sony WH-1000XM5** en tik erop. | "Niet alleen abonnementen. Thomas kocht 9 dagen geleden een koptelefoon van €399. Coolblue heeft exact hetzelfde model (zelfde EAN) voor €329, en hij kan nog 21 dagen retourneren." |
| 2:05 | Terug → tik op de kaart **Al bespaard met Kate Zoom**. | "Wat al bespaard is, verdwijnt normaal ongemerkt. Hier zie je: €131 al bespaard, en door de overstap van daarnet €636 per jaar." |
| 2:15 | Kies **Dynamisch**, dan **20 jaar**. | "Beleg het bij KBC: eenmalig wat je bespaarde, en elke maand automatisch je besparing. Na 20 jaar wordt dat zoveel." (lees het groene bedrag voor) |
| 2:30 | Tik **Start beleggingsplan bij KBC**. | "Besparen wordt beleggen. Goed voor de klant, en het geld blijft bij KBC." |
| 2:35 | Tandwiel → *Demo* → **Lien**. | "Lien zit al goed. Geen push, en Kate zegt gewoon: hier zit je goed. Soms is zwijgen het juiste moment." |
| 2:45 | Afsluiten. | "Kate Zoom. No stress, Kate it." |

---

## 4. Het businessmodel (voor vragen van de jury)

- **Klant:** bespaart gemiddeld honderden euro's per jaar, zonder zelf te vergelijken of formulieren in te vullen.
- **KBC:** meer betrokkenheid in de app, en de besparing stroomt naar KBC-beleggingen (nieuwe beleggers, recurrente inleg).
- **Partners:** KBC sluit samenwerkingen met leveranciers en winkels (energie, telecom, retail). Die bieden een
  exclusieve korting aan KBC-klanten en betalen een vergoeding per overstap. Omdat Kate de klant al voorinvult,
  converteert zo'n lead veel beter dan een advertentie.
- **Neutraliteit:** partnerdeals worden getoond, maar tellen niet mee in de ranking. De vergelijking blijft op prijs en
  kwaliteit (dit is getest in de code). Anders verliest Kate het vertrouwen van de klant.

## 5. Veelgestelde vragen

| Vraag | Antwoord |
|---|---|
| Hoe weet KBC wat voor product er gekocht werd? | Bankdata alleen zegt dat niet. Dat komt van een **digitaal kasticket** (via Kate Wallet). Zonder kasticket geen producttip. |
| Waar komen de prijzen en kwaliteitsscores vandaan? | In de demo zijn ze fictief. In productie is dat een feed van vergelijkers (Test Aankoop, prijsvergelijkers) en partners. |
| Wat met privacy? | Opt-in, altijd uit te zetten. Transacties blijven bij KBC. Een aanbieder krijgt enkel wat de klant aanvinkt, via een eenmalige link van 10 minuten. |
| Wordt de klant niet overspoeld? | Max. 1 melding per week, enkel bij minstens €50 besparing, en **enkel** als er een goed moment is. Anders wacht de tip in Kate Zoom. |
| Is het beleggen advies? | Nee, een simulatie. In productie loopt het via de beleggersvragenlijst (MiFID) van KBC. |
| Waar zit de AI? | De analyse is bewust deterministisch en uitlegbaar. Claude schrijft enkel de tekst in Kate's stem, op basis van de feiten van de engine. Zonder API-sleutel werkt alles met vaste sjablonen. |

## 6. Als er iets misgaat

| Probleem | Oplossing |
|---|---|
| Geen pushmelding | Tandwiel → *Reset feedback & meldingen*, terug naar start. |
| Rode balk "API niet bereikbaar" | `npm run dev` herstarten. |
| Leverancierspagina zegt "link niet meer geldig" | Dat is de beveiliging (eenmalige link). Terug, en opnieuw via *Overstappen naar*. Tip: toon dit gerust als je over security praat. |
| Tip staat al op "afgehandeld" | Reset (zie hierboven). |
| Poort 5180 bezet | Andere Vite-server stoppen, of poort aanpassen in `apps/web/vite.config.ts`. |
