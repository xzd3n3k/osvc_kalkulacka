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
