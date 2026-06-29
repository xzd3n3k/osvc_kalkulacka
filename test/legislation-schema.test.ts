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
