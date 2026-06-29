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
    <>
      <Nav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
              Legislativní přehled
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              Platná legislativa
            </h1>
            <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
              Ověřeno dne {cfg.overenoDne}. Hodnoty odkazují na officiální zdroje.
            </p>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Rok</span>
            <select
              className="field-control w-32"
              value={rok}
              onChange={(e) => setRok(Number(e.target.value) as Rok)}
            >
              {dostupneRoky.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Legislation groups */}
        <div className="space-y-8">
          {Object.entries(skupiny).map(([skupina, items]) => (
            <section key={skupina}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                {skupina}
              </h2>
              <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
                <table className="w-full text-sm">
                  <tbody>
                    {items.map((r) => (
                      <tr
                        key={r.polozka}
                        className="border-t border-[var(--color-border)] first:border-t-0 hover:bg-[var(--color-bg)] transition-colors"
                      >
                        <td className="p-3 align-top">
                          <div className="font-medium text-[var(--color-text)]">{r.polozka}</div>
                          {r.popis && (
                            <div className="mt-0.5 text-xs text-[var(--color-text-subtle)]">{r.popis}</div>
                          )}
                        </td>
                        <td className="p-3 text-right align-top tabular-nums font-semibold text-[var(--color-text)] whitespace-nowrap">
                          {r.hodnota}
                        </td>
                        <td className="p-3 text-right align-top whitespace-nowrap">
                          <a
                            href={r.zdroj}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[var(--color-accent)] hover:underline focus-visible:underline"
                          >
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
        </div>
      </main>
    </>
  );
}
