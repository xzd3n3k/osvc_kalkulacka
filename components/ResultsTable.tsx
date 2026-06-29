'use client';

import { useState } from 'react';
import type { CalcOutput, RegimeResult } from '@/lib/calc/types';
import { formatCZK } from '@/lib/format';

// ── Numeric row definitions ──────────────────────────────────────────────────

const RADKY: { key: keyof RegimeResult; label: string }[] = [
  { key: 'danovyZaklad', label: 'Daňový základ' },
  { key: 'danPrijem', label: 'Daň z příjmů' },
  { key: 'socialni', label: 'Sociální' },
  { key: 'zdravotni', label: 'Zdravotní' },
  { key: 'odvodyCelkem', label: 'Odvody celkem' },
  { key: 'cistyZbytek', label: 'Čistý zbytek' },
];

// Rows shown in the expandable detail section (plus monthly equivalents)
const DETAIL_RADKY: { key: keyof RegimeResult; label: string }[] = [
  { key: 'danPrijem', label: 'Daň z příjmů' },
  { key: 'socialni', label: 'Sociální' },
  { key: 'zdravotni', label: 'Zdravotní' },
  { key: 'odvodyCelkem', label: 'Odvody celkem' },
  { key: 'cistyZbytek', label: 'Čistý zbytek' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const cell = (r: RegimeResult, key: keyof RegimeResult): string => {
  const v = r[key];
  if (v == null || typeof v !== 'number') return '—';
  return formatCZK(v);
};

const monthly = (r: RegimeResult, key: keyof RegimeResult): string => {
  const v = r[key];
  if (v == null || typeof v !== 'number') return '—';
  return formatCZK(Math.round(v / 12));
};

// ── Sub-components ───────────────────────────────────────────────────────────

function Badge({ children, tone }: { children: React.ReactNode; tone: 'best' | 'tvuj' }) {
  const cls =
    tone === 'best'
      ? 'bg-[var(--color-best-bg)] text-[var(--color-best)] border border-[var(--color-best-border)]'
      : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${cls}`}>
      {children}
    </span>
  );
}

/** Small amber warning pill shown next to a figure when it's at minimum (přeplatek). */
function MinimuPill({ label }: { label: string }) {
  return (
    <span
      title={label}
      className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-600"
    >
      min
    </span>
  );
}

/** Expandable detail panel for a single eligible regime — used both on desktop and mobile. */
function RegimeDetail({ r, open }: { r: RegimeResult; open: boolean }) {
  if (!open || !r.eligible) return null;

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 pb-4 pt-3 text-xs text-[var(--color-text)]">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        Detail / proč tolik
      </p>
      {/* Breakdown table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-[var(--color-text-muted)]">
            <th className="py-1 pr-3 text-left font-normal">Položka</th>
            <th className="py-1 pr-3 text-right font-normal">Ročně</th>
            <th className="py-1 text-right font-normal">Měsíčně</th>
          </tr>
        </thead>
        <tbody>
          {DETAIL_RADKY.map(({ key, label }) => {
            const isSocialni = key === 'socialni';
            const isZdravotni = key === 'zdravotni';
            const showMinimu =
              (isSocialni && r.naMinimuSocialni) || (isZdravotni && r.naMinimuZdravotni);

            return (
              <tr key={String(key)} className="border-t border-[var(--color-border)]">
                <td className="py-1 pr-3 text-[var(--color-text-muted)]">
                  {label}
                  {showMinimu && (
                    <MinimuPill label="Vychází na minimum — platíš přeplatek oproti reálnému zisku" />
                  )}
                </td>
                <td className="py-1 pr-3 text-right tabular-nums">{cell(r, key)}</td>
                <td className="py-1 text-right tabular-nums text-[var(--color-text-muted)]">
                  {monthly(r, key)} / měs.
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Upozornění */}
      {r.upozorneni.length > 0 && (
        <ul className="mt-3 space-y-1">
          {r.upozorneni.map((u, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[var(--color-text-muted)]">
              <span className="mt-px shrink-0 text-amber-500">⚠</span>
              <span>{u}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Desktop column header cell (extracted to keep JSX clean) ─────────────────

function ColHeader({
  r,
  isBest,
  expanded,
  onToggle,
}: {
  r: RegimeResult;
  isBest: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isIneligible = !r.eligible;
  return (
    <th
      key={r.id}
      data-best={isBest ? 'true' : undefined}
      className={[
        'min-w-44 p-3 text-right align-bottom',
        isBest
          ? 'bg-[var(--color-best-bg)]'
          : isIneligible
            ? 'bg-[var(--color-bg)] text-[var(--color-ineligible-text)]'
            : 'bg-[var(--color-bg)]',
      ].join(' ')}
    >
      <div className={`font-semibold leading-snug ${isIneligible ? 'text-[var(--color-ineligible-text)]' : 'text-[var(--color-text)]'}`}>
        {r.nazev}
      </div>
      <div className="mt-1.5 flex flex-wrap justify-end gap-1">
        {isBest && <Badge tone="best">nejvýhodnější</Badge>}
        {r.jeTvujTyp && r.eligible && !isBest && <Badge tone="tvuj">tvůj typ</Badge>}
      </div>
      {isIneligible && r.duvodNedostupnosti && (
        <div className="mt-1 text-xs font-normal text-[var(--color-ineligible-text)]">
          {r.duvodNedostupnosti}
        </div>
      )}
      {r.eligible && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={onToggle}
            className="rounded px-2 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            {expanded ? 'Skrýt detail ▲' : 'Detail ▼'}
          </button>
        </div>
      )}
    </th>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ResultsTable({ output }: { output: CalcOutput }) {
  const { rezimy, nejlepsiId } = output;

  // Map of regimeId → expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      {/* ── Desktop: scrollable table ── */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {/* Sticky label column header */}
              <th className="sticky left-0 z-10 bg-[var(--color-bg)] p-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                Položka
              </th>

              {rezimy.map((r) => (
                <ColHeader
                  key={r.id}
                  r={r}
                  isBest={r.id === nejlepsiId}
                  expanded={!!expanded[r.id]}
                  onToggle={() => toggle(r.id)}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {RADKY.map((row, rowIdx) => {
              const isSummaryRow = row.key === 'cistyZbytek' || row.key === 'odvodyCelkem';
              return (
                <tr
                  key={String(row.key)}
                  className={[
                    'border-t border-[var(--color-border)]',
                    row.key === 'cistyZbytek' ? 'border-t-2 border-t-[var(--color-border-strong)]' : '',
                    rowIdx === 0 ? 'border-t-2 border-t-[var(--color-border-strong)]' : '',
                  ].join(' ')}
                >
                  <td className="sticky left-0 z-10 bg-[var(--color-surface)] p-3 font-medium text-[var(--color-text)]">
                    {row.label}
                  </td>
                  {rezimy.map((r) => {
                    const isBest = r.id === nejlepsiId;
                    const isIneligible = !r.eligible;
                    const isSocialni = row.key === 'socialni';
                    const isZdravotni = row.key === 'zdravotni';
                    const showMinimu =
                      !isIneligible &&
                      ((isSocialni && r.naMinimuSocialni) || (isZdravotni && r.naMinimuZdravotni));
                    return (
                      <td
                        key={r.id}
                        className={[
                          'p-3 text-right tabular-nums',
                          isBest ? 'bg-[var(--color-best-bg)]' : '',
                          isSummaryRow && !isIneligible ? 'font-semibold' : '',
                          row.key === 'cistyZbytek' && isBest
                            ? 'text-[var(--color-best)] text-base font-bold'
                            : '',
                          isIneligible ? 'text-[var(--color-ineligible-text)]' : 'text-[var(--color-text)]',
                        ].join(' ')}
                      >
                        <span className="inline-flex items-center justify-end">
                          {cell(r, row.key)}
                          {showMinimu && (
                            <MinimuPill label="Vychází na minimum — platíš přeplatek" />
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Detail expansion rows — one row per regime that is expanded */}
            {rezimy.some((r) => r.eligible && expanded[r.id]) && (
              <tr className="border-t-2 border-t-[var(--color-border-strong)]">
                <td className="sticky left-0 z-10 bg-[var(--color-surface)] p-0" />
                {rezimy.map((r) => (
                  <td key={r.id} className={r.id === nejlepsiId ? 'bg-[var(--color-best-bg)] p-0 align-top' : 'p-0 align-top'}>
                    <RegimeDetail r={r} open={!!expanded[r.id]} />
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: cards sorted by čistý zbytek ── */}
      <div className="grid gap-3 md:hidden">
        {[...rezimy]
          .sort((a, b) => (b.cistyZbytek ?? -Infinity) - (a.cistyZbytek ?? -Infinity))
          .map((r) => {
            const isBest = r.id === nejlepsiId;
            const isExpanded = !!expanded[r.id];
            return (
              <div
                key={r.id}
                className={[
                  'rounded-xl border transition-opacity overflow-hidden',
                  isBest
                    ? 'border-[var(--color-best-border)] bg-[var(--color-best-bg)]'
                    : !r.eligible
                      ? 'border-[var(--color-border)] bg-[var(--color-bg)] opacity-50'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]',
                ].join(' ')}
              >
                <div className="p-4">
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`font-semibold leading-snug ${!r.eligible ? 'text-[var(--color-ineligible-text)]' : 'text-[var(--color-text)]'}`}>
                      {r.nazev}
                    </span>
                    <div className="flex shrink-0 flex-wrap justify-end gap-1">
                      {isBest && <Badge tone="best">nejvýhodnější</Badge>}
                      {r.jeTvujTyp && r.eligible && !isBest && <Badge tone="tvuj">tvůj typ</Badge>}
                    </div>
                  </div>

                  {/* Card body */}
                  {r.eligible ? (
                    <dl className="mt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between text-[var(--color-text-muted)]">
                        <dt>Odvody celkem</dt>
                        <dd className="tabular-nums font-medium text-[var(--color-text)]">{cell(r, 'odvodyCelkem')}</dd>
                      </div>
                      <div className="flex justify-between border-t border-[var(--color-border)] pt-1.5">
                        <dt className="font-semibold">Čistý zbytek</dt>
                        <dd className={`tabular-nums font-bold ${isBest ? 'text-[var(--color-best)]' : 'text-[var(--color-text)]'}`}>
                          {cell(r, 'cistyZbytek')}
                        </dd>
                      </div>

                      {/* Upozornění summary on mobile (without expand) */}
                      {r.upozorneni.length > 0 && (
                        <div className="mt-2 space-y-0.5 border-t border-[var(--color-border)] pt-2">
                          {r.upozorneni.map((u, i) => (
                            <p key={i} className="flex items-start gap-1 text-xs text-[var(--color-text-muted)]">
                              <span className="shrink-0 text-amber-500">⚠</span>
                              <span>{u}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Expand toggle */}
                      <div className="border-t border-[var(--color-border)] pt-2">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggle(r.id)}
                          className="w-full rounded px-2 py-1 text-center text-xs font-medium text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                        >
                          {isExpanded ? 'Skrýt detail ▲' : 'Detail / proč tolik ▼'}
                        </button>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--color-ineligible-text)]">{r.duvodNedostupnosti}</p>
                  )}
                </div>

                {/* Inline expanded detail on mobile */}
                <RegimeDetail r={r} open={isExpanded} />
              </div>
            );
          })}
      </div>
    </div>
  );
}
