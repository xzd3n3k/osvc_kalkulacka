import type { Legislation } from '../legislation/schema';
import type { TypCinnosti, Pasmo } from './types';

export interface PausalniDanRezim {
  pasmo: Pasmo;
  eligible: boolean;
  duvod?: string;
  danMesic: number;
  socialniMesic: number;
  zdravotniMesic: number;
  celkemMesic: number;
  danRok: number;
  socialniRok: number;
  zdravotniRok: number;
  celkemRok: number;
}

export function jeZpusobilyProPasmo(
  pasmo: Pasmo,
  prijmy: number,
  typ: TypCinnosti,
  platceDPH: boolean,
  limit: number,
): { eligible: boolean; duvod?: string } {
  if (platceDPH) return { eligible: false, duvod: 'Paušální daň je jen pro neplátce DPH.' };
  if (prijmy > limit) {
    return { eligible: false, duvod: `Obrat nad ${limit.toLocaleString('cs-CZ')} Kč.` };
  }
  const je80 = typ === 'remeslna';
  const je60u80 = typ === 'remeslna' || typ === 'zivnost';
  switch (pasmo) {
    case 'I':
      if (prijmy <= 1_000_000) return { eligible: true };
      if (prijmy <= 1_500_000 && je60u80) return { eligible: true };
      if (prijmy <= 2_000_000 && je80) return { eligible: true };
      return { eligible: false, duvod: 'Obrat je pro 1. pásmo u tohoto typu činnosti příliš vysoký.' };
    case 'II':
      if (prijmy <= 1_500_000) return { eligible: true };
      if (prijmy <= 2_000_000 && je60u80) return { eligible: true };
      return { eligible: false, duvod: 'Obrat je pro 2. pásmo u tohoto typu činnosti příliš vysoký.' };
    case 'III':
      if (prijmy <= 2_000_000) return { eligible: true };
      return { eligible: false, duvod: 'Obrat nad 2 mil. Kč.' };
  }
}

export function vypocetPausalniDane(
  pasmo: Pasmo,
  prijmy: number,
  typ: TypCinnosti,
  platceDPH: boolean,
  cfg: Legislation,
): PausalniDanRezim {
  const p = cfg.pausalniDan[pasmo];
  const { eligible, duvod } = jeZpusobilyProPasmo(
    pasmo,
    prijmy,
    typ,
    platceDPH,
    cfg.pausalniVydaje.limit,
  );
  return {
    pasmo,
    eligible,
    duvod,
    danMesic: p.danMesic,
    socialniMesic: p.socialniMesic,
    zdravotniMesic: p.zdravotniMesic,
    celkemMesic: p.celkemMesic,
    danRok: p.danMesic * 12,
    socialniRok: p.socialniMesic * 12,
    zdravotniRok: p.zdravotniMesic * 12,
    celkemRok: p.celkemMesic * 12,
  };
}
