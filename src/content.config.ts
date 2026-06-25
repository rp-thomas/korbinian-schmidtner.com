import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const angebote = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/angebote' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    kategorie: z.enum(['sommer', 'winter']),
    heroImage: image(),
    beschreibung: z.string(),
    leistungen: z.array(z.string()),
    voraussetzungen: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional(),
    order: z.number().optional(),
  }),
});

export const collections = { angebote };
