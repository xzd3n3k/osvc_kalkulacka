import type { Legislation } from '../legislation/schema';
import { floorTo100, ceilKc } from './rounding';

export interface IncomeTaxResult {
  zaklad: number;
  danPredSlevami: number;
  slevaPoplatnik: number;
  zvyhodneniDeti: number;
  dan: number;
}

export function vypocetZvyhodneniDeti(
  pocetDeti: number,
  tiery: readonly [number, number, number],
): number {
  let suma = 0;
  for (let i = 0; i < pocetDeti; i++) suma += tiery[Math.min(i, 2)];
  return suma;
}

export function vypocetDane(zisk: number, cfg: Legislation, pocetDeti = 0): IncomeTaxResult {
  const zaklad = Math.max(0, floorTo100(zisk));
  const { sazbaZakladni, sazbaZvysena, prah23, slevaPoplatnik, zvyhodneniDeti } = cfg.dan;
  const danPredSlevami = ceilKc(
    sazbaZakladni * Math.min(zaklad, prah23) + sazbaZvysena * Math.max(0, zaklad - prah23),
  );
  const pouzitaSleva = Math.min(danPredSlevami, slevaPoplatnik);
  const poSleve = danPredSlevami - pouzitaSleva;
  const zvyh = vypocetZvyhodneniDeti(pocetDeti, zvyhodneniDeti);
  return {
    zaklad,
    danPredSlevami,
    slevaPoplatnik: pouzitaSleva,
    zvyhodneniDeti: zvyh,
    dan: poSleve - zvyh,
  };
}
