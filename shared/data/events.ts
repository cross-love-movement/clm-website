import type { Event, EventCategory } from '#shared/types/content'

/**
 * Placeholder event programme. Dates, venues, and capacities are illustrative —
 * replace them with the real calendar before launch.
 */
export const events: Event[] = [
  {
    slug: 'cross-sessions-accra-november',
    title: 'Cross Sessions: Accra Worship Night',
    category: 'session',
    summary:
      'An evening of worship, testimony, and performance with CLM musicians and guest gospel artistes.',
    description: [
      'Cross Sessions returns to Tema with an evening built around the Word and the musical gift in the room.',
      'CLM musicians lead worship, emerging artistes take the stage, and the host church closes the night in prayer. Come early — seating is first come, first served once registration closes.',
    ],
    startsAt: '2026-11-14T18:00:00+00:00',
    endsAt: '2026-11-14T20:30:00+00:00',
    venue: 'The Church of Pentecost, Community 12 District',
    address: 'Paradise Assembly, Community 12',
    city: 'Tema',
    capacity: 400,
    registered: 286,
    registrationDeadline: '2026-11-12T23:59:00+00:00',
    featured: true,
  },
  {
    slug: 'creation-care-volunteer-training',
    title: 'Creation Care Volunteer Training',
    category: 'training',
    summary:
      'A practical half-day training for volunteers who will teach waste segregation and plastic recovery.',
    description: [
      'This is the training every creation care volunteer completes before teaching in a church, school, or market.',
      'We cover the three practices we teach — segregation, plastic recovery, and recycling — plus how to run a short session with people who have heard it all before.',
    ],
    startsAt: '2026-11-28T09:00:00+00:00',
    endsAt: '2026-11-28T13:00:00+00:00',
    venue: 'CLM Central Office',
    address: '28 Waterbird Lane, Sixth Avenue, Tema Community 11',
    city: 'Accra',
    capacity: 40,
    registered: 23,
    registrationDeadline: '2026-11-25T23:59:00+00:00',
  },
  {
    slug: 'gospel-artiste-clinic',
    title: 'Gospel Artiste Clinic: Craft & Stage',
    category: 'workshop',
    summary:
      'A hands-on clinic on songwriting, stage presence, and the business of a music career that lasts.',
    description: [
      'A small-group clinic for emerging gospel artistes, led by working musicians and producers.',
      'Bring one song you are proud of and one you are stuck on. We will work through both, then finish with a short stage session in front of the room.',
    ],
    startsAt: '2026-12-12T10:00:00+00:00',
    endsAt: '2026-12-12T15:00:00+00:00',
    venue: 'CLM Central Office',
    address: '28 Waterbird Lane, Sixth Avenue, Tema Community 11',
    city: 'Accra',
    capacity: 35,
    registered: 19,
    registrationDeadline: '2026-12-09T23:59:00+00:00',
  },
  {
    slug: 'awake-with-god-december',
    title: 'Awake With God Devotion',
    category: 'devotion',
    summary:
      'A quiet evening of prayer, short teaching, and music for anyone who wants to start again.',
    description: [
      'Awake With God is a devotional gathering, not a concert. Music carries the evening, but there is room for prayer, teaching, and honest conversation.',
      'Come as you are. Bring a friend if you have one who needs it.',
    ],
    startsAt: '2026-12-19T17:00:00+00:00',
    endsAt: '2026-12-19T19:00:00+00:00',
    venue: 'CLM Central Office',
    address: '28 Waterbird Lane, Sixth Avenue, Tema Community 11',
    city: 'Accra',
    capacity: 120,
    registered: 64,
    registrationDeadline: '2026-12-18T23:59:00+00:00',
  },
  {
    slug: 'street-feeding-day',
    title: 'Street Feeding & Outreach Day',
    category: 'outreach',
    summary: 'A volunteer-led morning of food, conversation, and practical support in Accra.',
    description: [
      'We prepare and distribute meals with volunteers, then spend time talking with people rather than moving past them.',
      'Places are limited by the amount of food we can prepare well. If you register and cannot come, tell us — someone else can take the place.',
    ],
    startsAt: '2027-01-16T08:00:00+00:00',
    endsAt: '2027-01-16T12:00:00+00:00',
    venue: 'Tudu Market',
    address: 'Tudu, Accra Central',
    city: 'Accra',
    capacity: 60,
    registered: 31,
    registrationDeadline: '2027-01-13T23:59:00+00:00',
  },
  {
    slug: 'annual-showcase-2027',
    title: 'CLM Annual Showcase 2027',
    category: 'showcase',
    summary:
      'Our biggest night: emerging gospel artistes, the CLM choir, and a year of work on one stage.',
    description: [
      'The Annual Showcase is where the artiste development work becomes visible. Performers from our clinic and Cross Sessions share a full evening programme.',
      'Venue and final line-up will be confirmed to registered guests first.',
    ],
    startsAt: '2027-02-06T17:00:00+00:00',
    endsAt: '2027-02-06T21:00:00+00:00',
    venue: 'Venue to be confirmed',
    address: 'Accra',
    city: 'Accra',
    capacity: 800,
    registered: 512,
    registrationDeadline: '2027-02-03T23:59:00+00:00',
    featured: true,
  },
]

export const eventSlugs = events.map((event) => event.slug)

export const categoryLabels: Record<EventCategory, string> = {
  session: 'Worship',
  training: 'Training',
  workshop: 'Workshop',
  devotion: 'Devotion',
  outreach: 'Outreach',
  showcase: 'Showcase',
}

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((event) => event.slug === slug)
}
