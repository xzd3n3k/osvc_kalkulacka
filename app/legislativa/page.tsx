'use client';

import { useState } from 'react';
import { Nav } from '@/components/Nav';
import { getLegislation, dostupneRoky } from '@/lib/legislation';
import { buildLegislationRows, type LegislationRow } from '@/lib/legislation/display';
import type { Rok } from '@/lib/calc/types';

export default function LegislativaPage() {
  const [rok, setRok] = useState<Rok>(2026);
  const cfg = getLegislation(rok);
  const rows = buildLegislationRows(cfg);

  const skupiny = rows.reduce<Record<string, LegislationRow[]>>((acc, r) => {
    (acc[r.skupina] ??= []).push(r);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Nav />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platná legislativa</h1>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={rok}
          onChange={(e) => setRok(Number(e.target.value) as Rok)}
        >
          {dostupneRoky.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <p className="mb-8 text-sm text-slate-500">Ověřeno dne {cfg.overenoDne}. Hodnoty odkazují na oficiální zdroje.</p>

      {Object.entries(skupiny).map(([skupina, items]) => (
        <section key={skupina} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{skupina}</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {items.map((r) => (
                  <tr key={r.polozka} className="border-t border-slate-100 first:border-t-0">
                    <td className="p-3 align-top">
                      <div className="font-medium">{r.polozka}</div>
                      {r.popis && <div className="text-xs text-slate-500">{r.popis}</div>}
                    </td>
                    <td className="p-3 text-right align-top font-medium tabular-nums">{r.hodnota}</td>
                    <td className="p-3 text-right align-top">
                      <a href={r.zdroj} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline">
                        zdroj · platí od {r.platiOd}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </main>
  );
}
