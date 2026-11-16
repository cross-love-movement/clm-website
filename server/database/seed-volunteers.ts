import { eq } from 'drizzle-orm'

import { useDatabase } from './client'
import { events, programmes, volunteerNeeds, volunteerOpportunities } from './schema'

/**
 * A bootstrap programme so the public volunteer form has something real to
 * show on a fresh database. Disable with SEED_VOLUNTEER_PROGRAMMES=false.
 */
export async function seedVolunteerProgrammes() {
  const database = useDatabase()
  const existing = await database.select({ id: programmes.id }).from(programmes).limit(1)

  if (existing.length > 0) return 0

  const [programme] = await database
    .insert(programmes)
    .values({
      slug: 'people-like-you-2027',
      title: 'People Like You 2027',
      type: 'symposium',
      summary:
        'A one-day youth empowerment symposium in Tema bringing 700–1,000 young people together with mentors.',
      description:
        'People Like You is our one-day youth empowerment and capacity-building symposium in the Tema enclave. Volunteers help with mentoring, registration, media, logistics, and welfare.',
      location: 'Tema, Ghana',
      contentPath: '/projects/people-like-you',
      status: 'planned',
      startsAt: new Date('2027-06-12T09:00:00+00:00'),
      endsAt: new Date('2027-06-12T16:00:00+00:00'),
    })
    .returning()

  if (!programme) return 0

  const roles = [
    {
      title: 'Mentor',
      description:
        'Guide small groups of young people through career, faith, and life conversations.',
      commitment: '2–4 hours a month',
      requirements: [
        'Practical experience in your field',
        'Comfortable working with young people',
        'Complete the safeguarding briefing',
      ],
      location: 'Tema',
      /** Places this programme needs in the role. */
      places: 40,
    },
    {
      title: 'Registration desk',
      description: 'Welcome guests, check names, and hand out materials on the day.',
      commitment: 'Event day',
      requirements: ['Comfortable with a busy front desk', 'Available from 07:30'],
      location: 'Tema',
      places: 12,
    },
    {
      title: 'Media & photography',
      description: 'Capture the day for the website and social channels.',
      commitment: 'Event day',
      requirements: ['Own camera or phone with good video', 'Some editing experience helps'],
      location: 'Tema',
      places: 4,
    },
    {
      title: 'Logistics',
      description: 'Setup, seating, sound support, and pack-down.',
      commitment: 'Event day',
      requirements: ['Comfortable with practical setup and carrying supplies'],
      location: 'Tema',
      places: 10,
    },
    {
      title: 'Welfare',
      description: 'Look after speakers, volunteers, and guests through the day.',
      commitment: 'Event day',
      requirements: ['Warm, calm manner', 'Complete the safeguarding briefing'],
      location: 'Tema',
      places: 6,
    },
  ]

  const inserted = await database
    .insert(volunteerOpportunities)
    .values(
      roles.map((role) => ({
        title: role.title,
        description: role.description,
        commitment: role.commitment,
        requirements: role.requirements,
        location: role.location,
        status: 'open' as const,
      })),
    )
    .returning({ id: volunteerOpportunities.id, title: volunteerOpportunities.title })

  const placesByTitle = new Map(roles.map((role) => [role.title, role.places]))

  // The symposium exists as an event too; its day roles belong to the event,
  // while mentoring keeps running under the programme.
  const [event] = await database
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, 'people-like-you-2027'))
    .limit(1)

  const eventTitles = new Set(['Registration desk', 'Media & photography', 'Logistics', 'Welfare'])

  await database.insert(volunteerNeeds).values(
    inserted.map((row) => {
      const onEvent = Boolean(event) && eventTitles.has(row.title)

      return {
        programmeId: onEvent ? null : programme.id,
        eventId: onEvent ? (event?.id ?? null) : null,
        opportunityId: row.id,
        places: placesByTitle.get(row.title) ?? null,
      }
    }),
  )

  return 1 + inserted.length
}
