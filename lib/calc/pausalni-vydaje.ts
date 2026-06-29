import type { Legislation } from '../legislation/schema';
import type { TypCinnosti } from './types';

export interface VydajeResult {
  pct: number;
  cap: number;
  vydaje: number;
  eligible: boolean;
  duvod?: string;
}

export function vypocetPausalnichVydaju(
  prijmy: number,
  typ: TypCinnosti,
  cfg: Legislation,
): VydajeResult {
  const { pct, cap } = cfg.pausalniVydaje.sazby[typ];
  if (prijmy > cfg.pausalniVydaje.limit) {
    return {
      pct,
      cap,
      vydaje: 0,
      eligible: false,
      duvod: `Obrat nad ${cfg.pausalniVydaje.limit.toLocaleString('cs-CZ')} Kč — paušální výdaje nelze uplatnit.`,
    };
  }
  return { pct, cap, vydaje: Math.min(prijmy * pct, cap), eligible: true };
}
