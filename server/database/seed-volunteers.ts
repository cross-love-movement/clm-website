import { useDatabase } from './client'
import { programmes, volunteerOpportunities } from './schema'

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

  await database.insert(volunteerOpportunities).values([
    {
      programmeId: programme.id,
      title: 'Mentor',
      description:
        'Guide small groups of young people through career, faith, and life conversations.',
      commitment: '2–4 hours a month',
      requirements: [
        'Practical experience in your field',
        'Comfortable working with young people',
        'Complete the safeguarding briefing',
      ],
      slots: 40,
      location: 'Tema',
      status: 'open',
    },
    {
      programmeId: programme.id,
      title: 'Registration desk',
      description: 'Welcome guests, check names, and hand out materials on the day.',
      commitment: 'Event day',
      requirements: ['Comfortable with a busy front desk', 'Available from 07:30'],
      slots: 12,
      location: 'Tema',
      status: 'open',
    },
    {
      programmeId: programme.id,
      title: 'Media & photography',
      description: 'Capture the day for the website and social channels.',
      commitment: 'Event day',
      requirements: ['Own camera or phone with good video', 'Some editing experience helps'],
      slots: 4,
      location: 'Tema',
      status: 'open',
    },
    {
      programmeId: programme.id,
      title: 'Logistics',
      description: 'Setup, seating, sound support, and pack-down.',
      commitment: 'Event day',
      requirements: ['Comfortable with practical setup and carrying supplies'],
      slots: 10,
      location: 'Tema',
      status: 'open',
    },
    {
      programmeId: programme.id,
      title: 'Welfare',
      description: 'Look after speakers, volunteers, and guests through the day.',
      commitment: 'Event day',
      requirements: ['Warm, calm manner', 'Complete the safeguarding briefing'],
      slots: 6,
      location: 'Tema',
      status: 'open',
    },
  ])

  return 6
}
