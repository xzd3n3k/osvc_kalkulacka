import { z } from 'zod';

const pasmoSchema = z.object({
  celkemMesic: z.number().nonnegative(),
  danMesic: z.number().nonnegative(),
  socialniMesic: z.number().nonnegative(),
  zdravotniMesic: z.number().nonnegative(),
});

export const legislationSchema = z.object({
  rok: z.number().int(),
  prumernaMzda: z.number().positive(),
  dan: z.object({
    sazbaZakladni: z.number(),
    sazbaZvysena: z.number(),
    prah23: z.number().positive(),
    slevaPoplatnik: z.number().nonnegative(),
    zvyhodneniDeti: z.tuple([z.number(), z.number(), z.number()]),
  }),
  pausalniVydaje: z.object({
    limit: z.number().positive(),
    sazby: z.object({
      remeslna: z.object({ pct: z.number(), cap: z.number() }),
      zivnost: z.object({ pct: z.number(), cap: z.number() }),
      svobodne: z.object({ pct: z.number(), cap: z.number() }),
      najem: z.object({ pct: z.number(), cap: z.number() }),
    }),
  }),
  socialni: z.object({
    sazba: z.number(),
    podilVZ: z.number(),
    minMesicniVZ_hlavni: z.number(),
    minMesicniVZ_zacinajici: z.number(),
    maxRocniVZ: z.number(),
    minMesicniZaloha_hlavni: z.number(),
    minMesicniZaloha_zacinajici: z.number(),
  }),
  zdravotni: z.object({
    sazba: z.number(),
    podilVZ: z.number(),
    minMesicniVZ: z.number(),
    minMesicniZaloha: z.number(),
  }),
  pausalniDan: z.object({ I: pasmoSchema, II: pasmoSchema, III: pasmoSchema }),
  zdroje: z.object({
    dan: z.string().url(),
    pausalniVydaje: z.string().url(),
    socialni: z.string().url(),
    zdravotni: z.string().url(),
    pausalniDan: z.string().url(),
  }),
  overenoDne: z.string(),
});

export type Legislation = z.infer<typeof legislationSchema>;
