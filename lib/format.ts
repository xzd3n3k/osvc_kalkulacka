export const formatNum = (x: number): string =>
  new Intl.NumberFormat('cs-CZ', { maximumFractionDigits: 0 }).format(x);

export const formatCZK = (x: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(x);

export const formatPct = (x: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(x);
