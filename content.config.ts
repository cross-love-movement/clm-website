import { defineCollection, defineContentConfig, property } from '@nuxt/content'
import { z } from 'zod'

/**
 * Editorial content that changes often enough to need a writing workflow.
 * Testimonials, partners, site settings, and programme copy stay in typed code
 * because they depend on nested structures or need an explicit sign-off.
 *
 * The `property(...).editor(...)` metadata below only affects the Nuxt Studio
 * form (labels, helper text, pickers). It does not change validation.
 */
export default defineContentConfig({
  collections: {
    news: defineCollection({
      type: 'page',
      source: 'news/**/*.md',
      schema: z.object({
        title: property(z.string()).editor({ label: 'Headline' }),
        category: property(z.enum(['story', 'update', 'reflection', 'event'])).editor({
          label: 'Section',
          description: 'Which tab of the newsroom this story appears under.',
        }),
        excerpt: property(z.string()).editor({
          input: 'textarea',
          description:
            'One or two sentences. Shown on cards, in search results, and in social previews.',
        }),
        publishedAt: property(z.string()).editor({
          label: 'Published on',
          description: 'Date the story goes live, e.g. 2026-03-14.',
        }),
        author: property(z.string()).editor({
          description: 'Name shown under the headline. Leave as the person who wrote it.',
        }),
        readingMinutes: property(z.number().int().positive()).editor({
          label: 'Reading time (minutes)',
          description: 'Rough guide for readers: total words divided by 200, rounded up.',
        }),
        image: property(z.string()).editor({
          label: 'Cover image',
          input: 'media',
        }),
        imageAlt: property(z.string()).editor({
          label: 'Cover image description',
          description:
            'Describe what is in the photo for screen readers and when images fail to load.',
        }),
        featured: property(z.boolean().default(false)).editor({
          description: 'Featured stories are promoted on the home page.',
        }),
        // Built into `type: 'page'` collections. Nuxt Content derives it from the
        // first paragraph and this site never renders it (it uses `excerpt`),
        // so keep it out of the Studio form instead of offering a field that
        // silently does nothing.
        description: property(z.string()).editor({ hidden: true }),
      }),
    }),

    events: defineCollection({
      type: 'data',
      source: 'events/*.yml',
      schema: z.object({
        slug: property(z.string()).editor({
          description:
            'Stable identifier used by links and the registration form. Do not change it once shared.',
        }),
        title: property(z.string()).editor({ label: 'Event name' }),
        category: property(
          z.enum(['session', 'training', 'workshop', 'devotion', 'outreach', 'showcase']),
        ).editor({ label: 'Type of event' }),
        summary: property(z.string()).editor({
          input: 'textarea',
          description: 'One sentence used on cards and in the events list.',
        }),
        description: property(z.array(z.string())).editor({
          label: 'Full description',
          description: 'One paragraph per entry. Each becomes a paragraph on the events page.',
        }),
        startsAt: property(z.string()).editor({
          label: 'Starts',
          description: 'Date and time with timezone, e.g. 2026-11-14T17:00:00+00:00.',
        }),
        endsAt: property(z.string()).editor({
          label: 'Ends',
          description: 'Date and time with timezone, e.g. 2026-11-14T20:00:00+00:00.',
        }),
        venue: property(z.string()).editor({ label: 'Venue name' }),
        address: property(z.string()).editor({
          description: 'Street address as it should appear to someone travelling there.',
        }),
        city: property(z.string()).editor({ label: 'City / town' }),
        capacity: property(z.number().int().nonnegative()).editor({
          label: 'Places available',
          description: 'Total seats. The site warns people once registrations reach this number.',
        }),
        registered: property(z.number().int().nonnegative()).editor({
          label: 'Places already taken',
          description:
            'Update this by hand after off-site registrations so the places-left figure stays honest.',
        }),
        registrationDeadline: property(z.string().optional()).editor({
          label: 'Registration closes',
          description:
            'Optional. Date and time with timezone; leave blank to keep registration open.',
        }),
        featured: property(z.boolean().default(false)).editor({
          description: 'Featured events are highlighted on the home page.',
        }),
      }),
    }),

    portfolio: defineCollection({
      type: 'data',
      source: 'portfolio/*.yml',
      schema: z.object({
        slug: property(z.string()).editor({
          description: 'Stable identifier for this piece. Do not change it once shared.',
        }),
        title: property(z.string()).editor({ label: 'Title' }),
        category: property(
          z.enum(['performances', 'recordings', 'outreach', 'creation', 'church']),
        ).editor({ label: 'Category' }),
        year: property(z.string()).editor({ description: 'Year the work happened, e.g. 2026.' }),
        location: property(z.string()).editor({ description: 'Where it happened.' }),
        summary: property(z.string()).editor({
          input: 'textarea',
          description: 'One sentence used on the portfolio card.',
        }),
        description: property(z.array(z.string())).editor({
          label: 'Full description',
          description: 'One paragraph per entry.',
        }),
        image: property(z.string()).editor({ label: 'Image', input: 'media' }),
        imageAlt: property(z.string()).editor({
          label: 'Image description',
          description: 'Describe what is in the photo for screen readers.',
        }),
        tags: property(z.array(z.string())).editor({
          description: 'A few short keywords, e.g. "Tema", "youth choir", "recycling".',
        }),
        link: property(
          z
            .object({
              label: z.string(),
              to: z.string(),
            })
            .optional(),
        ).editor({
          label: 'External link',
          description: 'Optional. Only add a link to media you have permission to share publicly.',
        }),
        order: property(z.number().int().nonnegative()).editor({
          description: 'Lower numbers appear first on the portfolio page.',
        }),
      }),
    }),

    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: property(z.string()).editor({ label: 'Project name' }),
        category: property(z.enum(['gospel', 'artistes', 'environment', 'community'])).editor({
          label: 'Focus area',
        }),
        summary: property(z.string()).editor({
          input: 'textarea',
          description: 'Two or three sentences shown at the top of the project page and on cards.',
        }),
        location: property(z.string()).editor({ description: 'Where the work happens.' }),
        status: property(z.enum(['active', 'completed', 'upcoming'])).editor({
          description: 'Drives the badge and the impact heading on the project page.',
        }),
        timeframe: property(z.string()).editor({
          description: 'Free text, e.g. "Ongoing since 2024" or "March – June 2026".',
        }),
        image: property(z.string()).editor({ label: 'Main image', input: 'media' }),
        imageAlt: property(z.string()).editor({
          label: 'Image description',
          description: 'Describe what is in the photo for screen readers.',
        }),
        accent: property(z.enum(['brand', 'clay'])).editor({
          label: 'Card accent colour',
          description: 'Controls the card tint on the projects page. Cosmetics only.',
        }),
        featured: property(z.boolean().default(false)).editor({
          description: 'Featured projects are highlighted on the home page.',
        }),
        goals: property(z.array(z.string())).editor({
          label: 'What we set out to do',
          description: 'One goal per entry. Each becomes a bullet on the project page.',
        }),
        impact: property(
          z.array(
            z.object({
              value: z.string(),
              label: z.string(),
            }),
          ),
        ).editor({
          label: 'Impact figures',
          description:
            'Only publish numbers you can point to. Leave the list short rather than approximate.',
        }),
        needs: property(z.array(z.string())).editor({
          label: 'What this project needs',
          description: 'Short phrases, e.g. "Transport for the choir", "Studio time".',
        }),
        order: property(z.number().int().nonnegative()).editor({
          description: 'Lower numbers appear first on the projects page.',
        }),
        // Built into `type: 'page'` collections. Derived from the first
        // paragraph and never rendered by this site (it uses `summary`), so
        // hide it rather than offering an inert field.
        description: property(z.string()).editor({ hidden: true }),
      }),
    }),
  },
})
