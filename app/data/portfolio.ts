import type { PortfolioCategory, PortfolioItem } from '#shared/types/content'

/**
 * Placeholder portfolio. These pieces describe programmes and moments that
 * match CLM's stated work, but the specifics are illustrative — replace them
 * with real projects, photography, and links before launch.
 */
export const portfolioItems: PortfolioItem[] = [
  {
    slug: 'cross-sessions-tema-2026',
    title: 'Cross Sessions — Tema',
    category: 'performances',
    year: '2026',
    location: 'Tema, Greater Accra',
    summary: 'A full evening of worship, testimony, and performance at Paradise Assembly.',
    description: [
      'Cross Sessions brought CLM musicians, guest gospel artistes, and the host congregation into one programme built around the Word rather than a headline act.',
      'Worship sets were interspersed with short testimonies from the community, and the host church closed the evening in prayer. The room was full, and the queue at the door started before the advertised opening time.',
      'The session was planned with the church leadership over several weeks, including the running order, sound, and how visiting artistes would be introduced.',
    ],
    image: '/images/portfolio-stage.svg',
    imageAlt: 'Abstract artwork of stage lights and a microphone',
    tags: ['Worship', 'Live performance', 'Church partnership'],
    link: { label: 'Read the announcement', to: '/news/cross-sessions-returns-november' },
  },
  {
    slug: 'awake-with-god-devotion',
    title: 'Awake With God',
    category: 'performances',
    year: '2026',
    location: 'Accra',
    summary: 'A devotional gathering where music, prayer, and short teaching share the room.',
    description: [
      'Awake With God is deliberately quieter than a Cross Session. There is music, but the evening is shaped around prayer, a short teaching, and room for people to speak honestly.',
      'The gathering is one of CLM’s continuing activities and is open to anyone — including people who would not call themselves church people yet.',
    ],
    image: '/images/portfolio-stage.svg',
    imageAlt: 'Abstract artwork of stage lights and a microphone',
    tags: ['Devotion', 'Prayer', 'Accra'],
  },
  {
    slug: 'first-single-studio-support',
    title: 'First single — studio support',
    category: 'recordings',
    year: '2026',
    location: 'Accra',
    summary: 'Studio time and production support for an emerging gospel writer’s first release.',
    description: [
      'A songwriter from our artiste clinic had more than forty songs and no recordings. CLM covered two studio sessions and brought in a producer to work through arrangements with her.',
      'The goal was not a perfect record. It was a finished one — something she could put in front of a congregation, a radio producer, or a promoter without apologising for it.',
      'We are still learning how to support releases without taking ownership of an artiste’s work. The song remains hers.',
    ],
    image: '/images/portfolio-studio.svg',
    imageAlt: 'Abstract artwork of a vinyl record and a sound wave',
    tags: ['Studio', 'Songwriting', 'Artiste support'],
    link: { label: 'Read the clinic story', to: '/news/three-voices-from-the-artiste-clinic' },
  },
  {
    slug: 'artiste-clinic-cohort',
    title: 'Artiste Clinic — first cohort',
    category: 'recordings',
    year: '2026',
    location: 'Accra',
    summary: 'Small-group sessions on songwriting, stage craft, and sustaining a music career.',
    description: [
      'The clinic is a room, not a lecture. Each participant brought one song they were proud of and one they were stuck on, and the group worked through both.',
      'Sessions covered vocal technique, arrangement, performance, and the unglamorous business of pricing work and asking to be paid.',
      'The cohort was small on purpose. We would rather run three honest rooms than one crowded event.',
    ],
    image: '/images/project-artistes.svg',
    imageAlt: 'Abstract artwork of a microphone under a warm spotlight',
    tags: ['Workshop', 'Mentorship', 'Gospel artistes'],
    link: { label: 'Read the story', to: '/news/three-voices-from-the-artiste-clinic' },
  },
  {
    slug: 'tudu-market-feeding',
    title: 'Tudu Market feeding day',
    category: 'outreach',
    year: '2026',
    location: 'Accra Central',
    summary: 'A volunteer-led morning of food, conversation, and practical follow-up.',
    description: [
      'Volunteers prepared and served meals at Tudu Market, then stayed to talk with people instead of packing up as soon as the pots were empty.',
      'We came away with a list of requests we could not meet — a hospital bill, a school fee, a place to sleep — and a commitment to follow up on the ones we could.',
      'The morning also exposed what we got wrong: too much rice, not enough water, and a queue that kept volunteers too busy to listen.',
    ],
    image: '/images/portfolio-market.svg',
    imageAlt: 'Abstract artwork of market stalls under a warm sun',
    tags: ['Street feeding', 'Volunteers', 'Accra'],
    link: { label: 'Read the story', to: '/news/a-morning-at-tudu-market' },
  },
  {
    slug: 'orphanage-afternoon',
    title: 'An afternoon at a partner orphanage',
    category: 'outreach',
    year: '2026',
    location: 'Greater Accra',
    summary: 'Practical donations and time with children at a partner home.',
    description: [
      'We asked the home what it actually needed before turning up. The list was specific: provisions, bedding, and help with transport for a medical appointment.',
      'Volunteers spent the afternoon with the children rather than photographing them, and the visit ended with a plan for the next one.',
      'We do not publish the name or location of the home without permission, and we do not use children’s faces in our communications.',
    ],
    image: '/images/project-community.svg',
    imageAlt: 'Abstract artwork of overlapping circles and a small group of people',
    tags: ['Orphanage', 'Dignity', 'Volunteers'],
  },
  {
    slug: 'creation-care-first-cohort',
    title: 'Creation Care — first cohort',
    category: 'creation',
    year: '2026',
    location: 'Accra',
    summary:
      'Training the first group of volunteers to teach waste segregation and plastic recovery.',
    description: [
      'The first cohort spent a half-day working through the three practices CLM teaches: segregation, plastic recovery, and recycling.',
      'Most of the time went to the harder skill — answering the neighbour who says it does not matter without lecturing them.',
      'Graduates will run short sessions in two churches and a school before the end of the year, and we will report what worked.',
    ],
    image: '/images/project-environment.svg',
    imageAlt: 'Abstract artwork of a recycling loop around a growing leaf',
    tags: ['Training', 'Plastic recovery', 'Volunteers'],
    link: {
      label: 'Read what we learned',
      to: '/news/what-our-first-recycling-volunteers-taught-us',
    },
  },
  {
    slug: 'school-recycling-session',
    title: 'School recycling session',
    category: 'creation',
    year: '2026',
    location: 'Tema',
    summary:
      'A practical session with pupils on sorting, plastic recovery, and why the drains matter.',
    description: [
      'A creation care volunteer ran a session with primary pupils using the school’s own waste as the teaching material — no slides, no abstractions.',
      'Pupils sorted a day’s worth of waste into streams, then talked about where it goes after the bin. The most common question was about the drains.',
      'The school asked us to return with a second session for staff, which is usually the sign that something landed.',
    ],
    image: '/images/project-environment.svg',
    imageAlt: 'Abstract artwork of a recycling loop around a growing leaf',
    tags: ['Schools', 'Education', 'Tema'],
  },
  {
    slug: 'bakanga-assembly-support',
    title: 'Bakanga Assembly — church support',
    category: 'church',
    year: '2026',
    location: 'Bawku, Upper East',
    summary: 'Working through a practical needs list with a missionary church in Bawku.',
    description: [
      'When we visited Bakanga Assembly, we expected to talk about music. The leadership gave us a different list: chairs, a reliable keyboard, transport for visiting preachers, and a roof repair.',
      'Supporting missionary churches with instruments and seating is one of the objectives in CLM’s constitution, and this is what it looks like in practice.',
      'Sourcing is ongoing. We will publish what was supplied and what is still outstanding rather than announcing it as finished.',
    ],
    image: '/images/project-gospel.svg',
    imageAlt: 'Abstract artwork of sound waves rising inside a church arch',
    tags: ['Church support', 'Bawku', 'Instruments'],
    link: {
      label: 'Read the story',
      to: '/news/what-a-church-in-bawku-asked-us-for',
    },
  },
]

export const portfolioCategoryLabels: Record<PortfolioCategory, string> = {
  performances: 'Performances',
  recordings: 'Recordings',
  outreach: 'Outreach',
  creation: 'Creation care',
  church: 'Church support',
}

export const portfolioCategories: { value: 'all' | PortfolioCategory; label: string }[] = [
  { value: 'all', label: 'All work' },
  { value: 'performances', label: 'Performances' },
  { value: 'recordings', label: 'Recordings' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'creation', label: 'Creation care' },
  { value: 'church', label: 'Church support' },
]
