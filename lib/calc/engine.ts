import { getLegislation, type Legislation } from '../legislation';
import type { CalcInput, CalcOutput, RegimeResult, TypCinnosti, Pasmo } from './types';
import { vypocetDane } from './income-tax';
import { vypocetSocialniho } from './social';
import { vypocetZdravotniho } from './health';
import { vypocetPausalnichVydaju } from './pausalni-vydaje';
import { vypocetPausalniDane } from './pausalni-dan';

const TYPY: { typ: TypCinnosti; nazev: string }[] = [
  { typ: 'remeslna', nazev: 'Paušál 80 %' },
  { typ: 'zivnost', nazev: 'Paušál 60 %' },
  { typ: 'svobodne', nazev: 'Paušál 40 %' },
  { typ: 'najem', nazev: 'Paušál 30 %' },
];
const PASMA: Pasmo[] = ['I', 'II', 'III'];

function ordinaryRegime(
  id: string,
  nazev: string,
  druh: 'pausal' | 'skutecne',
  zisk: number,
  input: CalcInput,
  cfg: Legislation,
  realExpenses: number,
  zadalVydaje: boolean,
  jeTvujTyp: boolean,
): RegimeResult {
  const tax = vypocetDane(zisk, cfg, input.pocetDeti ?? 0);
  const soc = vypocetSocialniho(zisk, cfg, input.zacinajiciOSVC ?? false);
  const hea = vypocetZdravotniho(zisk, cfg);
  const odvody = tax.dan + soc.socialni + hea.zdravotni;
  const cisty = input.prijmy - odvody - realExpenses;

  const upozorneni: string[] = [];
  if (soc.naMinimu) upozorneni.push('Sociální vychází na minimum (reálný přeplatek).');
  if (hea.naMinimu) upozorneni.push('Zdravotní vychází na minimum (reálný přeplatek).');
  if (soc.naMaximu) upozorneni.push('Sociální je na maximálním vyměřovacím základu.');
  if (tax.dan < 0) upozorneni.push('Daňový bonus na děti (záporná daň).');
  if (!zadalVydaje) upozorneni.push('Čistý zbytek je před odečtením reálných výdajů.');

  return {
    id,
    druh,
    nazev,
    eligible: true,
    danovyZaklad: tax.zaklad,
    danPrijem: tax.dan,
    socialni: soc.socialni,
    zdravotni: hea.zdravotni,
    odvodyCelkem: odvody,
    cistyZbytek: cisty,
    jeTvujTyp,
    naMinimuSocialni: soc.naMinimu,
    naMinimuZdravotni: hea.naMinimu,
    naMaximuSocialni: soc.naMaximu,
    upozorneni,
  };
}

function neeligible(
  id: string,
  druh: RegimeResult['druh'],
  nazev: string,
  duvod: string | undefined,
  jeTvujTyp = false,
): RegimeResult {
  return {
    id, druh, nazev, eligible: false, duvodNedostupnosti: duvod,
    danovyZaklad: null, danPrijem: null, socialni: null, zdravotni: null,
    odvodyCelkem: null, cistyZbytek: null, jeTvujTyp, upozorneni: [],
  };
}

export function calculate(input: CalcInput): CalcOutput {
  const cfg = getLegislation(input.rok);
  const zadalVydaje = input.vydaje != null;
  const realExpenses = input.vydaje ?? 0;
  const rezimy: RegimeResult[] = [];

  // 1) Paušální výdaje — všechny 4
  for (const { typ, nazev } of TYPY) {
    const v = vypocetPausalnichVydaju(input.prijmy, typ, cfg);
    const id = `pausal-${typ}`;
    const jeTvuj = typ === input.typCinnosti;
    if (!v.eligible) {
      rezimy.push(neeligible(id, 'pausal', nazev, v.duvod, jeTvuj));
    } else {
      const zisk = Math.max(0, input.prijmy - v.vydaje);
      rezimy.push(ordinaryRegime(id, nazev, 'pausal', zisk, input, cfg, realExpenses, zadalVydaje, jeTvuj));
    }
  }

  // 2) Skutečné výdaje — jen když zadané
  if (zadalVydaje) {
    const zisk = Math.max(0, input.prijmy - realExpenses);
    rezimy.push(ordinaryRegime('skutecne', 'Skutečné výdaje', 'skutecne', zisk, input, cfg, realExpenses, zadalVydaje, false));
  }

  // 3) Paušální daň — 3 pásma
  for (const pasmo of PASMA) {
    const pd = vypocetPausalniDane(pasmo, input.prijmy, input.typCinnosti, input.platceDPH ?? false, cfg);
    const id = `pausalniDan-${pasmo}`;
    const nazev = `Paušální daň ${pasmo}. pásmo`;
    if (!pd.eligible) {
      rezimy.push(neeligible(id, 'pausalniDan', nazev, pd.duvod));
    } else {
      const cisty = input.prijmy - pd.celkemRok - realExpenses;
      const upozorneni = ['Paušální daň ruší slevy i daňové zvýhodnění (i na děti).'];
      if (!zadalVydaje) upozorneni.push('Čistý zbytek je před odečtením reálných výdajů.');
      rezimy.push({
        id, druh: 'pausalniDan', nazev, eligible: true,
        danovyZaklad: null, danPrijem: pd.danRok, socialni: pd.socialniRok, zdravotni: pd.zdravotniRok,
        odvodyCelkem: pd.celkemRok, cistyZbytek: cisty, upozorneni,
      });
    }
  }

  // 4) Nejvýhodnější = nejvyšší čistý zbytek; při shodě nejnižší odvody celkem
  let nejlepsiId: string | null = null;
  let nejCisty = -Infinity;
  let nejOdvody = Infinity;
  for (const r of rezimy) {
    if (r.eligible && r.cistyZbytek != null && r.odvodyCelkem != null) {
      if (
        r.cistyZbytek > nejCisty ||
        (r.cistyZbytek === nejCisty && r.odvodyCelkem < nejOdvody)
      ) {
        nejCisty = r.cistyZbytek;
        nejOdvody = r.odvodyCelkem;
        nejlepsiId = r.id;
      }
    }
  }

  return { rok: input.rok, zadalVydaje, rezimy, nejlepsiId };
}
