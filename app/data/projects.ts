import type { Project } from '#shared/types/content'

/**
 * Programmes drawn from Cross-Love Movement's registered aims and reported
 * activities. Figures are limited to what the organisational profile states —
 * replace or extend them as the team publishes results.
 */
export const projects: Project[] = [
  {
    slug: 'cross-sessions',
    title: 'Cross Sessions',
    category: 'gospel',
    summary:
      'Worship gatherings that pair the Word with the full weight of a community’s musical gift.',
    story: [
      'Cross Sessions began with a simple conviction: a gathering can carry both the Gospel and the artistry of the people in the room. Too often one is asked to shrink so the other fits.',
      'We partner with Bible-believing churches to host sessions that combine worship, testimony, and performance. Our musicians lead, local artistes are invited to share the stage, and the congregation is sent out encouraged rather than entertained.',
      'Sessions have been held with The Church of Pentecost, Community 12 District, Paradise Assembly in Tema, and the Bawku District, Bakanga Assembly in the Upper East Region. Each one is planned with the host church, not simply staged for it.',
    ],
    location: 'Tema & Bawku, Ghana',
    status: 'active',
    timeframe: 'Ongoing since 2023',
    image: '/images/project-gospel.svg',
    imageAlt: 'Abstract artwork of sound waves rising inside a church arch',
    accent: 'brand',
    featured: true,
    goals: [
      'Host annual musical events that showcase the talent and creativity of our musicians',
      'Create awareness of the Gospel among Christian and Bible-believing communities',
      'Build lasting relationships with host churches rather than one-off appearances',
    ],
    impact: [
      { value: '2', label: 'Church districts partnered' },
      { value: '2', label: 'Regions reached' },
      { value: 'Annual', label: 'Showcase events' },
    ],
    needs: ['Host churches', 'Sound and stage support', 'Musicians and singers'],
  },
  {
    slug: 'awake-with-god',
    title: 'Awake With God Devotion',
    category: 'gospel',
    summary:
      'A continuing devotional gathering where music, prayer, and encouragement share the same room.',
    story: [
      'Awake With God is a devotional gathering for people who want to start again — in prayer, in faith, and in the company of others who are honest about the journey.',
      'Music carries the gathering, but it is not a concert. Sessions make room for prayer, short teaching, and testimony, and they are open to anyone who wants to come as they are.',
      'The devotion is one of CLM’s continuing activities, run alongside local believers and partner churches in Ghana.',
    ],
    location: 'Accra, Ghana',
    status: 'active',
    timeframe: 'Ongoing',
    image: '/images/project-gospel.svg',
    imageAlt: 'Abstract artwork of sound waves rising inside a church arch',
    accent: 'clay',
    featured: false,
    goals: [
      'Keep a regular space for prayer, worship, and encouragement',
      'Invite people who are curious about faith rather than only the already-convinced',
      'Give CLM musicians a place to serve without a commercial stage',
    ],
    impact: [
      { value: 'Ongoing', label: 'Devotional gatherings' },
      { value: 'Open', label: 'To all who come' },
      { value: 'Volunteer', label: 'Led and hosted' },
    ],
    needs: ['Venue partners', 'Prayer volunteers', 'Musicians'],
  },
  {
    slug: 'artiste-development',
    title: 'Artiste Development',
    category: 'artistes',
    summary:
      'Skills, stages, and support for upcoming gospel artistes who are trying to begin well.',
    story: [
      'There is no shortage of gifted gospel musicians in Ghana. There is a shortage of studios, mentors, stages, and people willing to invest before the first hit.',
      'Our artiste development work is built around three needs: craft, confidence, and content. We are developing a skill programme for musicians and artists, and we use CLM events to give them real stages in front of real audiences.',
      'We also want to help artistes record and release music that speaks to social and environmental issues — songs that name what is happening without turning pain into a product.',
    ],
    location: 'Accra, Ghana',
    status: 'upcoming',
    timeframe: 'Programme in development',
    image: '/images/project-artistes.svg',
    imageAlt: 'Abstract artwork of a microphone lit by a warm spotlight',
    accent: 'brand',
    featured: true,
    goals: [
      'Create a skill development programme for musicians and artists',
      'Showcase emerging talent at CLM’s annual musical events',
      'Support the recording and distribution of socially conscious gospel music',
    ],
    impact: [
      { value: 'Skills', label: 'Training track' },
      { value: 'Stages', label: 'At CLM events' },
      { value: 'Releases', label: 'Music support' },
    ],
    needs: ['Mentors and producers', 'Studio time', 'Instruments'],
  },
  {
    slug: 'missionary-church-support',
    title: 'Missionary Church Support',
    category: 'gospel',
    summary:
      'Instruments, seating, and practical help for missionary churches serving poor and deprived communities.',
    story: [
      'In poor and deprived communities, a faithful church can still be held back by the plainest things: no keyboard, too few chairs, a roof that competes with the sermon.',
      'Objective 7 of our constitution commits us to supporting missionary churches with musical instruments, chairs, and other practical needs that improve the quality of church services.',
      'We would rather supply the unglamorous thing that lasts than fund the photograph that does not. Each request is assessed with the church leadership and, where possible, sourced locally.',
    ],
    location: 'Ghana',
    status: 'upcoming',
    timeframe: 'Objective in progress',
    image: '/images/project-gospel.svg',
    imageAlt: 'Abstract artwork of sound waves rising inside a church arch',
    accent: 'clay',
    featured: false,
    goals: [
      'Equip missionary churches with instruments and seating',
      'Improve the quality and consistency of church services',
      'Build long-term relationships with church leadership',
    ],
    impact: [
      { value: 'Instruments', label: 'Where most needed' },
      { value: 'Seating', label: 'For growing congregations' },
      { value: 'Local', label: 'Sourcing where possible' },
    ],
    needs: ['Instruments', 'Chairs', 'Transport and logistics'],
  },
  {
    slug: 'creation-care',
    title: 'Creation Care',
    category: 'environment',
    summary:
      'Trained volunteers teaching waste segregation, plastic recovery, and recycling in churches and communities.',
    story: [
      'Plastic waste is not an abstract environmental issue in Ghana. It is in the drains, the waterways, and the streets where people trade and worship.',
      'Creation Care is a volunteer-led response. We recruit and train people to re-educate their own communities on waste segregation, plastic waste management, and recycling — practical habits that begin at home and carry into schools and churches.',
      'We also want to create music and content that makes the case for creation care in a way people will actually listen to. A song can carry a message a leaflet cannot.',
    ],
    location: 'Greater Accra, Ghana',
    status: 'upcoming',
    timeframe: 'Pilot programme in development',
    image: '/images/project-environment.svg',
    imageAlt: 'Abstract artwork of a recycling loop and leaves in warm tones',
    accent: 'brand',
    featured: true,
    goals: [
      'Train volunteers to teach waste segregation and plastic recovery',
      'Run awareness sessions in churches, schools, and markets',
      'Produce music and content that keeps the message alive',
    ],
    impact: [
      { value: '3', label: 'Practices taught' },
      { value: 'Trained', label: 'Community volunteers' },
      { value: 'Churches', label: 'And schools engaged' },
    ],
    needs: ['Volunteers', 'Sorting bins', 'School and church partners'],
  },
  {
    slug: 'compassion-in-action',
    title: 'Compassion in Action',
    category: 'community',
    summary:
      'Street feeding, orphanage support, and practical help for neighbours facing hard seasons.',
    story: [
      'Worship that stays inside the room is incomplete. Alongside music and church support, CLM commits to street feeding, orphanage donations, and other activities that address real community needs.',
      'This work is intentionally modest and local. We do not arrive with cameras. We ask what is needed, bring what we can, and come back.',
      'As the organisation grows, this is where volunteers will have the most direct contact with people — and where we expect to learn the most.',
    ],
    location: 'Accra, Ghana',
    status: 'upcoming',
    timeframe: 'Volunteer-led',
    image: '/images/project-community.svg',
    imageAlt: 'Abstract artwork of overlapping circles and a small group of people',
    accent: 'clay',
    featured: false,
    goals: [
      'Organise street feeding days with volunteers',
      'Support orphanages with practical donations',
      'Respond to specific community needs rather than generic campaigns',
    ],
    impact: [
      { value: 'Street', label: 'Feeding days' },
      { value: 'Orphanage', label: 'Support' },
      { value: 'Volunteer', label: 'Led' },
    ],
    needs: ['Food supplies', 'Volunteers', 'Orphanage contacts'],
  },
]

export const projectCategories: { value: 'all' | Project['category']; label: string }[] = [
  { value: 'all', label: 'All programmes' },
  { value: 'gospel', label: 'Gospel outreach' },
  { value: 'artistes', label: 'Artistes' },
  { value: 'environment', label: 'Creation care' },
  { value: 'community', label: 'Community' },
]

export const categoryLabels: Record<Project['category'], string> = {
  gospel: 'Gospel outreach',
  artistes: 'Artistes',
  environment: 'Creation care',
  community: 'Community',
}

export const statusLabels: Record<Project['status'], string> = {
  active: 'Active',
  completed: 'Completed',
  upcoming: 'In development',
}
