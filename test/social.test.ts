import { describe, it, expect } from 'vitest';
import { vypocetSocialniho } from '@/lib/calc/social';
import { getLegislation } from '@/lib/legislation';

const cfg = getLegislation(2026); // 0.292, podíl 0.55, minVZ hl 19587*12=235044, zač 12242*12=146904, max 2350416

describe('vypocetSocialniho', () => {
  it('nad minimem', () => {
    const r = vypocetSocialniho(800000, cfg, false);
    expect(r.vymerovaciZaklad).toBeCloseTo(440000); // 0.55*800000
    expect(r.socialni).toBe(128481); // ceil(440000*0.292) with fp precision
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
