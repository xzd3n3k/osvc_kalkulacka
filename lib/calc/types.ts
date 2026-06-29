export type Rok = 2025 | 2026;
export type TypCinnosti = 'remeslna' | 'zivnost' | 'svobodne' | 'najem';
export type Pasmo = 'I' | 'II' | 'III';
export type RezimDruh = 'pausal' | 'skutecne' | 'pausalniDan';

export interface CalcInput {
  rok: Rok;
  prijmy: number;
  vydaje?: number | null;
  typCinnosti: TypCinnosti;
  zacinajiciOSVC?: boolean;
  platceDPH?: boolean;
  pocetDeti?: number;
}

export interface RegimeResult {
  id: string;
  druh: RezimDruh;
  nazev: string;
  eligible: boolean;
  duvodNedostupnosti?: string;
  danovyZaklad: number | null;
  danPrijem: number | null;
  socialni: number | null;
  zdravotni: number | null;
  odvodyCelkem: number | null;
  cistyZbytek: number | null;
  jeTvujTyp?: boolean;
  naMinimuSocialni?: boolean;
  naMinimuZdravotni?: boolean;
  naMaximuSocialni?: boolean;
  upozorneni: string[];
}

export interface CalcOutput {
  rok: Rok;
  zadalVydaje: boolean;
  rezimy: RegimeResult[];
  nejlepsiId: string | null;
}
