import { describe, it, expect } from 'vitest';
import { formatNum, formatPct } from '@/lib/format';

// cs-CZ vkládá pevné mezery (NBSP); normalizujeme je na obyčejnou mezeru kvůli stabilnímu porovnání.
const norm = (s: string) => s.replace(/\s/g, ' ');

describe('format', () => {
  it('formatNum používá oddělovače tisíců', () => {
    expect(norm(formatNum(1200000))).toBe('1 200 000');
  });
  it('formatPct', () => {
    expect(norm(formatPct(0.6))).toBe('60 %');
    expect(norm(formatPct(0.135))).toBe('13,5 %');
  });
});
