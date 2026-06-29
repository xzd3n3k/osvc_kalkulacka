/** Zaokrouhlí dolů na celé stokoruny (daňový základ). */
export const floorTo100 = (x: number): number => Math.floor(x / 100) * 100;

/** Zaokrouhlí nahoru na celé koruny (pojistné, daň). */
export const ceilKc = (x: number): number => Math.ceil(x);
