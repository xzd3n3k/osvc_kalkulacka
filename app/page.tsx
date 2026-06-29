'use client';

import { useState } from 'react';
import { InputForm } from '@/components/InputForm';
import { ResultsTable } from '@/components/ResultsTable';
import { Nav } from '@/components/Nav';
import { calculate } from '@/lib/calc/engine';
import type { CalcInput } from '@/lib/calc/types';

const DEFAULT: CalcInput = { rok: 2026, prijmy: 1200000, vydaje: 300000, typCinnosti: 'zivnost', pocetDeti: 0 };

export default function Home() {
  const [input, setInput] = useState<CalcInput>(DEFAULT);
  const output = calculate(input);

  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Page intro */}
        <div className="mb-8">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
            OSVČ · odvody 2025 / 2026
          </p>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-[var(--color-text)] sm:text-3xl">
            Kolik reálně zaplatíš a kolik ti zbyde
          </h1>
          <p className="mt-2 max-w-xl text-base text-[var(--color-text-muted)]">
            Zadej obrat a uvidíš všechny daňové režimy vedle sebe. Nejvýhodnější je zvýrazněný.
          </p>
        </div>

        {/* Input card */}
        <section
          aria-label="Vstupní parametry"
          className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm"
        >
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-subtle)]">
            Parametry výpočtu
          </h2>
          <InputForm value={input} onChange={setInput} />
        </section>

        {/* Results */}
        <section aria-label="Výsledky srovnání">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-subtle)]">
            Srovnání daňových režimů
          </h2>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
            <ResultsTable output={output} />
          </div>
        </section>
      </main>
    </>
  );
}
