import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Team'),
    draft: z.boolean().default(false),
    postLayout: z.number().min(1).max(3).default(1).optional(),
    cover: image().optional(),
    category: z.string().optional(),
    readingTime: z.number().optional(),
    featured: z.boolean().default(false),
  }),
});

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
    docsLayout: z.enum(['liquid', 'glass']).default('liquid').optional(),
    draft: z.boolean().default(false),
    // Version and category for scalable docs
    version: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Metadata
    lastUpdated: z.coerce.date().optional(),
    readingTime: z.number().optional(),
    // Deprecation info
    deprecated: z.boolean().default(false),
    since: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  docs: docsCollection,
};
