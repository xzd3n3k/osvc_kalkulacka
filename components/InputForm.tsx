'use client';

import type { CalcInput, Rok, TypCinnosti } from '@/lib/calc/types';
import { dostupneRoky } from '@/lib/legislation';

const TYPY: { value: TypCinnosti; label: string }[] = [
  { value: 'remeslna', label: 'Řemeslná živnost / zemědělství (paušál 80 %)' },
  { value: 'zivnost', label: 'Ostatní živnost (paušál 60 %)' },
  { value: 'svobodne', label: 'Svobodné povolání / autorská práva (paušál 40 %)' },
  { value: 'najem', label: 'Nájem majetku v obchodním majetku (paušál 30 %)' },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
      {children}
    </span>
  );
}

export function InputForm({
  value,
  onChange,
}: {
  value: CalcInput;
  onChange: (next: CalcInput) => void;
}) {
  const set = (patch: Partial<CalcInput>) => onChange({ ...value, ...patch });
  const numOrUndef = (s: string) => {
    if (s === '') return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  return (
    <form className="grid gap-5 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
      {/* Rok */}
      <label className="flex flex-col">
        <FieldLabel>Rok</FieldLabel>
        <select
          className="field-control"
          value={value.rok}
          onChange={(e) => set({ rok: Number(e.target.value) as Rok })}
        >
          {dostupneRoky.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      {/* Roční obrat */}
      <label className="flex flex-col">
        <FieldLabel>Roční obrat (příjmy)</FieldLabel>
        <input
          type="number"
          inputMode="numeric"
          className="field-control nums"
          value={Number.isFinite(value.prijmy) ? value.prijmy : ''}
          onChange={(e) => set({ prijmy: Number(e.target.value) || 0 })}
        />
      </label>

      {/* Typ činnosti */}
      <label className="flex flex-col sm:col-span-2">
        <FieldLabel>Typ činnosti</FieldLabel>
        <select
          className="field-control"
          value={value.typCinnosti}
          onChange={(e) => set({ typCinnosti: e.target.value as TypCinnosti })}
        >
          {TYPY.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      {/* Skutečné výdaje */}
      <label className="flex flex-col">
        <FieldLabel>Skutečné výdaje (volitelné)</FieldLabel>
        <input
          type="number"
          inputMode="numeric"
          placeholder="nezadáno"
          className="field-control nums"
          value={value.vydaje ?? ''}
          onChange={(e) => set({ vydaje: numOrUndef(e.target.value) })}
        />
      </label>

      {/* Počet dětí */}
      <label className="flex flex-col">
        <FieldLabel>Počet dětí (volitelné)</FieldLabel>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className="field-control nums"
          value={value.pocetDeti ?? ''}
          onChange={(e) => set({ pocetDeti: numOrUndef(e.target.value) })}
        />
      </label>

      {/* Checkboxes */}
      <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={value.zacinajiciOSVC ?? false}
          onChange={(e) => set({ zacinajiciOSVC: e.target.checked })}
        />
        <span className="text-sm leading-snug text-[var(--color-text)]">
          Začínající OSVČ
          <span className="ml-1 text-[var(--color-text-muted)]">(rok zahájení + 2 následující)</span>
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={value.platceDPH ?? false}
          onChange={(e) => set({ platceDPH: e.target.checked })}
        />
        <span className="text-sm leading-snug text-[var(--color-text)]">
          Plátce DPH
        </span>
      </label>
    </form>
  );
}
