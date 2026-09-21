import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

const reportSchema = z.object({
  kind: z.literal('report'),
  series: z.string().min(1),
  period: z.string().min(1),
  reportType: z.enum(['weekly', 'monthly', 'annual']),
  intensity: z.number().int().min(0).max(10).nullable(),
  confrontation: z.enum(['stable', 'tension', 'preparations', 'attack']).nullable(),
});

export type ReportData = z.infer<typeof reportSchema>;

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.discriminatedUnion('kind', [
        reportSchema,
        z.object({ kind: z.literal('series') }),
        z.object({ kind: z.literal('methodology') }),
        z.object({ kind: z.undefined().optional() }),
      ]),
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
