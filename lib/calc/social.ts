import type { Legislation } from '../legislation/schema';
import { ceilKc } from './rounding';

export interface SocialResult {
  vymerovaciZaklad: number;
  socialni: number;
  naMinimu: boolean;
  naMaximu: boolean;
}

export function vypocetSocialniho(
  zisk: number,
  cfg: Legislation,
  zacinajici = false,
): SocialResult {
  const minMes = zacinajici
    ? cfg.socialni.minMesicniVZ_zacinajici
    : cfg.socialni.minMesicniVZ_hlavni;
  const minRocni = minMes * 12;
  const max = cfg.socialni.maxRocniVZ;
  const vypocteny = cfg.socialni.podilVZ * Math.max(0, zisk);

  let vz = Math.max(vypocteny, minRocni);
  let naMaximu = false;
  if (vz > max) {
    vz = max;
    naMaximu = true;
  }

  vz = Math.round(vz);

  return {
    vymerovaciZaklad: vz,
    socialni: ceilKc(vz * cfg.socialni.sazba),
    naMinimu: vypocteny < minRocni,
    naMaximu,
  };
}
