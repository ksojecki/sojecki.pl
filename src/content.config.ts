import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        kind: z.enum(['report', 'series', 'methodology']).optional(),
        period: z.string().optional(),
        reportType: z.enum(['weekly', 'monthly', 'annual']).optional(),
        intensity: z.number().int().min(0).max(10).nullable().optional(),
        confrontation: z.enum(['stable', 'tension', 'preparations', 'attack']).nullable().optional(),
      }),
    }),
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
