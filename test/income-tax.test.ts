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
