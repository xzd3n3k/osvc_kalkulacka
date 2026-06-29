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
