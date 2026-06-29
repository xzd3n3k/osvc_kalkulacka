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
