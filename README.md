# OSVČ kalkulačka

**Open-source kalkulačka daní a odvodů pro české OSVČ** (hlavní činnost). Zadáš roční obrat a uvidíš ve srovnávací tabulce vedle sebe daň z příjmů, sociální a zdravotní pojištění, odvody celkem a **čistý zbytek** pro všechny daňové režimy — a nejvýhodnější je zvýrazněná.

> ⚠️ **Není to daňové poradenství.** Jde o orientační pomůcku. Hodnoty vycházejí z veřejných zdrojů a před reálným rozhodnutím si je ověř (nebo se poraď s účetní/daňovým poradcem).

## Co to umí

- **Všechny režimy vedle sebe:** paušální výdaje 80 / 60 / 40 / 30 %, skutečné výdaje (po zadání výdajů) a paušální daň 1.–3. pásmo.
- **Nejvýhodnější varianta zvýrazněná**, nedostupné režimy zašedlé i s důvodem (např. obrat nad 2 mil. Kč, plátce DPH).
- **Pravidlo přeplatku** — když odvody vyjdou pod zákonné minimum, ukáže se „na minimu (přeplatek)".
- **Rozklikávací detail „proč tolik"** + měsíční zálohy.
- Volitelné vstupy: skutečné výdaje, slevy na děti, plátce DPH, začínající OSVČ (snížené minimum sociálního v prvních 3 letech).
- Přepínač roku **2025 / 2026** a stránka **Legislativa** s přehledem všech hodnot, odkazy na oficiální zdroje a daty účinnosti.

## Spuštění

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Další příkazy:

```bash
pnpm test         # spustí testy (Vitest)
pnpm build        # produkční build
```

## Jak je to postavené

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind CSS v4**
- **Verzovaný legislativní config** (`lib/legislation/`) jako jediný zdroj pravdy, validovaný přes Zod — každá hodnota se zdrojem a datem účinnosti
- **Čistý výpočetní engine** (`lib/calc/`) oddělený od UI, plně pokrytý testy (TDD)
- Návrh a plán implementace jsou v `docs/superpowers/`

## Legislativa

Aktuálně obsahuje data pro roky **2025** a **2026**. Každý další rok je potřeba do configu doplnit. Klíčové hodnoty (sazby, minima, pásma paušální daně, prahy) jsou ověřené z oficiálních zdrojů (ČSSZ, VZP, Finanční správa) — viz stránka **/legislativa** v aplikaci.

## Plánováno (Fáze 2)

- Automatická aktualizace legislativy (naplánovaná úloha → návrh změn jako pull request ke schválení)
- Nasazení (Vercel)
- Vedlejší činnost, sleva na manžela/manželku

## Licence

[MIT](./LICENSE) — používej, uprav a sdílej volně.
