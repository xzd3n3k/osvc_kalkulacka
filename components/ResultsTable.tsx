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
      ? 'bg-emerald-100 text-emerald-800'
      : 'bg-sky-100 text-sky-800';
  return <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function ResultsTable({ output }: { output: CalcOutput }) {
  const { rezimy, nejlepsiId } = output;

  return (
    <div>
      {/* Desktop: tabulka se scrollem */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white p-2 text-left">Položka</th>
              {rezimy.map((r) => (
                <th
                  key={r.id}
                  className={`min-w-40 p-2 text-right align-bottom ${
                    r.id === nejlepsiId ? 'bg-emerald-50' : !r.eligible ? 'bg-slate-50 text-slate-400' : ''
                  }`}
                >
                  <div>{r.nazev}</div>
                  {r.id === nejlepsiId && <Badge tone="best">nejvýhodnější</Badge>}
                  {r.jeTvujTyp && r.eligible && r.id !== nejlepsiId && <Badge tone="tvuj">tvůj typ</Badge>}
                  {!r.eligible && r.duvodNedostupnosti && (
                    <div className="mt-1 text-xs font-normal">{r.duvodNedostupnosti}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RADKY.map((row) => (
              <tr key={String(row.key)} className="border-t border-slate-200">
                <td className="sticky left-0 bg-white p-2 font-medium">{row.label}</td>
                {rezimy.map((r) => (
                  <td
                    key={r.id}
                    className={`p-2 text-right tabular-nums ${
                      r.id === nejlepsiId ? 'bg-emerald-50' : ''
                    } ${row.key === 'cistyZbytek' ? 'font-semibold' : ''} ${
                      !r.eligible ? 'text-slate-300' : ''
                    }`}
                  >
                    {cell(r, row.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil: karty seřazené podle čistého zbytku */}
      <div className="grid gap-3 md:hidden">
        {[...rezimy]
          .sort((a, b) => (b.cistyZbytek ?? -Infinity) - (a.cistyZbytek ?? -Infinity))
          .map((r) => (
            <div
              key={r.id}
              className={`rounded-xl border p-4 ${
                r.id === nejlepsiId ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'
              } ${!r.eligible ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{r.nazev}</span>
                {r.id === nejlepsiId && <Badge tone="best">nejvýhodnější</Badge>}
              </div>
              {r.eligible ? (
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between"><dt>Odvody celkem</dt><dd className="tabular-nums">{cell(r, 'odvodyCelkem')}</dd></div>
                  <div className="flex justify-between font-semibold"><dt>Čistý zbytek</dt><dd className="tabular-nums">{cell(r, 'cistyZbytek')}</dd></div>
                </dl>
              ) : (
                <p className="mt-2 text-sm text-slate-500">{r.duvodNedostupnosti}</p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
