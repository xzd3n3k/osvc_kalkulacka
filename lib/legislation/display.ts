import type { Legislation } from './schema';
import { formatCZK, formatPct, formatNum } from '../format';

export interface LegislationRow {
  skupina: string;
  polozka: string;
  hodnota: string;
  zdroj: string;
  platiOd: string;
  popis?: string;
}

export function buildLegislationRows(cfg: Legislation): LegislationRow[] {
  const platiOd = `1. 1. ${cfg.rok}`;
  const z = cfg.zdroje;

  return [
    // Daň z příjmů
    { skupina: 'Daň z příjmů', polozka: 'Základní sazba', hodnota: formatPct(cfg.dan.sazbaZakladni), zdroj: z.dan, platiOd },
    { skupina: 'Daň z příjmů', polozka: 'Zvýšená sazba (nad práh)', hodnota: formatPct(cfg.dan.sazbaZvysena), zdroj: z.dan, platiOd, popis: 'Platí jen na část základu nad prahem.' },
    { skupina: 'Daň z příjmů', polozka: 'Práh pro 23 % (ročně)', hodnota: formatCZK(cfg.dan.prah23), zdroj: z.dan, platiOd, popis: '36× průměrná mzda.' },
    { skupina: 'Daň z příjmů', polozka: 'Sleva na poplatníka (ročně)', hodnota: formatCZK(cfg.dan.slevaPoplatnik), zdroj: z.dan, platiOd },
    { skupina: 'Daň z příjmů', polozka: 'Daňové zvýhodnění na děti (1./2./3.+)', hodnota: cfg.dan.zvyhodneniDeti.map(formatNum).join(' / ') + ' Kč', zdroj: z.dan, platiOd },
    { skupina: 'Daň z příjmů', polozka: 'Průměrná mzda (měsíčně)', hodnota: formatCZK(cfg.prumernaMzda), zdroj: z.dan, platiOd },

    // Paušální výdaje
    { skupina: 'Paušální výdaje', polozka: 'Řemeslná živnost / zemědělství', hodnota: `${formatPct(cfg.pausalniVydaje.sazby.remeslna.pct)}, strop ${formatCZK(cfg.pausalniVydaje.sazby.remeslna.cap)}`, zdroj: z.pausalniVydaje, platiOd },
    { skupina: 'Paušální výdaje', polozka: 'Ostatní živnost', hodnota: `${formatPct(cfg.pausalniVydaje.sazby.zivnost.pct)}, strop ${formatCZK(cfg.pausalniVydaje.sazby.zivnost.cap)}`, zdroj: z.pausalniVydaje, platiOd },
    { skupina: 'Paušální výdaje', polozka: 'Svobodné povolání / autorská práva', hodnota: `${formatPct(cfg.pausalniVydaje.sazby.svobodne.pct)}, strop ${formatCZK(cfg.pausalniVydaje.sazby.svobodne.cap)}`, zdroj: z.pausalniVydaje, platiOd },
    { skupina: 'Paušální výdaje', polozka: 'Nájem (v obchodním majetku)', hodnota: `${formatPct(cfg.pausalniVydaje.sazby.najem.pct)}, strop ${formatCZK(cfg.pausalniVydaje.sazby.najem.cap)}`, zdroj: z.pausalniVydaje, platiOd },
    { skupina: 'Paušální výdaje', polozka: 'Limit obratu pro paušál', hodnota: formatCZK(cfg.pausalniVydaje.limit), zdroj: z.pausalniVydaje, platiOd },

    // Sociální
    { skupina: 'Sociální pojištění', polozka: 'Sazba', hodnota: formatPct(cfg.socialni.sazba), zdroj: z.socialni, platiOd },
    { skupina: 'Sociální pojištění', polozka: 'Vyměřovací základ', hodnota: `${formatPct(cfg.socialni.podilVZ)} zisku`, zdroj: z.socialni, platiOd },
    { skupina: 'Sociální pojištění', polozka: 'Min. měsíční záloha — hlavní', hodnota: formatCZK(cfg.socialni.minMesicniZaloha_hlavni), zdroj: z.socialni, platiOd },
    { skupina: 'Sociální pojištění', polozka: 'Min. měsíční záloha — začínající', hodnota: formatCZK(cfg.socialni.minMesicniZaloha_zacinajici), zdroj: z.socialni, platiOd, popis: 'Rok zahájení + 2 následující roky.' },
    { skupina: 'Sociální pojištění', polozka: 'Max. vyměřovací základ (ročně)', hodnota: formatCZK(cfg.socialni.maxRocniVZ), zdroj: z.socialni, platiOd },

    // Zdravotní
    { skupina: 'Zdravotní pojištění', polozka: 'Sazba', hodnota: formatPct(cfg.zdravotni.sazba), zdroj: z.zdravotni, platiOd },
    { skupina: 'Zdravotní pojištění', polozka: 'Vyměřovací základ', hodnota: `${formatPct(cfg.zdravotni.podilVZ)} zisku`, zdroj: z.zdravotni, platiOd },
    { skupina: 'Zdravotní pojištění', polozka: 'Min. měsíční záloha', hodnota: formatCZK(cfg.zdravotni.minMesicniZaloha), zdroj: z.zdravotni, platiOd, popis: 'Pro začínající OSVČ ŽÁDNÁ úleva — plné minimum od 1. měsíce.' },

    // Paušální daň
    { skupina: 'Paušální daň', polozka: '1. pásmo (měsíčně)', hodnota: formatCZK(cfg.pausalniDan.I.celkemMesic), zdroj: z.pausalniDan, platiOd, popis: cfg.rok === 2026 ? 'Efektivní výše po novele (nominálně vyhlášeno 9 984 Kč).' : undefined },
    { skupina: 'Paušální daň', polozka: '2. pásmo (měsíčně)', hodnota: formatCZK(cfg.pausalniDan.II.celkemMesic), zdroj: z.pausalniDan, platiOd },
    { skupina: 'Paušální daň', polozka: '3. pásmo (měsíčně)', hodnota: formatCZK(cfg.pausalniDan.III.celkemMesic), zdroj: z.pausalniDan, platiOd },
  ];
}
