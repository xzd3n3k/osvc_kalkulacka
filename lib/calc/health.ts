import type { Legislation } from '../legislation/schema';
import { ceilKc } from './rounding';

export interface HealthResult {
  vymerovaciZaklad: number;
  zdravotni: number;
  naMinimu: boolean;
}

export function vypocetZdravotniho(zisk: number, cfg: Legislation): HealthResult {
  const minRocni = cfg.zdravotni.minMesicniVZ * 12;
  const vypocteny = cfg.zdravotni.podilVZ * Math.max(0, zisk);
  const vz = Math.max(vypocteny, minRocni); // bez horního stropu
  return {
    vymerovaciZaklad: vz,
    zdravotni: ceilKc(vz * cfg.zdravotni.sazba),
    naMinimu: vypocteny < minRocni,
  };
}
