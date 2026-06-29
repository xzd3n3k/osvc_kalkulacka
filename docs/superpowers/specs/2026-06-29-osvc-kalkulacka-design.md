# OSVČ kalkulačka — návrh (design spec)

**Datum:** 2026-06-29
**Stav:** schváleno k sepsání plánu
**Rozsah v1:** OSVČ na **hlavní činnost**, neplátce i plátce DPH (přepínač), roky 2025 a 2026.

---

## 1. Účel

Webová aplikace, která pro zadaný roční obrat (a volitelně skutečné výdaje) spočítá a **přehledně vedle sebe** ukáže odvody (daň z příjmů, sociální, zdravotní), odvody celkem a čistý zbytek pro **všechny daňové režimy**, aby si uživatel vybral nejvýhodnější. Legislativní hodnoty se udržují ve verzovaném configu (zdroj pravdy) a samostatná stránka je transparentně zobrazuje včetně zdrojů a dat účinnosti.

Motivace: uživatel si dříve vedl excelovou tabulku, ale měnící se legislativa (sazby, minima, pásma) ji činila neudržitelnou.

### Klíčové korekce oproti původnímu předpokladu uživatele
- **Snížené minimum pro začínající OSVČ (rok zahájení + 2 následující) platí JEN pro sociální pojištění.** U **zdravotního pojištění žádná úleva pro začátečníky neexistuje** — nová OSVČ na hlavní činnost platí plné minimum od prvního měsíce.
- **Paušální daň 1. pásmo 2026:** nominálně vyhlášeno 9 984 Kč/měs, ale novelou se zpětně snižuje na **9 162 Kč/měs**. Kalkulačka používá efektivních **9 162 Kč** s vysvětlivkou.

---

## 2. Rozhodnutí (potvrzená s uživatelem)

| Téma | Rozhodnutí |
|---|---|
| Aktualizace dat | Verzovaný config = zdroj pravdy; auto-update jen **navrhuje** změny (PR), člověk schvaluje. |
| Rozsah činnosti | Jen **hlavní** činnost (vč. snížených minim pro začínající). Vedlejší = později. |
| Stack | Next.js 16 (App Router) + Tailwind v4 + TypeScript. |
| Hosting | Lokálně first (`pnpm dev`); GitHub + Vercel + auto-update pipeline později. |
| Zobrazení výsledků | **Srovnávací tabulka** (na mobilu karty), nejvýhodnější zvýrazněná, rozklikávací detail. |
| Slevy na děti | Volitelný vstup (daňové zvýhodnění). |
| DPH | Přepínač „plátce DPH" — hlavně vypíná způsobilost pro paušální daň. |
| Roky | Config 2025 + 2026, default 2026, přepínač. Každý rok se musí udržovat ručně/přes návrh. |

---

## 3. Architektura — 4 vrstvy

```
1. LEGISLATIVNÍ CONFIG (zdroj pravdy)
   lib/legislation/{2025,2026}.ts  + Zod schema
   každá hodnota: number + zdroj URL + "platí od" + vysvětlivka + datum ověření
        │ čte
2. VÝPOČETNÍ ENGINE (čisté funkce, 100% testované, TDD)
   vstup → výsledek pro KAŽDÝ režim; žádné UI, žádné I/O
        │
3. UI (Next.js 16 App Router)
   /             Kalkulačka (formulář + srovnávací tabulka)
   /legislativa  Přehled platných pravidel + zdroje
        
4. AUTO-UPDATE (později): Vercel Cron → LLM rešerše → GitHub PR → člověk schválí
```

Princip: **config je vždy správný a otestovaný; auto-update jen navrhuje, člověk schvaluje** → bezpečné i kdyby se rešerše spletla.

### Navržená struktura souborů
```
osvc-kalkulacka/
  app/
    layout.tsx
    page.tsx                  # Kalkulačka
    legislativa/page.tsx      # Přehled legislativy
  lib/
    legislation/
      schema.ts               # Zod schema roku + typy
      2025.ts
      2026.ts
      index.ts                # registry getLegislation(year), dostupné roky
    calc/
      types.ts                # Inputs, RegimeResult, CalcOutput
      engine.ts               # orchestrace: vstup → výsledky všech režimů + pořadí
      income-tax.ts           # daň z příjmů (15/23 %, sleva, děti)
      social.ts               # sociální pojištění
      health.ts               # zdravotní pojištění
      pausalni-dan.ts         # pásma + eligibilita
      pausalni-vydaje.ts      # paušál % + stropy
      rounding.ts             # zaokrouhlovací pravidla
  components/
    InputForm.tsx
    ResultsTable.tsx          # desktop tabulka / mobil karty
    RegimeDetailRow.tsx
    LegislationView.tsx
  test/
    *.test.ts                 # TDD pokrytí engine
```

---

## 4. Výpočetní engine — vzorce

Vstup (`CalcInput`):
- `year` (2025 | 2026)
- `prijmy` (roční obrat, Kč)
- `vydaje?` (skutečné roční výdaje, Kč — volitelné)
- `typCinnosti` → určuje paušál % a způsobilost pásem paušální daně:
  - `remeslna` (80 %), `zivnost` (60 %), `svobodne` (40 %), `najem` (30 %)
- `zacinajiciOSVC?` (bool) — snížené minimum sociálního (rok zahájení + 2 následující)
- `platceDPH?` (bool) — vypíná paušální daň
- `pocetDeti?` (number) — daňové zvýhodnění

### 4.1 Daň z příjmů (income-tax.ts)
```
zisk Z = prijmy − vydaje (paušál % se stropem, nebo skutečné)
zaklad = floor(Z na 100 Kč dolů)
dan = 15 % × min(zaklad, prah) + 23 % × max(0, zaklad − prah)
dan_po_sleve = max(0, dan − sleva_na_poplatnika)
zvyhodneni_deti = Σ (1.→15 204, 2.→22 320, 3.+→27 840)   // roční
dan_final = dan_po_sleve − zvyhodneni_deti   // může být záporná → daňový bonus
```
Sleva na poplatníka i zvýhodnění na děti se uplatní u **paušálních výdajů i skutečných výdajů**, **NE** u paušální daně.

### 4.2 Sociální pojištění (social.ts)
```
min_VZ_rocni = (zacinajiciOSVC ? min_VZ_zacinajici : min_VZ_hlavni)   // roční = 12× měsíční
VZ = clamp(0.55 × Z, dolní = min_VZ_rocni, horní = max_VZ)
socialni = VZ × 0.292
```

### 4.3 Zdravotní pojištění (health.ts)
```
VZ = max(0.50 × Z, min_VZ_zdravotni_rocni)   // bez horního stropu; žádná úleva pro začátečníky
zdravotni = ceil(VZ × 0.135)                 // zaokr. nahoru na celé Kč
```

### 4.4 Pravidlo přeplatku
Vychází implicitně z `max(...)` v minimu: když vypočtené pojistné < minimum, platí se minimum. UI to označí (např. „platíš minimum — přeplatek oproti reálnému zisku").

### 4.5 Paušální výdaje (pausalni-vydaje.ts)
```
paušál % a strop dle typu:
  80 % / strop 1 600 000   (řemeslné živnosti, zemědělství)
  60 % / strop 1 200 000   (ostatní živnosti)
  40 % / strop   800 000   (svobodná povolání, autorská práva)
  30 % / strop   600 000   (nájem)
vydaje_pausal = min(prijmy × %, strop)
Pokud prijmy > 2 000 000 → paušál nelze (eligible=false, důvod).
Zobrazují se VŠECHNY 4 paušály; ten dle typCinnosti je zvýrazněný jako „tvůj".
```

### 4.6 Paušální daň (pausalni-dan.ts)
```
roční = 12 × měsíční pásmo (2026: I=9 162, II=16 745, III=27 139)
Eligibilita pásma (obrat × typ), oba roky stejné:
  I:  ≤1 000 000 kdokoliv; NEBO ≤1 500 000 když ≥75 % z 80%/60% činností; NEBO ≤2 000 000 když ≥75 % z 80% činností
  II: ≤1 500 000 kdokoliv; NEBO ≤2 000 000 když ≥75 % z 80%/60% činností
  III:≤2 000 000 kdokoliv
Vstupní podmínky (jinak celý režim nedostupný):
  - neplátce DPH (platceDPH=false)
  - prijmy ≤ 2 000 000
  (v1 předpokládá splnění ostatních: bez závislé činnosti, ostatní příjmy ≤50 000, není v insolvenci…)
Ztrácí slevy/odpočty/bonus na děti.
```
V UI: pokud uživatel není způsobilý pro nějaké pásmo, zobrazí se „nedostupné" s důvodem (vždy ukazujeme všechna 3 pásma).

### 4.7 Čistý zbytek a pořadí
```
odvody_celkem = dan_final + socialni + zdravotni     (paušální daň: = roční paušální platba)
cisty_zbytek  = prijmy − odvody_celkem − vydaje_realne
```
- `vydaje_realne` = skutečné výdaje, pokud zadané (stejné napříč režimy — člověk je reálně utratí), jinak 0.
- Bez zadaných výdajů: čistý zbytek = „před reálnými výdaji" + upozornění, že nezahrnuje skutečné náklady.
- **Nejvýhodnější** = nejvyšší `cisty_zbytek` (při shodě nejnižší `odvody_celkem`). Engine vrací seřazené pořadí + příznak `nejlepsi`.

### 4.8 Hraniční stavy
- `prijmy > 2 000 000` → paušály i paušální daň `eligible=false` (důvod); zůstává jen skutečné výdaje.
- `vydaje > prijmy` → zisk 0 (nebo daňová ztráta — v1: zisk = max(0, …), pojistné z minim).
- Paušál nad strop → ořezán na strop.
- `platceDPH=true` → paušální daň `eligible=false` (důvod), paušály i skutečné fungují normálně. (VAT cashflow se v1 nemodeluje — je průtokový.)

---

## 5. Legislativní konstanty (zdroj pro config)

> Všechny hodnoty ověřeny rešerší z oficiálních zdrojů (ČSSZ, VZP, Finanční správa, nařízení vlády). Položky označené ⚠️ ověřit ještě proti doslovnému znění zákona před nasazením ostré verze.

### Průměrná mzda (měsíční)
| | 2025 | 2026 |
|---|---|---|
| Průměrná mzda | 46 557 Kč | 48 967 Kč |

### Daň z příjmů (zákon č. 586/1992 Sb.)
| Položka | 2025 | 2026 |
|---|---|---|
| Základní sazba | 15 % | 15 % |
| Zvýšená sazba | 23 % | 23 % |
| Práh 23 % (36× prům. mzda, ročně) | 1 676 052 Kč | 1 762 812 Kč |
| Sleva na poplatníka (ročně) | 30 840 Kč | 30 840 Kč |
| Daňové zvýhodnění 1. dítě (ročně) | 15 204 Kč | 15 204 Kč |
| Daňové zvýhodnění 2. dítě | 22 320 Kč | 22 320 Kč |
| Daňové zvýhodnění 3.+ dítě | 27 840 Kč | 27 840 Kč |
| Zaokrouhlení základu | dolů na 100 Kč | dolů na 100 Kč |

Zdroje: financnisprava.gov.cz, nařízení vlády č. 282/2024 Sb. (2025) a č. 365/2025 Sb. (2026), § 16 / § 35ba / § 35c ZDP. ⚠️ Tiery dětí ověřit proti § 35c.

### Výdajové paušály (§ 7 odst. 7 ZDP) — oba roky stejné
| Typ | % | Strop |
|---|---|---|
| Řemeslné živnosti, zemědělství | 80 % | 1 600 000 Kč |
| Ostatní živnosti (volné/vázané/koncesované) | 60 % | 1 200 000 Kč |
| Svobodná povolání, autorská práva (jiné příjmy ze sam. činnosti) | 40 % | 800 000 Kč |
| Nájem majetku v obchodním majetku | 30 % | 600 000 Kč |
| Limit obratu pro paušál | — | 2 000 000 Kč |

⚠️ Doslovné znění činností u 40 %/30 % ověřit proti § 7 odst. 7.

### Sociální / důchodové pojištění (zákon č. 589/1992 Sb.)
| Položka | 2025 | 2026 |
|---|---|---|
| Sazba | 29,2 % | 29,2 % |
| Vyměřovací základ | 55 % zisku | 55 % zisku |
| Min. měsíční VZ — hlavní (35 %/40 % prům. mzdy) | 16 295 Kč | 19 587 Kč |
| Min. měsíční záloha — hlavní | 4 759 Kč | 5 720 Kč |
| Min. měsíční VZ — začínající (25 %) | 11 640 Kč | 12 242 Kč |
| Min. měsíční záloha — začínající | 3 399 Kč | 3 575 Kč |
| Max. VZ (48× prům. mzda, ročně) | 2 234 736 Kč | 2 350 416 Kč |
| (ref.) Rozhodná částka vedlejší (ročně) | 111 736 Kč | 117 521 Kč |

Roční minima pro engine = 12× měsíční VZ. Začínající = rok zahájení + 2 následující kalendářní roky, hlavní činnost, kdo nebyl OSVČ v předchozích 20 letech (první OSVČ splňují automaticky). Zdroje: cssz.gov.cz, § 14/§14a, konsolidační balíček (zák. 349/2023 Sb.).

### Zdravotní pojištění (zákon č. 592/1992 Sb.)
| Položka | 2025 | 2026 |
|---|---|---|
| Sazba | 13,5 % | 13,5 % |
| Vyměřovací základ | 50 % zisku | 50 % zisku |
| Min. měsíční VZ (50 % prům. mzdy) | 23 278,50 Kč | 24 483,50 Kč |
| Min. měsíční záloha | 3 143 Kč | 3 306 Kč |
| Max. VZ | žádný (zrušen) | žádný (zrušen) |
| Úleva pro začínající | **žádná** | **žádná** |

Roční min. VZ = 12× měsíční. Záloha zaokr. nahoru na celé Kč. Zdroje: vzp.cz, § 3a zák. 592/1992.

### Paušální daň (§ 7a ZDP)
| Pásmo | 2025 měsíc | 2026 měsíc | rozpad 2025 (daň/soc/zdr) |
|---|---|---|---|
| I. | 8 716 Kč | **9 162 Kč** (efektivně) | 100 / 5 473 / 3 143 |
| II. | 16 745 Kč | 16 745 Kč | 4 963 / 8 191 / 3 591 |
| III. | 27 139 Kč | 27 139 Kč | 9 320 / 12 527 / 5 292 |

⚠️ 2026 pásmo I = 9 162 Kč efektivně (nominálně vyhlášeno 9 984; novela zpětně snižuje sociální složku). Rozpad 9 162 na soc/zdr je odvozený (daň 100 / soc ~5 756 / zdr 3 306), oficiálně nepublikovaný — ověřit. Pásma II/III beze změny.

Matice eligibility (oba roky stejná) viz § 4.6. Zdroje: financnisprava.gov.cz (Informace k paušální dani 2025/2026), § 7a ZDP.

---

## 6. UI

### 6.1 Kalkulačka (`/`)
- **Formulář** (nahoře, kompaktní): rok (přepínač), roční obrat, typ činnosti, skutečné výdaje (volitelné), přepínače „začínající OSVČ" a „plátce DPH", počet dětí (volitelné).
- **Srovnávací tabulka** (pod formulářem): sloupce = režimy (paušál 80/60/40/30, skutečné [jen když zadané výdaje], paušální daň I/II/III), řádky = daňový základ, daň z příjmů, sociální, zdravotní, **odvody celkem**, **čistý zbytek**. Nejvýhodnější sloupec zvýrazněný. Nedostupné režimy zašedlé s důvodem.
- **Detail režimu:** rozkliknutí ukáže rozpad výpočtu + vysvětlivku „proč tolik" (např. „zdravotní na minimu — přeplatek").
- **Měsíční zálohy:** doplňkově k ročním částkám.
- **Responzivita:** na mobilu se tabulka překlopí do karet (1 režim = 1 karta), seřazené od nejvýhodnější.

### 6.2 Legislativa (`/legislativa`)
- Všechny konstanty pro zvolený rok, seskupené (daň / sociální / zdravotní / paušální daň / paušály).
- Každá položka: hodnota + **odkaz na oficiální zdroj** + „platí od" + krátká vysvětlivka.
- Datum posledního ověření configu (freshness).
- Přepínač roku.

### 6.3 Vizuální směr
Čistý, přehledný, důvěryhodný „fintech" styl. Doladí se přes `frontend-design` skill ve fázi implementace. Čeština v celém UI.

---

## 7. Testování & správnost

Engine vzniká přes **TDD**. Testovací sada pokrývá:
- každý paušál (80/60/40/30) vč. ořezu na strop,
- oba prahy daně (pod/nad 23 %),
- minima a přeplatky sociálního i zdravotního,
- začínající OSVČ (sociální sníženo, zdravotní NE),
- hraniční obrat 2 mil. (paušály/paušální daň nedostupné nad limit),
- paušální daň — eligibilita všech 3 pásem dle matice,
- plátce DPH → paušální daň nedostupná,
- daňové zvýhodnění na děti (vč. bonusu při záporné dani),
- pořadí režimů a výběr nejvýhodnějšího.

Ručně dopočítané referenční případy slouží jako fixtures. Validace configu přes Zod při startu.

---

## 8. Auto-update pipeline (pozdější fáze)

Vercel Cron (hustěji listopad–leden) → zabezpečená route → LLM s web-fetchem prohledá oficiální zdroje pro daný rok → porovná s configem → při rozdílu **založí GitHub PR** (úprava `lib/legislation/<rok>.ts` + shrnutí + odkazy na zdroje). CI spustí testy engine. **Člověk PR zkontroluje a mergne.** Žádné automatické nasazení. Realita: každý nový rok = nový config soubor, který se musí udržovat (auto-update to jen usnadní návrhem).

---

## 9. Mimo rozsah v1 (YAGNI)
- Vedlejší činnost (souběh se zaměstnáním/studiem/důchodem), rozhodná částka.
- Sleva na manžela/manželku (složité podmínky).
- DPH cashflow a režimy DPH.
- Modelování záloh v čase / přeplatků z přehledu mezi roky.
- Ukládání profilů uživatele / účty.
- Ostré nasazení a GitHub PR pipeline (fáze 2).

---

## 10. Pořadí stavby
1. **Fáze 1 (MVP, lokálně):** scaffold → Zod schema + config 2025/2026 → engine + TDD testy → kalkulačka UI → legislativa UI → doladění vzhledu (`frontend-design`).
2. **Fáze 2 (později):** GitHub repo + Vercel nasazení → auto-update cron + PR pipeline.
