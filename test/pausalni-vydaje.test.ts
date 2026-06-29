import { describe, it, expect } from 'vitest';
import { vypocetPausalnichVydaju } from '@/lib/calc/pausalni-vydaje';
import { getLegislation } from '@/lib/legislation';

const cfg = getLegislation(2026);

describe('vypocetPausalnichVydaju', () => {
  it('60 % bez dosažení stropu', () => {
    const r = vypocetPausalnichVydaju(1000000, 'zivnost', cfg);
    expect(r.vydaje).toBe(600000);
    expect(r.eligible).toBe(true);
  });
  it('ořízne na strop', () => {
    const r = vypocetPausalnichVydaju(2000000, 'zivnost', cfg);
    expect(r.vydaje).toBe(1200000); // strop
  });
  it('40 % strop', () => {
    const r = vypocetPausalnichVydaju(2000000, 'svobodne', cfg);
    expect(r.vydaje).toBe(800000);
  });
  it('nad limit 2 mil. -> nedostupné', () => {
    const r = vypocetPausalnichVydaju(2500000, 'remeslna', cfg);
    expect(r.eligible).toBe(false);
    expect(r.duvod).toBeTruthy();
  });
});
