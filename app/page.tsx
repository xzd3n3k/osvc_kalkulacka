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
    <main className="mx-auto max-w-6xl p-6">
      <Nav />
      <h1 className="mb-2 text-2xl font-bold">Kolik reálně zaplatíš a kolik ti zbyde</h1>
      <p className="mb-6 text-slate-600">
        Zadej obrat a uvidíš všechny daňové režimy vedle sebe. Nejvýhodnější je zvýrazněný.
      </p>
      <section className="mb-8 rounded-2xl border border-slate-200 p-5">
        <InputForm value={input} onChange={setInput} />
      </section>
      <section>
        <ResultsTable output={output} />
      </section>
    </main>
  );
}
