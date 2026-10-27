import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

/**
 * Editorial content that changes often enough to need a writing workflow.
 * Projects, testimonials, partners, and programme copy stay in typed code.
 */
export default defineContentConfig({
  collections: {
    news: defineCollection({
      type: 'page',
      source: 'news/**/*.md',
      schema: z.object({
        title: z.string(),
        category: z.enum(['story', 'update', 'reflection', 'event']),
        excerpt: z.string(),
        publishedAt: z.string(),
        author: z.string(),
        readingMinutes: z.number().int().positive(),
        image: z.string(),
        imageAlt: z.string(),
        featured: z.boolean().default(false),
      }),
    }),

    events: defineCollection({
      type: 'data',
      source: 'events/*.yml',
      schema: z.object({
        slug: z.string(),
        title: z.string(),
        category: z.enum(['session', 'training', 'workshop', 'devotion', 'outreach', 'showcase']),
        summary: z.string(),
        description: z.array(z.string()),
        startsAt: z.string(),
        endsAt: z.string(),
        venue: z.string(),
        address: z.string(),
        city: z.string(),
        capacity: z.number().int().nonnegative(),
        registered: z.number().int().nonnegative(),
        registrationDeadline: z.string().optional(),
        featured: z.boolean().default(false),
      }),
    }),

    portfolio: defineCollection({
      type: 'data',
      source: 'portfolio/*.yml',
      schema: z.object({
        slug: z.string(),
        title: z.string(),
        category: z.enum(['performances', 'recordings', 'outreach', 'creation', 'church']),
        year: z.string(),
        location: z.string(),
        summary: z.string(),
        description: z.array(z.string()),
        image: z.string(),
        imageAlt: z.string(),
        tags: z.array(z.string()),
        link: z
          .object({
            label: z.string(),
            to: z.string(),
          })
          .optional(),
        order: z.number().int().nonnegative(),
      }),
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        category: z.enum(['gospel', 'artistes', 'environment', 'community']),
        summary: z.string(),
        location: z.string(),
        status: z.enum(['active', 'completed', 'upcoming']),
        timeframe: z.string(),
        image: z.string(),
        imageAlt: z.string(),
        accent: z.enum(['brand', 'clay']),
        featured: z.boolean().default(false),
        goals: z.array(z.string()),
        impact: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        ),
        needs: z.array(z.string()),
        order: z.number().int().nonnegative(),
      }),
    }),
  },
})
