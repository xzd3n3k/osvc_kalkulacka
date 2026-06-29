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
