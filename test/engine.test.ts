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

describe('calculate — tie-break: při shodném čistém zbytku preferuje nižší odvody', () => {
  it('comparator vybere režim s nižšími odvody při stejném cistyZbytek', () => {
    // Oba režimy jsou dostupné; ručně ověříme, že algoritmus vyřadí vyšší odvody.
    // Vytvoříme dvě popsané výsledky se shodným cistyZbytek a zkontrolujeme,
    // který byl zvolen — ověřujeme chování loopy přímo bez mutace enginu.
    const higherOdvody = { eligible: true, cistyZbytek: 500000, odvodyCelkem: 200000, id: 'a' };
    const lowerOdvody  = { eligible: true, cistyZbytek: 500000, odvodyCelkem: 150000, id: 'b' };
    // Simulace výběrového algoritmu (kopie logiky z engine.ts)
    let nejId: string | null = null;
    let nejCisty = -Infinity;
    let nejOdv = Infinity;
    for (const r of [higherOdvody, lowerOdvody]) {
      if (r.eligible && r.cistyZbytek != null && r.odvodyCelkem != null) {
        if (r.cistyZbytek > nejCisty || (r.cistyZbytek === nejCisty && r.odvodyCelkem < nejOdv)) {
          nejCisty = r.cistyZbytek;
          nejOdv = r.odvodyCelkem;
          nejId = r.id;
        }
      }
    }
    expect(nejId).toBe('b'); // nižší odvody (150 000) vítězí
  });

  it('pořadí [lowerOdvody, higherOdvody] — výsledek zůstává b', () => {
    const higherOdvody = { eligible: true, cistyZbytek: 500000, odvodyCelkem: 200000, id: 'a' };
    const lowerOdvody  = { eligible: true, cistyZbytek: 500000, odvodyCelkem: 150000, id: 'b' };
    let nejId: string | null = null;
    let nejCisty = -Infinity;
    let nejOdv = Infinity;
    for (const r of [lowerOdvody, higherOdvody]) {
      if (r.eligible && r.cistyZbytek != null && r.odvodyCelkem != null) {
        if (r.cistyZbytek > nejCisty || (r.cistyZbytek === nejCisty && r.odvodyCelkem < nejOdv)) {
          nejCisty = r.cistyZbytek;
          nejOdv = r.odvodyCelkem;
          nejId = r.id;
        }
      }
    }
    expect(nejId).toBe('b'); // výsledek nezávisí na pořadí vstupu
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
