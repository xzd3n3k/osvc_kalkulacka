'use client';

import type { CalcInput, Rok, TypCinnosti } from '@/lib/calc/types';
import { dostupneRoky } from '@/lib/legislation';

const TYPY: { value: TypCinnosti; label: string }[] = [
  { value: 'remeslna', label: 'Řemeslná živnost / zemědělství (paušál 80 %)' },
  { value: 'zivnost', label: 'Ostatní živnost (paušál 60 %)' },
  { value: 'svobodne', label: 'Svobodné povolání / autorská práva (paušál 40 %)' },
  { value: 'najem', label: 'Nájem majetku v obchodním majetku (paušál 30 %)' },
];

export function InputForm({
  value,
  onChange,
}: {
  value: CalcInput;
  onChange: (next: CalcInput) => void;
}) {
  const set = (patch: Partial<CalcInput>) => onChange({ ...value, ...patch });
  const numOrUndef = (s: string) => (s === '' ? undefined : Number(s));

  return (
    <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Rok</span>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={value.rok}
          onChange={(e) => set({ rok: Number(e.target.value) as Rok })}
        >
          {dostupneRoky.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Roční obrat (příjmy)</span>
        <input
          type="number"
          inputMode="numeric"
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={Number.isFinite(value.prijmy) ? value.prijmy : ''}
          onChange={(e) => set({ prijmy: Number(e.target.value) || 0 })}
        />
      </label>

      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="text-sm font-medium">Typ činnosti</span>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={value.typCinnosti}
          onChange={(e) => set({ typCinnosti: e.target.value as TypCinnosti })}
        >
          {TYPY.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Skutečné výdaje (volitelné)</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="nezadáno"
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={value.vydaje ?? ''}
          onChange={(e) => set({ vydaje: numOrUndef(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Počet dětí (volitelné)</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={value.pocetDeti ?? ''}
          onChange={(e) => set({ pocetDeti: numOrUndef(e.target.value) })}
        />
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.zacinajiciOSVC ?? false}
          onChange={(e) => set({ zacinajiciOSVC: e.target.checked })}
        />
        <span className="text-sm">Začínající OSVČ (rok zahájení + 2 následující)</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.platceDPH ?? false}
          onChange={(e) => set({ platceDPH: e.target.checked })}
        />
        <span className="text-sm">Plátce DPH</span>
      </label>
    </form>
  );
}
