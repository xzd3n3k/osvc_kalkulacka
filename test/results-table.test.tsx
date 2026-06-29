import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ResultsTable } from '@/components/ResultsTable';
import { calculate } from '@/lib/calc/engine';

describe('ResultsTable', () => {
  const out = calculate({ rok: 2026, prijmy: 1200000, vydaje: 300000, typCinnosti: 'zivnost' });

  it('označí nejvýhodnější režim odznakem', () => {
    render(<ResultsTable output={out} />);
    // nejlepší = paušální daň I; odznak "nejvýhodnější" se vyskytuje
    expect(screen.getAllByText(/nejvýhodnější/i).length).toBeGreaterThan(0);
  });

  it('zobrazí nedostupný režim s důvodem při obratu nad limit', () => {
    const o2 = calculate({ rok: 2026, prijmy: 2500000, vydaje: 100000, typCinnosti: 'zivnost' });
    render(<ResultsTable output={o2} />);
    expect(screen.getAllByText(/nelze|nedostupné|nad/i).length).toBeGreaterThan(0);
  });
});
