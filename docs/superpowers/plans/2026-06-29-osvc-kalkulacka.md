# OSVČ kalkulačka — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lokální webová kalkulačka, která pro zadaný roční obrat (a volitelné výdaje) spočítá a ve srovnávací tabulce ukáže odvody a čistý zbytek pro všechny daňové režimy OSVČ na hlavní činnost, plus stránku s aktuální legislativou a jejími zdroji.

**Architecture:** Verzovaný legislativní config (Zod-validovaný, per rok) = zdroj pravdy → čisté, plně testované výpočetní funkce (engine) → Next.js App Router UI (kalkulačka + legislativa). Engine je oddělený od UI a vzniká přes TDD.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zod, Vitest + React Testing Library, pnpm.

## Global Constraints

- Package manager: **pnpm** (Node 24 k dispozici).
- Next.js **16** (App Router, žádný `src/` adresář), React **19**.
- Tailwind CSS **v4** (PostCSS plugin `@tailwindcss/postcss`, `@import "tailwindcss";`).
- Import alias `@/*` → kořen projektu.
- Veškeré UI texty **česky**.
- Měny formátovat přes `Intl.NumberFormat('cs-CZ', …)`.
- Engine = **čisté funkce bez I/O**; žádné `Date.now()`/náhody.
- Zaokrouhlování: daňový základ **dolů na 100 Kč**; daň, sociální i zdravotní pojistné **nahoru na celé Kč** (`Math.ceil`).
- Rozsah v1: **jen hlavní činnost**, celoroční (12 měsíců). Roky **2025** a **2026** (default 2026).
- TDD: každá funkce engine má napřed padající test. Commituj často (1 task = 1+ commit).
- Pracovní adresář: `C:\Users\legito\WebstormProjects\osvc-kalkulacka` (už obsahuje `docs/` a lokální git).
- Spouštění příkazů na Windows přes pnpm; testy `pnpm test`, dev `pnpm dev`.

---

### Task 1: Scaffold projektu (Next.js 16 + Tailwind v4 + Vitest)

Protože adresář už obsahuje `docs/` a `.git`, scaffold se dělá **ručně** (create-next-app by neprázdný adresář odmítl).

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `next-env.d.ts` (vygeneruje Next), `vitest.config.ts`, `test/setup.ts`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `test/smoke.test.ts`

**Interfaces:**
- Produces: funkční `pnpm dev` (Next 16) a `pnpm test` (Vitest). Alias `@/*`.

- [ ] **Step 1: Vytvoř `package.json`**

```json
{
  "name": "osvc-kalkulacka",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^2.1.0",
    "jsdom": "^25.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/user-event": "^14.5.0",
    "@testing-library/jest-dom": "^6.6.0"
  }
}
```

- [ ] **Step 2: Vytvoř `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Vytvoř konfigurační soubory**

`next.config.ts`:
```ts
import type { NextConfig } from 'next';
const nextConfig: NextConfig = {};
export default nextConfig;
```

`postcss.config.mjs`:
```js
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

`.gitignore`:
```
node_modules
.next
out
.env*
*.log
.DS_Store
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
  resolve: { alias: { '@': resolve(import.meta.dirname, '.') } },
});
```

`test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Vytvoř app shell**

`app/globals.css`:
```css
@import "tailwindcss";
```

`app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OSVČ kalkulačka',
  description: 'Srovnání odvodů OSVČ napříč daňovými režimy podle aktuální legislativy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function Home() {
  return <main className="p-8 text-2xl font-bold">OSVČ kalkulačka</main>;
}
```

- [ ] **Step 5: Smoke test**

`test/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('běží test runner', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Instalace a ověření**

Run: `pnpm install`
Expected: nainstaluje bez chyb.

Run: `pnpm test`
Expected: 1 passed (smoke).

Run: `pnpm exec tsc --noEmit`
Expected: žádné chyby.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 + Tailwind v4 + Vitest"
```

---

### Task 2: Doménové typy, zaokrouhlování a formátování

**Files:**
- Create: `lib/calc/types.ts`
- Create: `lib/calc/rounding.ts`
- Create: `lib/format.ts`
- Test: `test/rounding.test.ts`, `test/format.test.ts`

**Interfaces:**
- Produces: typy `Rok`, `TypCinnosti`, `Pasmo`, `CalcInput`, `RegimeResult`, `CalcOutput`; `floorTo100`, `ceilKc`; `formatCZK`, `formatNum`, `formatPct`.

- [ ] **Step 1: Napiš padající testy zaokrouhlení**

`test/rounding.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { floorTo100, ceilKc } from '@/lib/calc/rounding';

describe('floorTo100', () => {
  it('zaokrouhlí dolů na celé stokoruny', () => {
    expect(floorTo100(480199)).toBe(480100);
    expect(floorTo100(500000)).toBe(500000);
    expect(floorTo100(99)).toBe(0);
  });
});

describe('ceilKc', () => {
  it('zaokrouhlí nahoru na celé koruny', () => {
    expect(ceilKc(39663.27)).toBe(39664);
    expect(ceilKc(77088)).toBe(77088);
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/rounding.test.ts`
Expected: FAIL (modul neexistuje).

- [ ] **Step 3: Implementuj `lib/calc/rounding.ts`**

```ts
/** Zaokrouhlí dolů na celé stokoruny (daňový základ). */
export const floorTo100 = (x: number): number => Math.floor(x / 100) * 100;

/** Zaokrouhlí nahoru na celé koruny (pojistné, daň). */
export const ceilKc = (x: number): number => Math.ceil(x);
```

- [ ] **Step 4: Napiš testy formátování**

`test/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { formatNum, formatPct } from '@/lib/format';

describe('format', () => {
  it('formatNum používá oddělovače tisíců', () => {
    // cs-CZ používá pevnou mezeru (NBSP, U+00A0) jako oddělovač tisíců
    expect(formatNum(1200000).replace(/ /g, ' ')).toBe('1 200 000');
  });
  it('formatPct', () => {
    expect(formatPct(0.6)).toBe('60 %');
    expect(formatPct(0.135)).toBe('13,5 %');
  });
});
```

- [ ] **Step 5: Implementuj `lib/format.ts`**

```ts
export const formatNum = (x: number): string =>
  new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(x);

export const formatCZK = (x: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(x);

export const formatPct = (x: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(x);
```

- [ ] **Step 6: Vytvoř `lib/calc/types.ts`**

```ts
export type Rok = 2025 | 2026;
export type TypCinnosti = 'remeslna' | 'zivnost' | 'svobodne' | 'najem';
export type Pasmo = 'I' | 'II' | 'III';
export type RezimDruh = 'pausal' | 'skutecne' | 'pausalniDan';

export interface CalcInput {
  rok: Rok;
  prijmy: number;
  vydaje?: number | null;
  typCinnosti: TypCinnosti;
  zacinajiciOSVC?: boolean;
  platceDPH?: boolean;
  pocetDeti?: number;
}

export interface RegimeResult {
  id: string;
  druh: RezimDruh;
  nazev: string;
  eligible: boolean;
  duvodNedostupnosti?: string;
  danovyZaklad: number | null;
  danPrijem: number | null;
  socialni: number | null;
  zdravotni: number | null;
  odvodyCelkem: number | null;
  cistyZbytek: number | null;
  jeTvujTyp?: boolean;
  naMinimuSocialni?: boolean;
  naMinimuZdravotni?: boolean;
  naMaximuSocialni?: boolean;
  upozorneni: string[];
}

export interface CalcOutput {
  rok: Rok;
  zadalVydaje: boolean;
  rezimy: RegimeResult[];
  nejlepsiId: string | null;
}
```

- [ ] **Step 7: Spusť testy a typecheck**

Run: `pnpm exec vitest run test/rounding.test.ts test/format.test.ts`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: bez chyb.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: doménové typy, zaokrouhlování a formátování"
```

---

### Task 3: Zod schema legislativy

**Files:**
- Create: `lib/legislation/schema.ts`
- Test: `test/legislation-schema.test.ts`

**Interfaces:**
- Consumes: nic.
- Produces: `legislationSchema` (Zod), typ `Legislation`.

- [ ] **Step 1: Napiš padající test schématu**

`test/legislation-schema.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { legislationSchema } from '@/lib/legislation/schema';

const valid = {
  rok: 2026,
  prumernaMzda: 48967,
  dan: { sazbaZakladni: 0.15, sazbaZvysena: 0.23, prah23: 1762812, slevaPoplatnik: 30840, zvyhodneniDeti: [15204, 22320, 27840] },
  pausalniVydaje: { limit: 2000000, sazby: {
    remeslna: { pct: 0.8, cap: 1600000 }, zivnost: { pct: 0.6, cap: 1200000 },
    svobodne: { pct: 0.4, cap: 800000 }, najem: { pct: 0.3, cap: 600000 } } },
  socialni: { sazba: 0.292, podilVZ: 0.55, minMesicniVZ_hlavni: 19587, minMesicniVZ_zacinajici: 12242, maxRocniVZ: 2350416, minMesicniZaloha_hlavni: 5720, minMesicniZaloha_zacinajici: 3575 },
  zdravotni: { sazba: 0.135, podilVZ: 0.5, minMesicniVZ: 24483.5, minMesicniZaloha: 3306 },
  pausalniDan: {
    I: { celkemMesic: 9162, danMesic: 100, socialniMesic: 5756, zdravotniMesic: 3306 },
    II: { celkemMesic: 16745, danMesic: 4963, socialniMesic: 8191, zdravotniMesic: 3591 },
    III: { celkemMesic: 27139, danMesic: 9320, socialniMesic: 12527, zdravotniMesic: 5292 } },
  zdroje: { dan: 'https://x.cz', pausalniVydaje: 'https://x.cz', socialni: 'https://x.cz', zdravotni: 'https://x.cz', pausalniDan: 'https://x.cz' },
  overenoDne: '2026-06-29',
};

describe('legislationSchema', () => {
  it('přijme validní data', () => {
    expect(() => legislationSchema.parse(valid)).not.toThrow();
  });
  it('odmítne chybějící pole', () => {
    const bad = { ...valid, socialni: { ...valid.socialni } } as Record<string, unknown>;
    delete (bad.socialni as Record<string, unknown>).sazba;
    expect(() => legislationSchema.parse(bad)).toThrow();
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/legislation-schema.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/legislation/schema.ts`**

```ts
import { z } from 'zod';

const pasmoSchema = z.object({
  celkemMesic: z.number().nonnegative(),
  danMesic: z.number().nonnegative(),
  socialniMesic: z.number().nonnegative(),
  zdravotniMesic: z.number().nonnegative(),
});

export const legislationSchema = z.object({
  rok: z.number().int(),
  prumernaMzda: z.number().positive(),
  dan: z.object({
    sazbaZakladni: z.number(),
    sazbaZvysena: z.number(),
    prah23: z.number().positive(),
    slevaPoplatnik: z.number().nonnegative(),
    zvyhodneniDeti: z.tuple([z.number(), z.number(), z.number()]),
  }),
  pausalniVydaje: z.object({
    limit: z.number().positive(),
    sazby: z.object({
      remeslna: z.object({ pct: z.number(), cap: z.number() }),
      zivnost: z.object({ pct: z.number(), cap: z.number() }),
      svobodne: z.object({ pct: z.number(), cap: z.number() }),
      najem: z.object({ pct: z.number(), cap: z.number() }),
    }),
  }),
  socialni: z.object({
    sazba: z.number(),
    podilVZ: z.number(),
    minMesicniVZ_hlavni: z.number(),
    minMesicniVZ_zacinajici: z.number(),
    maxRocniVZ: z.number(),
    minMesicniZaloha_hlavni: z.number(),
    minMesicniZaloha_zacinajici: z.number(),
  }),
  zdravotni: z.object({
    sazba: z.number(),
    podilVZ: z.number(),
    minMesicniVZ: z.number(),
    minMesicniZaloha: z.number(),
  }),
  pausalniDan: z.object({ I: pasmoSchema, II: pasmoSchema, III: pasmoSchema }),
  zdroje: z.object({
    dan: z.string().url(),
    pausalniVydaje: z.string().url(),
    socialni: z.string().url(),
    zdravotni: z.string().url(),
    pausalniDan: z.string().url(),
  }),
  overenoDne: z.string(),
});

export type Legislation = z.infer<typeof legislationSchema>;
```

- [ ] **Step 4: Spusť testy**

Run: `pnpm exec vitest run test/legislation-schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Zod schema legislativy"
```

---

### Task 4: Data legislativy 2025 + 2026 a registry

Hodnoty převzaty ze schváleného specu (sekce 5), ověřené rešerší z oficiálních zdrojů.

**Files:**
- Create: `lib/legislation/2025.ts`, `lib/legislation/2026.ts`, `lib/legislation/index.ts`
- Test: `test/legislation-data.test.ts`

**Interfaces:**
- Consumes: `legislationSchema`, `Legislation` (Task 3).
- Produces: `getLegislation(rok: number): Legislation`, `dostupneRoky: number[]`.

- [ ] **Step 1: Napiš padající test dat**

`test/legislation-data.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getLegislation, dostupneRoky } from '@/lib/legislation';

describe('legislation data', () => {
  it('nabízí roky 2025 a 2026', () => {
    expect(dostupneRoky).toEqual([2025, 2026]);
  });
  it('2026: klíčové konstanty', () => {
    const l = getLegislation(2026);
    expect(l.dan.prah23).toBe(1762812);
    expect(l.socialni.minMesicniVZ_hlavni).toBe(19587);
    expect(l.zdravotni.minMesicniVZ).toBe(24483.5);
    expect(l.pausalniDan.I.celkemMesic).toBe(9162);
  });
  it('2025: klíčové konstanty', () => {
    const l = getLegislation(2025);
    expect(l.dan.prah23).toBe(1676052);
    expect(l.pausalniDan.I.celkemMesic).toBe(8716);
  });
  it('rozpad pásem sedí na součet', () => {
    for (const rok of dostupneRoky) {
      const pd = getLegislation(rok).pausalniDan;
      for (const p of [pd.I, pd.II, pd.III]) {
        expect(p.danMesic + p.socialniMesic + p.zdravotniMesic).toBe(p.celkemMesic);
      }
    }
  });
  it('neznámý rok vyhodí chybu', () => {
    expect(() => getLegislation(2099)).toThrow();
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/legislation-data.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/legislation/2025.ts`**

```ts
import type { Legislation } from './schema';

export const legislation2025: Legislation = {
  rok: 2025,
  prumernaMzda: 46557,
  dan: { sazbaZakladni: 0.15, sazbaZvysena: 0.23, prah23: 1676052, slevaPoplatnik: 30840, zvyhodneniDeti: [15204, 22320, 27840] },
  pausalniVydaje: {
    limit: 2000000,
    sazby: {
      remeslna: { pct: 0.8, cap: 1600000 },
      zivnost: { pct: 0.6, cap: 1200000 },
      svobodne: { pct: 0.4, cap: 800000 },
      najem: { pct: 0.3, cap: 600000 },
    },
  },
  socialni: { sazba: 0.292, podilVZ: 0.55, minMesicniVZ_hlavni: 16295, minMesicniVZ_zacinajici: 11640, maxRocniVZ: 2234736, minMesicniZaloha_hlavni: 4759, minMesicniZaloha_zacinajici: 3399 },
  zdravotni: { sazba: 0.135, podilVZ: 0.5, minMesicniVZ: 23278.5, minMesicniZaloha: 3143 },
  pausalniDan: {
    I: { celkemMesic: 8716, danMesic: 100, socialniMesic: 5473, zdravotniMesic: 3143 },
    II: { celkemMesic: 16745, danMesic: 4963, socialniMesic: 8191, zdravotniMesic: 3591 },
    III: { celkemMesic: 27139, danMesic: 9320, socialniMesic: 12527, zdravotniMesic: 5292 },
  },
  zdroje: {
    dan: 'https://www.financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu',
    pausalniVydaje: 'https://www.jakpodnikat.cz/pausalni-vydaje-procentem.php',
    socialni: 'https://www.cssz.gov.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2025',
    zdravotni: 'https://www.vzp.cz/platci/informace/osvc/vymerovaci-zaklad-a-vypocet-pojistneho',
    pausalniDan: 'https://www.financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/pausalni-dan/informace-k-institutu-pausalni-dane-pro-rok-2025',
  },
  overenoDne: '2026-06-29',
};
```

- [ ] **Step 4: Implementuj `lib/legislation/2026.ts`**

```ts
import type { Legislation } from './schema';

export const legislation2026: Legislation = {
  rok: 2026,
  prumernaMzda: 48967,
  dan: { sazbaZakladni: 0.15, sazbaZvysena: 0.23, prah23: 1762812, slevaPoplatnik: 30840, zvyhodneniDeti: [15204, 22320, 27840] },
  pausalniVydaje: {
    limit: 2000000,
    sazby: {
      remeslna: { pct: 0.8, cap: 1600000 },
      zivnost: { pct: 0.6, cap: 1200000 },
      svobodne: { pct: 0.4, cap: 800000 },
      najem: { pct: 0.3, cap: 600000 },
    },
  },
  socialni: { sazba: 0.292, podilVZ: 0.55, minMesicniVZ_hlavni: 19587, minMesicniVZ_zacinajici: 12242, maxRocniVZ: 2350416, minMesicniZaloha_hlavni: 5720, minMesicniZaloha_zacinajici: 3575 },
  zdravotni: { sazba: 0.135, podilVZ: 0.5, minMesicniVZ: 24483.5, minMesicniZaloha: 3306 },
  pausalniDan: {
    // 1. pásmo 2026: efektivně 9 162 Kč/měs (novela zpětně snižuje sociální složku z nominálních 9 984).
    // Rozpad soc/zdr je odvozený, ne oficiálně publikovaný — viz spec ⚠️.
    I: { celkemMesic: 9162, danMesic: 100, socialniMesic: 5756, zdravotniMesic: 3306 },
    II: { celkemMesic: 16745, danMesic: 4963, socialniMesic: 8191, zdravotniMesic: 3591 },
    III: { celkemMesic: 27139, danMesic: 9320, socialniMesic: 12527, zdravotniMesic: 5292 },
  },
  zdroje: {
    dan: 'https://www.financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu',
    pausalniVydaje: 'https://www.jakpodnikat.cz/pausalni-vydaje-procentem.php',
    socialni: 'https://www.cssz.gov.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2026',
    zdravotni: 'https://www.vzp.cz/platci/informace/osvc/vymerovaci-zaklad-a-vypocet-pojistneho',
    pausalniDan: 'https://www.financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/pausalni-dan/informace-k-institutu-pausalni-dane-pro-rok-2025',
  },
  overenoDne: '2026-06-29',
};
```

- [ ] **Step 5: Implementuj `lib/legislation/index.ts`**

```ts
import { legislationSchema, type Legislation } from './schema';
import { legislation2025 } from './2025';
import { legislation2026 } from './2026';

const registry: Record<number, Legislation> = {
  2025: legislationSchema.parse(legislation2025),
  2026: legislationSchema.parse(legislation2026),
};

export const dostupneRoky: number[] = Object.keys(registry)
  .map(Number)
  .sort((a, b) => a - b);

export function getLegislation(rok: number): Legislation {
  const l = registry[rok];
  if (!l) throw new Error(`Legislativa pro rok ${rok} není k dispozici.`);
  return l;
}

export type { Legislation };
```

- [ ] **Step 6: Spusť testy**

Run: `pnpm exec vitest run test/legislation-data.test.ts`
Expected: PASS (5 testů).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: data legislativy 2025/2026 + registry"
```

---

### Task 5: Modul daně z příjmů

**Files:**
- Create: `lib/calc/income-tax.ts`
- Test: `test/income-tax.test.ts`

**Interfaces:**
- Consumes: `Legislation` (Task 3/4), `floorTo100`, `ceilKc` (Task 2).
- Produces: `vypocetDane(zisk, cfg, pocetDeti?): IncomeTaxResult`, `vypocetZvyhodneniDeti(n, tiery): number`. `IncomeTaxResult = { zaklad, danPredSlevami, slevaPoplatnik, zvyhodneniDeti, dan }`. `dan` může být záporná (bonus).

- [ ] **Step 1: Napiš padající testy**

`test/income-tax.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { vypocetDane, vypocetZvyhodneniDeti } from '@/lib/calc/income-tax';
import { getLegislation } from '@/lib/legislation';

const cfg = getLegislation(2026); // prah 1762812, sleva 30840, děti [15204,22320,27840]

describe('vypocetZvyhodneniDeti', () => {
  it('sčítá tiery, 3.+ stejně', () => {
    expect(vypocetZvyhodneniDeti(0, cfg.dan.zvyhodneniDeti)).toBe(0);
    expect(vypocetZvyhodneniDeti(1, cfg.dan.zvyhodneniDeti)).toBe(15204);
    expect(vypocetZvyhodneniDeti(2, cfg.dan.zvyhodneniDeti)).toBe(37524);
    expect(vypocetZvyhodneniDeti(4, cfg.dan.zvyhodneniDeti)).toBe(15204 + 22320 + 27840 + 27840);
  });
});

describe('vypocetDane', () => {
  it('pod prahem, jen sleva na poplatníka', () => {
    const r = vypocetDane(500000, cfg, 0);
    expect(r.zaklad).toBe(500000);
    expect(r.danPredSlevami).toBe(75000);
    expect(r.dan).toBe(44160); // 75000 - 30840
  });
  it('zaokrouhlí základ dolů na 100', () => {
    const r = vypocetDane(480199, cfg, 0);
    expect(r.zaklad).toBe(480100);
  });
  it('progrese 23 % nad prahem (s ceil daně)', () => {
    const r = vypocetDane(2000000, cfg, 0);
    // 0.15*1762812 + 0.23*(2000000-1762812) = 318975.04 -> ceil 318976; -30840 = 288136
    expect(r.danPredSlevami).toBe(318976);
    expect(r.dan).toBe(288136);
  });
  it('daňový bonus na děti (záporná daň)', () => {
    const r = vypocetDane(200000, cfg, 2);
    // daň 30000, po slevě 0, zvýhodnění 37524 -> -37524
    expect(r.dan).toBe(-37524);
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/income-tax.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/calc/income-tax.ts`**

```ts
import type { Legislation } from '../legislation/schema';
import { floorTo100, ceilKc } from './rounding';

export interface IncomeTaxResult {
  zaklad: number;
  danPredSlevami: number;
  slevaPoplatnik: number;
  zvyhodneniDeti: number;
  dan: number;
}

export function vypocetZvyhodneniDeti(
  pocetDeti: number,
  tiery: readonly [number, number, number],
): number {
  let suma = 0;
  for (let i = 0; i < pocetDeti; i++) suma += tiery[Math.min(i, 2)];
  return suma;
}

export function vypocetDane(zisk: number, cfg: Legislation, pocetDeti = 0): IncomeTaxResult {
  const zaklad = Math.max(0, floorTo100(zisk));
  const { sazbaZakladni, sazbaZvysena, prah23, slevaPoplatnik, zvyhodneniDeti } = cfg.dan;
  const danPredSlevami = ceilKc(
    sazbaZakladni * Math.min(zaklad, prah23) + sazbaZvysena * Math.max(0, zaklad - prah23),
  );
  const pouzitaSleva = Math.min(danPredSlevami, slevaPoplatnik);
  const poSleve = danPredSlevami - pouzitaSleva;
  const zvyh = vypocetZvyhodneniDeti(pocetDeti, zvyhodneniDeti);
  return {
    zaklad,
    danPredSlevami,
    slevaPoplatnik: pouzitaSleva,
    zvyhodneniDeti: zvyh,
    dan: poSleve - zvyh,
  };
}
```

- [ ] **Step 4: Spusť testy**

Run: `pnpm exec vitest run test/income-tax.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: výpočet daně z příjmů (15/23 %, sleva, děti, bonus)"
```

---

### Task 6: Modul sociálního pojištění

**Files:**
- Create: `lib/calc/social.ts`
- Test: `test/social.test.ts`

**Interfaces:**
- Consumes: `Legislation`, `ceilKc`.
- Produces: `vypocetSocialniho(zisk, cfg, zacinajici?): SocialResult`. `SocialResult = { vymerovaciZaklad, socialni, naMinimu, naMaximu }`.

- [ ] **Step 1: Napiš padající testy**

`test/social.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { vypocetSocialniho } from '@/lib/calc/social';
import { getLegislation } from '@/lib/legislation';

const cfg = getLegislation(2026); // 0.292, podíl 0.55, minVZ hl 19587*12=235044, zač 12242*12=146904, max 2350416

describe('vypocetSocialniho', () => {
  it('nad minimem', () => {
    const r = vypocetSocialniho(800000, cfg, false);
    expect(r.vymerovaciZaklad).toBe(440000); // 0.55*800000
    expect(r.socialni).toBe(128480); // ceil(440000*0.292)
    expect(r.naMinimu).toBe(false);
  });
  it('pod minimem hlavní -> platí minimum (přeplatek)', () => {
    const r = vypocetSocialniho(300000, cfg, false);
    expect(r.vymerovaciZaklad).toBe(235044);
    expect(r.socialni).toBe(68633); // ceil(235044*0.292)
    expect(r.naMinimu).toBe(true);
  });
  it('začínající má nižší minimum', () => {
    const r = vypocetSocialniho(200000, cfg, true);
    expect(r.vymerovaciZaklad).toBe(146904);
    expect(r.socialni).toBe(42896); // ceil(146904*0.292)
    expect(r.naMinimu).toBe(true);
  });
  it('nad maximálním vyměřovacím základem', () => {
    const r = vypocetSocialniho(5000000, cfg, false);
    expect(r.vymerovaciZaklad).toBe(2350416);
    expect(r.naMaximu).toBe(true);
    expect(r.socialni).toBe(686322); // ceil(2350416*0.292)
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/social.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/calc/social.ts`**

```ts
import type { Legislation } from '../legislation/schema';
import { ceilKc } from './rounding';

export interface SocialResult {
  vymerovaciZaklad: number;
  socialni: number;
  naMinimu: boolean;
  naMaximu: boolean;
}

export function vypocetSocialniho(
  zisk: number,
  cfg: Legislation,
  zacinajici = false,
): SocialResult {
  const minMes = zacinajici
    ? cfg.socialni.minMesicniVZ_zacinajici
    : cfg.socialni.minMesicniVZ_hlavni;
  const minRocni = minMes * 12;
  const max = cfg.socialni.maxRocniVZ;
  const vypocteny = cfg.socialni.podilVZ * Math.max(0, zisk);

  let vz = Math.max(vypocteny, minRocni);
  let naMaximu = false;
  if (vz > max) {
    vz = max;
    naMaximu = true;
  }

  return {
    vymerovaciZaklad: vz,
    socialni: ceilKc(vz * cfg.socialni.sazba),
    naMinimu: vypocteny < minRocni,
    naMaximu,
  };
}
```

- [ ] **Step 4: Spusť testy**

Run: `pnpm exec vitest run test/social.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: výpočet sociálního pojištění (min/max, začínající)"
```

---

### Task 7: Modul zdravotního pojištění

**Files:**
- Create: `lib/calc/health.ts`
- Test: `test/health.test.ts`

**Interfaces:**
- Consumes: `Legislation`, `ceilKc`.
- Produces: `vypocetZdravotniho(zisk, cfg): HealthResult`. `HealthResult = { vymerovaciZaklad, zdravotni, naMinimu }`. **Bez stropu, bez úlevy pro začínající.**

- [ ] **Step 1: Napiš padající testy**

`test/health.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { vypocetZdravotniho } from '@/lib/calc/health';
import { getLegislation } from '@/lib/legislation';

const cfg = getLegislation(2026); // 0.135, podíl 0.5, minVZ 24483.5*12=293802

describe('vypocetZdravotniho', () => {
  it('nad minimem', () => {
    const r = vypocetZdravotniho(800000, cfg);
    expect(r.vymerovaciZaklad).toBe(400000);
    expect(r.zdravotni).toBe(54000); // ceil(400000*0.135)
    expect(r.naMinimu).toBe(false);
  });
  it('pod minimem -> platí minimum (přeplatek)', () => {
    const r = vypocetZdravotniho(300000, cfg);
    expect(r.vymerovaciZaklad).toBe(293802);
    expect(r.zdravotni).toBe(39664); // ceil(293802*0.135)=ceil(39663.27)
    expect(r.naMinimu).toBe(true);
  });
  it('žádný strop u vysokého zisku', () => {
    const r = vypocetZdravotniho(5000000, cfg);
    expect(r.vymerovaciZaklad).toBe(2500000); // 0.5*5e6, bez stropu
    expect(r.zdravotni).toBe(337500);
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/health.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/calc/health.ts`**

```ts
import type { Legislation } from '../legislation/schema';
import { ceilKc } from './rounding';

export interface HealthResult {
  vymerovaciZaklad: number;
  zdravotni: number;
  naMinimu: boolean;
}

export function vypocetZdravotniho(zisk: number, cfg: Legislation): HealthResult {
  const minRocni = cfg.zdravotni.minMesicniVZ * 12;
  const vypocteny = cfg.zdravotni.podilVZ * Math.max(0, zisk);
  const vz = Math.max(vypocteny, minRocni); // bez horního stropu
  return {
    vymerovaciZaklad: vz,
    zdravotni: ceilKc(vz * cfg.zdravotni.sazba),
    naMinimu: vypocteny < minRocni,
  };
}
```

- [ ] **Step 4: Spusť testy**

Run: `pnpm exec vitest run test/health.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: výpočet zdravotního pojištění (minimum, bez stropu)"
```

---

### Task 8: Modul paušálních výdajů

**Files:**
- Create: `lib/calc/pausalni-vydaje.ts`
- Test: `test/pausalni-vydaje.test.ts`

**Interfaces:**
- Consumes: `Legislation`, `TypCinnosti`.
- Produces: `vypocetPausalnichVydaju(prijmy, typ, cfg): VydajeResult`. `VydajeResult = { pct, cap, vydaje, eligible, duvod? }`.

- [ ] **Step 1: Napiš padající testy**

`test/pausalni-vydaje.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { vypocetPausalnichVydaju } from '@/lib/calc/pausalni-vydaje';
import { getLegislation } from '@/lib/legislation';

const cfg = getLegislation(2026);

describe('vypocetPausalnichVydaju', () => {
  it('60 % bez dosažení stropu', () => {
    const r = vypocetPausalnichVydaju(1000000, 'zivnost', cfg);
    expect(r.vydaje).toBe(600000);
    expect(r.eligible).toBe(true);
  });
  it('ořízne na strop', () => {
    const r = vypocetPausalnichVydaju(2000000, 'zivnost', cfg);
    expect(r.vydaje).toBe(1200000); // strop
  });
  it('40 % strop', () => {
    const r = vypocetPausalnichVydaju(2000000, 'svobodne', cfg);
    expect(r.vydaje).toBe(800000);
  });
  it('nad limit 2 mil. -> nedostupné', () => {
    const r = vypocetPausalnichVydaju(2500000, 'remeslna', cfg);
    expect(r.eligible).toBe(false);
    expect(r.duvod).toBeTruthy();
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/pausalni-vydaje.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/calc/pausalni-vydaje.ts`**

```ts
import type { Legislation } from '../legislation/schema';
import type { TypCinnosti } from './types';

export interface VydajeResult {
  pct: number;
  cap: number;
  vydaje: number;
  eligible: boolean;
  duvod?: string;
}

export function vypocetPausalnichVydaju(
  prijmy: number,
  typ: TypCinnosti,
  cfg: Legislation,
): VydajeResult {
  const { pct, cap } = cfg.pausalniVydaje.sazby[typ];
  if (prijmy > cfg.pausalniVydaje.limit) {
    return {
      pct,
      cap,
      vydaje: 0,
      eligible: false,
      duvod: `Obrat nad ${cfg.pausalniVydaje.limit.toLocaleString('cs-CZ')} Kč — paušální výdaje nelze uplatnit.`,
    };
  }
  return { pct, cap, vydaje: Math.min(prijmy * pct, cap), eligible: true };
}
```

- [ ] **Step 4: Spusť testy**

Run: `pnpm exec vitest run test/pausalni-vydaje.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: výpočet paušálních výdajů (% a stropy)"
```

---

### Task 9: Modul paušální daně (pásma + eligibilita)

**Files:**
- Create: `lib/calc/pausalni-dan.ts`
- Test: `test/pausalni-dan.test.ts`

**Interfaces:**
- Consumes: `Legislation`, `TypCinnosti`, `Pasmo`.
- Produces: `jeZpusobilyProPasmo(pasmo, prijmy, typ, platceDPH, limit): { eligible, duvod? }`; `vypocetPausalniDane(pasmo, prijmy, typ, platceDPH, cfg): PausalniDanRezim` (obsahuje měsíční i roční částky + breakdown).

- [ ] **Step 1: Napiš padající testy**

`test/pausalni-dan.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { jeZpusobilyProPasmo, vypocetPausalniDane } from '@/lib/calc/pausalni-dan';
import { getLegislation } from '@/lib/legislation';

const cfg = getLegislation(2026);
const LIMIT = cfg.pausalniVydaje.limit;

describe('jeZpusobilyProPasmo', () => {
  it('I: do 1 mil. kdokoliv', () => {
    expect(jeZpusobilyProPasmo('I', 900000, 'svobodne', false, LIMIT).eligible).toBe(true);
  });
  it('I: 1,2 mil. svobodné (40 %) nedostupné, ale II ano', () => {
    expect(jeZpusobilyProPasmo('I', 1200000, 'svobodne', false, LIMIT).eligible).toBe(false);
    expect(jeZpusobilyProPasmo('II', 1200000, 'svobodne', false, LIMIT).eligible).toBe(true);
  });
  it('I: 1,2 mil. živnost (60 %) dostupné', () => {
    expect(jeZpusobilyProPasmo('I', 1200000, 'zivnost', false, LIMIT).eligible).toBe(true);
  });
  it('plátce DPH -> nedostupné', () => {
    const r = jeZpusobilyProPasmo('III', 500000, 'zivnost', true, LIMIT);
    expect(r.eligible).toBe(false);
    expect(r.duvod).toContain('DPH');
  });
  it('nad 2 mil. -> nedostupné', () => {
    expect(jeZpusobilyProPasmo('III', 2100000, 'remeslna', false, LIMIT).eligible).toBe(false);
  });
});

describe('vypocetPausalniDane', () => {
  it('roční částky 2026 I. pásmo', () => {
    const r = vypocetPausalniDane('I', 900000, 'svobodne', false, cfg);
    expect(r.celkemRok).toBe(109944); // 9162*12
    expect(r.danRok).toBe(1200);
    expect(r.socialniRok).toBe(69072);
    expect(r.zdravotniRok).toBe(39672);
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/pausalni-dan.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/calc/pausalni-dan.ts`**

```ts
import type { Legislation } from '../legislation/schema';
import type { TypCinnosti, Pasmo } from './types';

export interface PausalniDanRezim {
  pasmo: Pasmo;
  eligible: boolean;
  duvod?: string;
  danMesic: number;
  socialniMesic: number;
  zdravotniMesic: number;
  celkemMesic: number;
  danRok: number;
  socialniRok: number;
  zdravotniRok: number;
  celkemRok: number;
}

export function jeZpusobilyProPasmo(
  pasmo: Pasmo,
  prijmy: number,
  typ: TypCinnosti,
  platceDPH: boolean,
  limit: number,
): { eligible: boolean; duvod?: string } {
  if (platceDPH) return { eligible: false, duvod: 'Paušální daň je jen pro neplátce DPH.' };
  if (prijmy > limit) {
    return { eligible: false, duvod: `Obrat nad ${limit.toLocaleString('cs-CZ')} Kč.` };
  }
  const je80 = typ === 'remeslna';
  const je60u80 = typ === 'remeslna' || typ === 'zivnost';
  switch (pasmo) {
    case 'I':
      if (prijmy <= 1_000_000) return { eligible: true };
      if (prijmy <= 1_500_000 && je60u80) return { eligible: true };
      if (prijmy <= 2_000_000 && je80) return { eligible: true };
      return { eligible: false, duvod: 'Obrat je pro 1. pásmo u tohoto typu činnosti příliš vysoký.' };
    case 'II':
      if (prijmy <= 1_500_000) return { eligible: true };
      if (prijmy <= 2_000_000 && je60u80) return { eligible: true };
      return { eligible: false, duvod: 'Obrat je pro 2. pásmo u tohoto typu činnosti příliš vysoký.' };
    case 'III':
      if (prijmy <= 2_000_000) return { eligible: true };
      return { eligible: false, duvod: 'Obrat nad 2 mil. Kč.' };
  }
}

export function vypocetPausalniDane(
  pasmo: Pasmo,
  prijmy: number,
  typ: TypCinnosti,
  platceDPH: boolean,
  cfg: Legislation,
): PausalniDanRezim {
  const p = cfg.pausalniDan[pasmo];
  const { eligible, duvod } = jeZpusobilyProPasmo(
    pasmo,
    prijmy,
    typ,
    platceDPH,
    cfg.pausalniVydaje.limit,
  );
  return {
    pasmo,
    eligible,
    duvod,
    danMesic: p.danMesic,
    socialniMesic: p.socialniMesic,
    zdravotniMesic: p.zdravotniMesic,
    celkemMesic: p.celkemMesic,
    danRok: p.danMesic * 12,
    socialniRok: p.socialniMesic * 12,
    zdravotniRok: p.zdravotniMesic * 12,
    celkemRok: p.celkemMesic * 12,
  };
}
```

- [ ] **Step 4: Spusť testy**

Run: `pnpm exec vitest run test/pausalni-dan.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: paušální daň — pásma a eligibilita (matice obrat × činnost × DPH)"
```

---

### Task 10: Orchestrace engine (`calculate`)

Sestaví výsledky všech režimů, určí čistý zbytek a nejvýhodnější.

**Files:**
- Create: `lib/calc/engine.ts`
- Test: `test/engine.test.ts`

**Interfaces:**
- Consumes: `getLegislation`, `vypocetDane`, `vypocetSocialniho`, `vypocetZdravotniho`, `vypocetPausalnichVydaju`, `vypocetPausalniDane`; typy `CalcInput`, `CalcOutput`, `RegimeResult`, `TypCinnosti`, `Pasmo`.
- Produces: `calculate(input: CalcInput): CalcOutput`. ID režimů: `pausal-remeslna|zivnost|svobodne|najem`, `skutecne`, `pausalniDan-I|II|III`.

- [ ] **Step 1: Napiš padající integrační testy (worked example)**

`test/engine.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { calculate } from '@/lib/calc/engine';
import type { CalcInput, RegimeResult } from '@/lib/calc/types';

const find = (rezimy: RegimeResult[], id: string) => rezimy.find((r) => r.id === id)!;

describe('calculate — worked example (2026, 1,2 mil., živnost 60 %, výdaje 300k)', () => {
  const input: CalcInput = {
    rok: 2026, prijmy: 1200000, vydaje: 300000, typCinnosti: 'zivnost', pocetDeti: 0,
  };
  const out = calculate(input);

  it('paušál 60 %: odvody a čistý zbytek + zdravotní na minimu', () => {
    const r = find(out.rezimy, 'pausal-zivnost');
    expect(r.odvodyCelkem).toBe(157912); // 41160 + 77088 + 39664
    expect(r.cistyZbytek).toBe(742088); // 1200000 - 157912 - 300000
    expect(r.naMinimuZdravotni).toBe(true);
    expect(r.jeTvujTyp).toBe(true);
  });
  it('skutečné výdaje: čistý zbytek', () => {
    const r = find(out.rezimy, 'skutecne');
    expect(r.cistyZbytek).toBe(590550); // 1200000 - 309450 - 300000
  });
  it('paušální daň I: čistý zbytek', () => {
    const r = find(out.rezimy, 'pausalniDan-I');
    expect(r.eligible).toBe(true);
    expect(r.cistyZbytek).toBe(790056); // 1200000 - 109944 - 300000
  });
  it('nejvýhodnější je paušální daň I', () => {
    expect(out.nejlepsiId).toBe('pausalniDan-I');
  });
});

describe('calculate — hraniční stavy', () => {
  it('obrat nad 2 mil.: paušály i paušální daň nedostupné, skutečné dostupné', () => {
    const out = calculate({ rok: 2026, prijmy: 2500000, vydaje: 500000, typCinnosti: 'zivnost' });
    expect(find(out.rezimy, 'pausal-zivnost').eligible).toBe(false);
    expect(find(out.rezimy, 'pausalniDan-III').eligible).toBe(false);
    expect(find(out.rezimy, 'skutecne').eligible).toBe(true);
  });
  it('plátce DPH: paušální daň nedostupná', () => {
    const out = calculate({ rok: 2026, prijmy: 800000, typCinnosti: 'zivnost', platceDPH: true });
    expect(find(out.rezimy, 'pausalniDan-I').eligible).toBe(false);
    expect(find(out.rezimy, 'pausal-zivnost').eligible).toBe(true);
  });
  it('bez zadaných výdajů přidá upozornění a nezahrne skutečné výdaje', () => {
    const out = calculate({ rok: 2026, prijmy: 800000, typCinnosti: 'zivnost' });
    expect(out.zadalVydaje).toBe(false);
    expect(find(out.rezimy, 'skutecne')).toBeUndefined();
    expect(find(out.rezimy, 'pausal-zivnost').upozorneni.some((u) => u.includes('před odečtením'))).toBe(true);
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/engine.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/calc/engine.ts`**

```ts
import { getLegislation, type Legislation } from '../legislation';
import type { CalcInput, CalcOutput, RegimeResult, TypCinnosti, Pasmo } from './types';
import { vypocetDane } from './income-tax';
import { vypocetSocialniho } from './social';
import { vypocetZdravotniho } from './health';
import { vypocetPausalnichVydaju } from './pausalni-vydaje';
import { vypocetPausalniDane } from './pausalni-dan';

const TYPY: { typ: TypCinnosti; nazev: string }[] = [
  { typ: 'remeslna', nazev: 'Paušál 80 %' },
  { typ: 'zivnost', nazev: 'Paušál 60 %' },
  { typ: 'svobodne', nazev: 'Paušál 40 %' },
  { typ: 'najem', nazev: 'Paušál 30 %' },
];
const PASMA: Pasmo[] = ['I', 'II', 'III'];

function ordinaryRegime(
  id: string,
  nazev: string,
  druh: 'pausal' | 'skutecne',
  zisk: number,
  input: CalcInput,
  cfg: Legislation,
  realExpenses: number,
  zadalVydaje: boolean,
  jeTvujTyp: boolean,
): RegimeResult {
  const tax = vypocetDane(zisk, cfg, input.pocetDeti ?? 0);
  const soc = vypocetSocialniho(zisk, cfg, input.zacinajiciOSVC ?? false);
  const hea = vypocetZdravotniho(zisk, cfg);
  const odvody = tax.dan + soc.socialni + hea.zdravotni;
  const cisty = input.prijmy - odvody - realExpenses;

  const upozorneni: string[] = [];
  if (soc.naMinimu) upozorneni.push('Sociální vychází na minimum (reálný přeplatek).');
  if (hea.naMinimu) upozorneni.push('Zdravotní vychází na minimum (reálný přeplatek).');
  if (soc.naMaximu) upozorneni.push('Sociální je na maximálním vyměřovacím základu.');
  if (tax.dan < 0) upozorneni.push('Daňový bonus na děti (záporná daň).');
  if (!zadalVydaje) upozorneni.push('Čistý zbytek je před odečtením reálných výdajů.');

  return {
    id,
    druh,
    nazev,
    eligible: true,
    danovyZaklad: tax.zaklad,
    danPrijem: tax.dan,
    socialni: soc.socialni,
    zdravotni: hea.zdravotni,
    odvodyCelkem: odvody,
    cistyZbytek: cisty,
    jeTvujTyp,
    naMinimuSocialni: soc.naMinimu,
    naMinimuZdravotni: hea.naMinimu,
    naMaximuSocialni: soc.naMaximu,
    upozorneni,
  };
}

function neeligible(
  id: string,
  druh: RegimeResult['druh'],
  nazev: string,
  duvod: string | undefined,
  jeTvujTyp = false,
): RegimeResult {
  return {
    id, druh, nazev, eligible: false, duvodNedostupnosti: duvod,
    danovyZaklad: null, danPrijem: null, socialni: null, zdravotni: null,
    odvodyCelkem: null, cistyZbytek: null, jeTvujTyp, upozorneni: [],
  };
}

export function calculate(input: CalcInput): CalcOutput {
  const cfg = getLegislation(input.rok);
  const zadalVydaje = input.vydaje != null;
  const realExpenses = input.vydaje ?? 0;
  const rezimy: RegimeResult[] = [];

  // 1) Paušální výdaje — všechny 4
  for (const { typ, nazev } of TYPY) {
    const v = vypocetPausalnichVydaju(input.prijmy, typ, cfg);
    const id = `pausal-${typ}`;
    const jeTvuj = typ === input.typCinnosti;
    if (!v.eligible) {
      rezimy.push(neeligible(id, 'pausal', nazev, v.duvod, jeTvuj));
    } else {
      const zisk = Math.max(0, input.prijmy - v.vydaje);
      rezimy.push(ordinaryRegime(id, nazev, 'pausal', zisk, input, cfg, realExpenses, zadalVydaje, jeTvuj));
    }
  }

  // 2) Skutečné výdaje — jen když zadané
  if (zadalVydaje) {
    const zisk = Math.max(0, input.prijmy - realExpenses);
    rezimy.push(ordinaryRegime('skutecne', 'Skutečné výdaje', 'skutecne', zisk, input, cfg, realExpenses, zadalVydaje, false));
  }

  // 3) Paušální daň — 3 pásma
  for (const pasmo of PASMA) {
    const pd = vypocetPausalniDane(pasmo, input.prijmy, input.typCinnosti, input.platceDPH ?? false, cfg);
    const id = `pausalniDan-${pasmo}`;
    const nazev = `Paušální daň ${pasmo}. pásmo`;
    if (!pd.eligible) {
      rezimy.push(neeligible(id, 'pausalniDan', nazev, pd.duvod));
    } else {
      const cisty = input.prijmy - pd.celkemRok - realExpenses;
      const upozorneni = ['Paušální daň ruší slevy i daňové zvýhodnění (i na děti).'];
      if (!zadalVydaje) upozorneni.push('Čistý zbytek je před odečtením reálných výdajů.');
      rezimy.push({
        id, druh: 'pausalniDan', nazev, eligible: true,
        danovyZaklad: null, danPrijem: pd.danRok, socialni: pd.socialniRok, zdravotni: pd.zdravotniRok,
        odvodyCelkem: pd.celkemRok, cistyZbytek: cisty, upozorneni,
      });
    }
  }

  // 4) Nejvýhodnější = nejvyšší čistý zbytek mezi dostupnými
  let nejlepsiId: string | null = null;
  let nej = -Infinity;
  for (const r of rezimy) {
    if (r.eligible && r.cistyZbytek != null && r.cistyZbytek > nej) {
      nej = r.cistyZbytek;
      nejlepsiId = r.id;
    }
  }

  return { rok: input.rok, zadalVydaje, rezimy, nejlepsiId };
}
```

- [ ] **Step 4: Spusť testy (celá sada)**

Run: `pnpm test`
Expected: všechny testy PASS.
Run: `pnpm exec tsc --noEmit`
Expected: bez chyb.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: orchestrace engine — všechny režimy, čistý zbytek, nejvýhodnější"
```

---

### Task 11: Komponenta InputForm

**Files:**
- Create: `components/InputForm.tsx`
- Test: `test/input-form.test.tsx`

**Interfaces:**
- Consumes: typy `CalcInput`, `Rok`, `TypCinnosti`, `dostupneRoky`.
- Produces: `<InputForm value={CalcInput} onChange={(next: CalcInput) => void} />`.

- [ ] **Step 1: Napiš padající test**

`test/input-form.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputForm } from '@/components/InputForm';
import type { CalcInput } from '@/lib/calc/types';

const base: CalcInput = { rok: 2026, prijmy: 800000, typCinnosti: 'zivnost' };

describe('InputForm', () => {
  it('zobrazí pole obratu s hodnotou', () => {
    render(<InputForm value={base} onChange={() => {}} />);
    expect(screen.getByLabelText(/roční obrat/i)).toHaveValue(800000);
  });
  it('volá onChange při změně obratu', async () => {
    const onChange = vi.fn();
    render(<InputForm value={base} onChange={onChange} />);
    const input = screen.getByLabelText(/roční obrat/i);
    await userEvent.clear(input);
    await userEvent.type(input, '900000');
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0] as CalcInput;
    expect(last.prijmy).toBe(900000);
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/input-form.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementuj `components/InputForm.tsx`**

```tsx
'use client';

import type { CalcInput, Rok, TypCinnosti } from '@/lib/calc/types';
import { dostupneRoky } from '@/lib/legislation';

const TYPY: { value: TypCinnosti; label: string }[] = [
  { value: 'remeslna', label: 'Řemeslná živnost / zemědělství (paušál 80 %)' },
  { value: 'zivnost', label: 'Ostatní živnost (paušál 60 %)' },
  { value: 'svobodne', label: 'Svobodné povolání / autorská práva (paušál 40 %)' },
  { value: 'najem', label: 'Nájem majetku v obchodním majetku (paušál 30 %)' },
];

export function InputForm({
  value,
  onChange,
}: {
  value: CalcInput;
  onChange: (next: CalcInput) => void;
}) {
  const set = (patch: Partial<CalcInput>) => onChange({ ...value, ...patch });
  const numOrUndef = (s: string) => (s === '' ? undefined : Number(s));

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Rok</span>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={value.rok}
          onChange={(e) => set({ rok: Number(e.target.value) as Rok })}
        >
          {dostupneRoky.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Roční obrat (příjmy)</span>
        <input
          type="number"
          inputMode="numeric"
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={Number.isFinite(value.prijmy) ? value.prijmy : ''}
          onChange={(e) => set({ prijmy: Number(e.target.value) || 0 })}
        />
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-medium">Typ činnosti</span>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={value.typCinnosti}
          onChange={(e) => set({ typCinnosti: e.target.value as TypCinnosti })}
        >
          {TYPY.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Skutečné výdaje (volitelné)</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="nezadáno"
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={value.vydaje ?? ''}
          onChange={(e) => set({ vydaje: numOrUndef(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Počet dětí (volitelné)</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={value.pocetDeti ?? ''}
          onChange={(e) => set({ pocetDeti: numOrUndef(e.target.value) })}
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.zacinajiciOSVC ?? false}
          onChange={(e) => set({ zacinajiciOSVC: e.target.checked })}
        />
        <span className="text-sm">Začínající OSVČ (rok zahájení + 2 následující)</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.platceDPH ?? false}
          onChange={(e) => set({ platceDPH: e.target.checked })}
        />
        <span className="text-sm">Plátce DPH</span>
      </label>
    </form>
  );
}
```

- [ ] **Step 4: Spusť testy**

Run: `pnpm exec vitest run test/input-form.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: komponenta InputForm"
```

---

### Task 12: Komponenta ResultsTable (srovnávací tabulka + karty)

**Files:**
- Create: `components/ResultsTable.tsx`
- Test: `test/results-table.test.tsx`

**Interfaces:**
- Consumes: `CalcOutput`, `RegimeResult`, `formatCZK`.
- Produces: `<ResultsTable output={CalcOutput} />`. Zvýrazní `nejlepsiId`, zašedne nedostupné, na desktopu tabulka (scroll), na mobilu karty.

- [ ] **Step 1: Napiš padající test**

`test/results-table.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ResultsTable } from '@/components/ResultsTable';
import { calculate } from '@/lib/calc/engine';

describe('ResultsTable', () => {
  const out = calculate({ rok: 2026, prijmy: 1200000, vydaje: 300000, typCinnosti: 'zivnost' });

  it('označí nejvýhodnější režim odznakem', () => {
    render(<ResultsTable output={out} />);
    // nejlepší = paušální daň I; odznak "nejvýhodnější" se vyskytuje
    expect(screen.getAllByText(/nejvýhodnější/i).length).toBeGreaterThan(0);
  });

  it('zobrazí nedostupný režim s důvodem při obratu nad limit', () => {
    const o2 = calculate({ rok: 2026, prijmy: 2500000, vydaje: 100000, typCinnosti: 'zivnost' });
    render(<ResultsTable output={o2} />);
    expect(screen.getAllByText(/nelze|nedostupné|nad/i).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/results-table.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementuj `components/ResultsTable.tsx`**

```tsx
import type { CalcOutput, RegimeResult } from '@/lib/calc/types';
import { formatCZK } from '@/lib/format';

const RADKY: { key: keyof RegimeResult; label: string }[] = [
  { key: 'danovyZaklad', label: 'Daňový základ' },
  { key: 'danPrijem', label: 'Daň z příjmů' },
  { key: 'socialni', label: 'Sociální' },
  { key: 'zdravotni', label: 'Zdravotní' },
  { key: 'odvodyCelkem', label: 'Odvody celkem' },
  { key: 'cistyZbytek', label: 'Čistý zbytek' },
];

const cell = (r: RegimeResult, key: keyof RegimeResult): string => {
  const v = r[key];
  if (v == null || typeof v !== 'number') return '—';
  return formatCZK(v);
};

function Badge({ children, tone }: { children: React.ReactNode; tone: 'best' | 'tvuj' }) {
  const cls =
    tone === 'best'
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-sky-100 text-sky-800';
  return <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function ResultsTable({ output }: { output: CalcOutput }) {
  const { rezimy, nejlepsiId } = output;

  return (
    <div>
      {/* Desktop: tabulka se scrollem */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white p-2 text-left">Položka</th>
              {rezimy.map((r) => (
                <th
                  key={r.id}
                  className={`min-w-40 p-2 text-right align-bottom ${
                    r.id === nejlepsiId ? 'bg-emerald-50' : !r.eligible ? 'bg-slate-50 text-slate-400' : ''
                  }`}
                >
                  <div>{r.nazev}</div>
                  {r.id === nejlepsiId && <Badge tone="best">nejvýhodnější</Badge>}
                  {r.jeTvujTyp && r.eligible && r.id !== nejlepsiId && <Badge tone="tvuj">tvůj typ</Badge>}
                  {!r.eligible && r.duvodNedostupnosti && (
                    <div className="mt-1 text-xs font-normal">{r.duvodNedostupnosti}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RADKY.map((row) => (
              <tr key={String(row.key)} className="border-t border-slate-200">
                <td className="sticky left-0 bg-white p-2 font-medium">{row.label}</td>
                {rezimy.map((r) => (
                  <td
                    key={r.id}
                    className={`p-2 text-right tabular-nums ${
                      r.id === nejlepsiId ? 'bg-emerald-50' : ''
                    } ${row.key === 'cistyZbytek' ? 'font-semibold' : ''} ${
                      !r.eligible ? 'text-slate-300' : ''
                    }`}
                  >
                    {cell(r, row.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil: karty seřazené podle čistého zbytku */}
      <div className="grid gap-3 md:hidden">
        {[...rezimy]
          .sort((a, b) => (b.cistyZbytek ?? -Infinity) - (a.cistyZbytek ?? -Infinity))
          .map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border p-4 ${
                r.id === nejlepsiId ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'
              } ${!r.eligible ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{r.nazev}</span>
                {r.id === nejlepsiId && <Badge tone="best">nejvýhodnější</Badge>}
              </div>
              {r.eligible ? (
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between"><dt>Odvody celkem</dt><dd className="tabular-nums">{cell(r, 'odvodyCelkem')}</dd></div>
                  <div className="flex justify-between font-semibold"><dt>Čistý zbytek</dt><dd className="tabular-nums">{cell(r, 'cistyZbytek')}</dd></div>
                </dl>
              ) : (
                <p className="mt-2 text-sm text-slate-500">{r.duvodNedostupnosti}</p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Spusť testy**

Run: `pnpm exec vitest run test/results-table.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: komponenta ResultsTable (tabulka + mobilní karty)"
```

---

### Task 13: Stránka Kalkulačka (propojení stavu)

**Files:**
- Modify: `app/page.tsx`
- Create: `components/Nav.tsx`
- Test: `test/page-kalkulacka.test.tsx`

**Interfaces:**
- Consumes: `InputForm`, `ResultsTable`, `calculate`, `CalcInput`.
- Produces: klientská stránka `/` s živým přepočtem.

- [ ] **Step 1: Napiš padající test**

`test/page-kalkulacka.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Kalkulačka page', () => {
  it('vyrenderuje formulář i výsledky', () => {
    render(<Home />);
    expect(screen.getByLabelText(/roční obrat/i)).toBeInTheDocument();
    expect(screen.getByText(/čistý zbytek/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/page-kalkulacka.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementuj `components/Nav.tsx`**

```tsx
import Link from 'next/link';

export function Nav() {
  return (
    <nav className="mb-8 flex items-center gap-6 border-b border-slate-200 pb-4">
      <Link href="/" className="font-semibold">OSVČ kalkulačka</Link>
      <Link href="/legislativa" className="text-sm text-slate-600 hover:text-slate-900">Legislativa</Link>
    </nav>
  );
}
```

- [ ] **Step 4: Implementuj `app/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { InputForm } from '@/components/InputForm';
import { ResultsTable } from '@/components/ResultsTable';
import { Nav } from '@/components/Nav';
import { calculate } from '@/lib/calc/engine';
import type { CalcInput } from '@/lib/calc/types';

const DEFAULT: CalcInput = { rok: 2026, prijmy: 1200000, vydaje: 300000, typCinnosti: 'zivnost', pocetDeti: 0 };

export default function Home() {
  const [input, setInput] = useState<CalcInput>(DEFAULT);
  const output = calculate(input);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <Nav />
      <h1 className="mb-2 text-2xl font-bold">Kolik reálně zaplatíš a kolik ti zbyde</h1>
      <p className="mb-6 text-slate-600">
        Zadej obrat a uvidíš všechny daňové režimy vedle sebe. Nejvýhodnější je zvýrazněný.
      </p>
      <section className="mb-8 rounded-2xl border border-slate-200 p-5">
        <InputForm value={input} onChange={setInput} />
      </section>
      <section>
        <ResultsTable output={output} />
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Spusť testy a typecheck**

Run: `pnpm exec vitest run test/page-kalkulacka.test.tsx`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: bez chyb.

- [ ] **Step 6: Ověř v prohlížeči**

Run: `pnpm dev`
Otevři `http://localhost:3000` — formulář mění tabulku živě; nejvýhodnější zvýrazněný; přepnutí roku 2025/2026 mění čísla.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: stránka Kalkulačka s živým přepočtem + navigace"
```

---

### Task 14: Stránka Legislativa (přehled pravidel + zdroje)

**Files:**
- Create: `lib/legislation/display.ts`
- Create: `app/legislativa/page.tsx`
- Test: `test/legislation-display.test.ts`

**Interfaces:**
- Consumes: `getLegislation`, `Legislation`, `dostupneRoky`, `formatCZK`, `formatPct`, `formatNum`.
- Produces: `buildLegislationRows(cfg): LegislationRow[]` a klientská stránka `/legislativa` s přepínačem roku.

- [ ] **Step 1: Napiš padající test**

`test/legislation-display.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildLegislationRows } from '@/lib/legislation/display';
import { getLegislation } from '@/lib/legislation';

describe('buildLegislationRows', () => {
  const rows = buildLegislationRows(getLegislation(2026));

  it('obsahuje skupiny i zdroje', () => {
    const skupiny = new Set(rows.map((r) => r.skupina));
    expect(skupiny.has('Daň z příjmů')).toBe(true);
    expect(skupiny.has('Sociální pojištění')).toBe(true);
    expect(skupiny.has('Zdravotní pojištění')).toBe(true);
    expect(skupiny.has('Paušální daň')).toBe(true);
    expect(rows.every((r) => r.zdroj.startsWith('http'))).toBe(true);
  });
  it('má řádek s prahem 23 %', () => {
    const prah = rows.find((r) => r.polozka.includes('23'));
    expect(prah?.hodnota).toContain('762'); // 1 762 812
  });
});
```

- [ ] **Step 2: Spusť (musí selhat)**

Run: `pnpm exec vitest run test/legislation-display.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementuj `lib/legislation/display.ts`**

```ts
import type { Legislation } from './schema';
import { formatCZK, formatPct, formatNum } from '../format';

export interface LegislationRow {
  skupina: string;
  polozka: string;
  hodnota: string;
  zdroj: string;
  platiOd: string;
  popis?: string;
}

export function buildLegislationRows(cfg: Legislation): LegislationRow[] {
  const platiOd = `1. 1. ${cfg.rok}`;
  const z = cfg.zdroje;

  return [
    // Daň z příjmů
    { skupina: 'Daň z příjmů', polozka: 'Základní sazba', hodnota: formatPct(cfg.dan.sazbaZakladni), zdroj: z.dan, platiOd },
    { skupina: 'Daň z příjmů', polozka: 'Zvýšená sazba (nad práh)', hodnota: formatPct(cfg.dan.sazbaZvysena), zdroj: z.dan, platiOd, popis: 'Platí jen na část základu nad prahem.' },
    { skupina: 'Daň z příjmů', polozka: 'Práh pro 23 % (ročně)', hodnota: formatCZK(cfg.dan.prah23), zdroj: z.dan, platiOd, popis: '36× průměrná mzda.' },
    { skupina: 'Daň z příjmů', polozka: 'Sleva na poplatníka (ročně)', hodnota: formatCZK(cfg.dan.slevaPoplatnik), zdroj: z.dan, platiOd },
    { skupina: 'Daň z příjmů', polozka: 'Daňové zvýhodnění na děti (1./2./3.+)', hodnota: cfg.dan.zvyhodneniDeti.map(formatNum).join(' / ') + ' Kč', zdroj: z.dan, platiOd },
    { skupina: 'Daň z příjmů', polozka: 'Průměrná mzda (měsíčně)', hodnota: formatCZK(cfg.prumernaMzda), zdroj: z.dan, platiOd },

    // Paušální výdaje
    { skupina: 'Paušální výdaje', polozka: 'Řemeslná živnost / zemědělství', hodnota: `${formatPct(cfg.pausalniVydaje.sazby.remeslna.pct)}, strop ${formatCZK(cfg.pausalniVydaje.sazby.remeslna.cap)}`, zdroj: z.pausalniVydaje, platiOd },
    { skupina: 'Paušální výdaje', polozka: 'Ostatní živnost', hodnota: `${formatPct(cfg.pausalniVydaje.sazby.zivnost.pct)}, strop ${formatCZK(cfg.pausalniVydaje.sazby.zivnost.cap)}`, zdroj: z.pausalniVydaje, platiOd },
    { skupina: 'Paušální výdaje', polozka: 'Svobodné povolání / autorská práva', hodnota: `${formatPct(cfg.pausalniVydaje.sazby.svobodne.pct)}, strop ${formatCZK(cfg.pausalniVydaje.sazby.svobodne.cap)}`, zdroj: z.pausalniVydaje, platiOd },
    { skupina: 'Paušální výdaje', polozka: 'Nájem (v obchodním majetku)', hodnota: `${formatPct(cfg.pausalniVydaje.sazby.najem.pct)}, strop ${formatCZK(cfg.pausalniVydaje.sazby.najem.cap)}`, zdroj: z.pausalniVydaje, platiOd },
    { skupina: 'Paušální výdaje', polozka: 'Limit obratu pro paušál', hodnota: formatCZK(cfg.pausalniVydaje.limit), zdroj: z.pausalniVydaje, platiOd },

    // Sociální
    { skupina: 'Sociální pojištění', polozka: 'Sazba', hodnota: formatPct(cfg.socialni.sazba), zdroj: z.socialni, platiOd },
    { skupina: 'Sociální pojištění', polozka: 'Vyměřovací základ', hodnota: `${formatPct(cfg.socialni.podilVZ)} zisku`, zdroj: z.socialni, platiOd },
    { skupina: 'Sociální pojištění', polozka: 'Min. měsíční záloha — hlavní', hodnota: formatCZK(cfg.socialni.minMesicniZaloha_hlavni), zdroj: z.socialni, platiOd },
    { skupina: 'Sociální pojištění', polozka: 'Min. měsíční záloha — začínající', hodnota: formatCZK(cfg.socialni.minMesicniZaloha_zacinajici), zdroj: z.socialni, platiOd, popis: 'Rok zahájení + 2 následující roky.' },
    { skupina: 'Sociální pojištění', polozka: 'Max. vyměřovací základ (ročně)', hodnota: formatCZK(cfg.socialni.maxRocniVZ), zdroj: z.socialni, platiOd },

    // Zdravotní
    { skupina: 'Zdravotní pojištění', polozka: 'Sazba', hodnota: formatPct(cfg.zdravotni.sazba), zdroj: z.zdravotni, platiOd },
    { skupina: 'Zdravotní pojištění', polozka: 'Vyměřovací základ', hodnota: `${formatPct(cfg.zdravotni.podilVZ)} zisku`, zdroj: z.zdravotni, platiOd },
    { skupina: 'Zdravotní pojištění', polozka: 'Min. měsíční záloha', hodnota: formatCZK(cfg.zdravotni.minMesicniZaloha), zdroj: z.zdravotni, platiOd, popis: 'Pro začínající OSVČ ŽÁDNÁ úleva — plné minimum od 1. měsíce.' },

    // Paušální daň
    { skupina: 'Paušální daň', polozka: '1. pásmo (měsíčně)', hodnota: formatCZK(cfg.pausalniDan.I.celkemMesic), zdroj: z.pausalniDan, platiOd, popis: cfg.rok === 2026 ? 'Efektivní výše po novele (nominálně vyhlášeno 9 984 Kč).' : undefined },
    { skupina: 'Paušální daň', polozka: '2. pásmo (měsíčně)', hodnota: formatCZK(cfg.pausalniDan.II.celkemMesic), zdroj: z.pausalniDan, platiOd },
    { skupina: 'Paušální daň', polozka: '3. pásmo (měsíčně)', hodnota: formatCZK(cfg.pausalniDan.III.celkemMesic), zdroj: z.pausalniDan, platiOd },
  ];
}
```

- [ ] **Step 4: Implementuj `app/legislativa/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { getLegislation, dostupneRoky } from '@/lib/legislation';
import { buildLegislationRows, type LegislationRow } from '@/lib/legislation/display';
import type { Rok } from '@/lib/calc/types';

export default function LegislativaPage() {
  const [rok, setRok] = useState<Rok>(2026);
  const cfg = getLegislation(rok);
  const rows = buildLegislationRows(cfg);

  const skupiny = rows.reduce<Record<string, LegislationRow[]>>((acc, r) => {
    (acc[r.skupina] ??= []).push(r);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Nav />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platná legislativa</h1>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={rok}
          onChange={(e) => setRok(Number(e.target.value) as Rok)}
        >
          {dostupneRoky.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <p className="mb-8 text-sm text-slate-500">Ověřeno dne {cfg.overenoDne}. Hodnoty odkazují na oficiální zdroje.</p>

      {Object.entries(skupiny).map(([skupina, items]) => (
        <section key={skupina} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{skupina}</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {items.map((r) => (
                  <tr key={r.polozka} className="border-t border-slate-100 first:border-t-0">
                    <td className="p-3 align-top">
                      <div className="font-medium">{r.polozka}</div>
                      {r.popis && <div className="text-xs text-slate-500">{r.popis}</div>}
                    </td>
                    <td className="p-3 text-right align-top font-medium tabular-nums">{r.hodnota}</td>
                    <td className="p-3 text-right align-top">
                      <a href={r.zdroj} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline">
                        zdroj · platí od {r.platiOd}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  );
}
```

- [ ] **Step 5: Spusť testy a typecheck**

Run: `pnpm exec vitest run test/legislation-display.test.ts`
Expected: PASS.
Run: `pnpm exec tsc --noEmit`
Expected: bez chyb.

- [ ] **Step 6: Ověř v prohlížeči**

Run: `pnpm dev` → `http://localhost:3000/legislativa` — skupiny, hodnoty, odkazy na zdroje, přepínač roku funguje.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: stránka Legislativa s přehledem pravidel a zdroji"
```

---

### Task 15: Vizuální doladění + finální ověření

Vzhled povýšit přes skill `frontend-design` (čistý, důvěryhodný „fintech" styl) a ověřit celek.

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`, `components/*.tsx` (jen styly/markup, žádná změna výpočtu)

**Interfaces:**
- Žádné nové. Pouze vizuální úprava.

- [ ] **Step 1: Invokuj skill `frontend-design`** a aplikuj jeho doporučení na typografii, barvy, mezery a hierarchii (formulář, tabulka, zvýraznění nejvýhodnějšího, mobilní karty, stránka Legislativa). Drž kontrast a čitelnost čísel (`tabular-nums`).

- [ ] **Step 2: Ruční ověření (dev server)**

Run: `pnpm dev`
Projdi: změna obratu/roku/typu/výdajů/DPH/dětí/začínající → tabulka reaguje; nejvýhodnější zvýrazněn; nedostupné režimy zašedlé s důvodem; mobilní šířka → karty; `/legislativa` čitelná, odkazy fungují.

- [ ] **Step 3: Plná sada testů + typecheck + build**

Run: `pnpm test`
Expected: vše PASS.
Run: `pnpm exec tsc --noEmit`
Expected: bez chyb.
Run: `pnpm build`
Expected: build projde bez chyb.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "style: vizuální doladění UI (frontend-design)"
```

---

## Self-Review

**1. Spec coverage:**
- Srovnání všech režimů (paušál 80/60/40/30, skutečné, paušální daň I–III) → Task 10 + 12. ✓
- Daň/sociální/zdravotní + odvody + čistý zbytek → Tasks 5–7, 10. ✓
- Pravidlo přeplatku (minimum) → Tasks 6, 7 (`naMinimu`), zobrazení Task 12/10 (upozornění). ✓
- Začínající OSVČ (sociální ano, zdravotní ne) → Task 6 (parametr), Task 7 (bez parametru). ✓
- Paušální daň pásma + matice obrat × činnost → Task 9. ✓
- Plátce DPH → Task 9 + 11. ✓
- Slevy na děti (vč. bonusu) → Task 5, vstup Task 11. ✓
- Roky 2025/2026 + přepínač → Tasks 4, 11, 14. ✓
- Hraniční stav obrat > 2 mil. → Tasks 8, 9, 10. ✓
- Stránka Legislativa se zdroji a daty účinnosti → Task 14. ✓
- Verzovaný config jako zdroj pravdy + Zod validace → Tasks 3, 4. ✓
- Měsíční zálohy: zobrazují se v Legislativě (Task 14). Měsíční odvody v kalkulačce = roční/12 lze doplnit ve vizuálním tasku, není kritické pro v1. (Pozn.: spec to zmiňuje jako „doplňkově".)
- Auto-update pipeline → mimo rozsah této fáze (Fáze 2 dle specu). ✓

**2. Placeholder scan:** Žádné TBD/„handle edge cases"/„similar to". Veškerý kód uveden v plném znění. ✓

**3. Type consistency:** Názvy funkcí a polí jednotné napříč tasky: `calculate`, `vypocetDane`, `vypocetSocialniho`, `vypocetZdravotniho`, `vypocetPausalnichVydaju`, `vypocetPausalniDane`, `jeZpusobilyProPasmo`, `getLegislation`, `dostupneRoky`, `buildLegislationRows`. Pole `RegimeResult` použitá v Task 12 odpovídají definici v Task 2. ✓

**Drobné poznámky pro implementátora:**
- Roční minimum pojistného počítáme z ročního VZ (12× měsíční min. VZ), proto se může o pár Kč lišit od 12× měsíční záloha (artefakt měsíčního zaokrouhlení); přehled (roční) je směrodatný.
- Měsíční odvody v kalkulačce lze přidat jako `round(roční/12)` ve vizuálním tasku, je-li čas — orientační údaj.
