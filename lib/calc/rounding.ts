/** Zaokrouhlí dolů na celé stokoruny (daňový základ). */
export const floorTo100 = (x: number): number => Math.floor(x / 100) * 100;

/**
 * Zaokrouhlí nahoru na celé koruny (pojistné, daň).
 * Nejprve eliminuje drobné plovoucí chyby (zaokrouhlí na 6 des. míst),
 * pak aplikuje Math.ceil — jinak by např. 450 000 × 0,135 = 60 750,000…01
 * dalo o 1 Kč více.
 */
export const ceilKc = (x: number): number => Math.ceil(Math.round(x * 1_000_000) / 1_000_000);
