import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const reportSchema = z
  .object({
    kind: z.literal('report'),
    series: z.string().min(1),
    period: z.string().min(1),
    reportType: z.enum(['weekly', 'monthly', 'annual']),
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    knowledgeDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodComplete: z.boolean(),
    intensity: z.number().int().min(0).max(10).nullable(),
    intensityChange: z.number().int().min(-10).max(10).nullable(),
    confrontation: z.enum(['stable', 'tension', 'preparations', 'attack']).nullable(),
  })
  .superRefine(({ periodComplete, intensityChange }, context) => {
    if (!periodComplete && intensityChange !== null) {
      context.addIssue({
        code: 'custom',
        path: ['intensityChange'],
        message: 'intensityChange must be null when periodComplete is false',
      });
    }
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
