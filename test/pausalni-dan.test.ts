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
