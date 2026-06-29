import type { CalcOutput, RegimeResult } from '@/lib/calc/types';
import { formatCZK } from '@/lib/format';

const RADKY: { key: keyof RegimeResult; label: string }[] = [
  { key: 'danovyZaklad', label: 'Daňový základ' },
  { key: 'danPrijem', label: 'Daň z příjmů' },
  { key: 'socialni', label: 'Sociální' },
  { key: 'zdravotni', label: 'Zdravotní' },
  { key: 'odvodyCelkem', label: 'Odvody celkem' },
  { key: 'cistyZbytek', label: 'Čistý zbytek' },
];

const cell = (r: RegimeResult, key: keyof RegimeResult): string => {
  const v = r[key];
  if (v == null || typeof v !== 'number') return '—';
  return formatCZK(v);
};

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

export function ResultsTable({ output }: { output: CalcOutput }) {
  const { rezimy, nejlepsiId } = output;

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

              {rezimy.map((r) => {
                const isBest = r.id === nejlepsiId;
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
                  </th>
                );
              })}
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
                        {cell(r, row.key)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile: cards sorted by čistý zbytek ── */}
      <div className="grid gap-3 md:hidden">
        {[...rezimy]
          .sort((a, b) => (b.cistyZbytek ?? -Infinity) - (a.cistyZbytek ?? -Infinity))
          .map((r) => {
            const isBest = r.id === nejlepsiId;
            return (
              <div
                key={r.id}
                className={[
                  'rounded-xl border p-4 transition-opacity',
                  isBest
                    ? 'border-[var(--color-best-border)] bg-[var(--color-best-bg)]'
                    : !r.eligible
                      ? 'border-[var(--color-border)] bg-[var(--color-bg)] opacity-50'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)]',
                ].join(' ')}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <span className={`font-semibold leading-snug ${!r.eligible ? 'text-[var(--color-ineligible-text)]' : 'text-[var(--color-text)]'}`}>
                    {r.nazev}
                  </span>
                  {isBest && <Badge tone="best">nejvýhodnější</Badge>}
                  {r.jeTvujTyp && r.eligible && !isBest && <Badge tone="tvuj">tvůj typ</Badge>}
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
                  </dl>
                ) : (
                  <p className="mt-2 text-sm text-[var(--color-ineligible-text)]">{r.duvodNedostupnosti}</p>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
