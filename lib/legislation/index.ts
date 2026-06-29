import { legislationSchema, type Legislation } from './schema';
import { legislation2025 } from './2025';
import { legislation2026 } from './2026';

const registry: Record<number, Legislation> = {
  2025: legislationSchema.parse(legislation2025),
  2026: legislationSchema.parse(legislation2026),
};

export const dostupneRoky: number[] = Object.keys(registry)
  .map(Number)
  .sort((a, b) => a - b);

export function getLegislation(rok: number): Legislation {
  const l = registry[rok];
  if (!l) throw new Error(`Legislativa pro rok ${rok} není k dispozici.`);
  return l;
}

export type { Legislation };
