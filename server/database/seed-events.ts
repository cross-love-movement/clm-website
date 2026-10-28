import { useDatabase } from './client'
import { events, type NewEvent } from './schema'

/**
 * Bootstrap events, inserted only when the events table is empty.
 *
 * This is seed data, not content: once the admin screens exist, events are
 * created there. Keeping one real event means the public site has something
 * to show on a fresh database.
 */
const BOOTSTRAP_EVENTS: NewEvent[] = [
  {
    slug: 'people-like-you-2027',
    title: 'People Like You: Youth Empowerment Symposium',
    category: 'workshop',
    summary:
      'A one-day symposium in Tema bringing 700–1,000 young people together with mentors for practical career and life guidance.',
    description: [
      'People Like You is a one-day, in-person youth empowerment and capacity-building symposium',
      'for young people across junior and secondary school, tertiary education, and those looking',
      'for work. It is held in the Tema enclave and marks the run-up to ten years of community',
      'engagement in April 2028.',
    ].join(' '),
    startsAt: new Date('2027-06-12T09:00:00+00:00'),
    endsAt: new Date('2027-06-12T16:00:00+00:00'),
    venue: 'Venue to be confirmed',
    address: '',
    city: 'Tema',
    capacity: 1000,
    registrationDeadline: new Date('2027-06-05T23:59:00+00:00'),
    status: 'published',
    featured: true,
    image: '/images/portfolio-stage.svg',
    imageAlt: 'Abstract artwork of a stage lit for a performance',
  },
]

export async function seedEvents() {
  const database = useDatabase()
  const existing = await database.select({ id: events.id }).from(events).limit(1)

  if (existing.length > 0) return 0

  await database.insert(events).values(BOOTSTRAP_EVENTS)

  return BOOTSTRAP_EVENTS.length
}
