import type {
  Milestone,
  Pillar,
  Stat,
  TeamMember,
  ValueItem,
  IconName,
} from '#shared/types/content'

export const mission =
  'To solidify our support for Christian and Bible-believing communities in propagating the Gospel of Christ, and to help upcoming and struggling gospel artistes jumpstart their careers.'

export const vision =
  'A society where people are inspired by the beauty of music and motivated to contribute to the well-being of others and the planet.'

export const goal =
  'To propagate the Gospel of Christ by all means possible through targeted support to Christian and Bible-believing communities, while supporting upcoming and struggling gospel musicians to jumpstart their careers.'

export const stats: Stat[] = [
  { value: '2023', label: 'Established', note: 'registered 18 May 2023' },
  { value: '3', label: 'Focus areas', note: 'Gospel, artistes, creation' },
  { value: '12', label: 'Constitutional objectives', note: 'our governing aims' },
  { value: '2', label: 'Regions reached', note: 'Greater Accra & Upper East' },
]

export const pillars: Pillar[] = [
  {
    title: 'Bible-believing communities',
    description:
      'We stand with churches and Bible-believing communities — supporting missionary congregations with instruments, seating, and the practical help that keeps worship going.',
    icon: 'book',
  },
  {
    title: 'Gospel artistes',
    description:
      'We help upcoming and struggling gospel musicians build skills, find stages, and release music that speaks honestly to the moment we live in.',
    icon: 'music',
  },
  {
    title: 'Creation care',
    description:
      'We train community volunteers to teach waste segregation, plastic recovery, and recycling — caring for the places we sing in.',
    icon: 'sprout',
  },
]

export const values: ValueItem[] = [
  {
    title: 'Faith in Christ',
    description:
      'We are followers of Jesus first, musicians second. Everything we do is meant to point beyond us.',
    icon: 'heart',
  },
  {
    title: 'Music as ministry',
    description:
      'Music is not decoration here. It is how we teach, encourage, mourn with people, and call a community together.',
    icon: 'music',
  },
  {
    title: 'Dignity for every person',
    description:
      'Artistes, church members, and families in deprived communities are never projects. They are neighbours with names.',
    icon: 'users',
  },
  {
    title: 'Stewardship of creation',
    description:
      'We believe the earth is entrusted to us. Waste segregation and recycling are acts of worship, not side projects.',
    icon: 'sprout',
  },
  {
    title: 'Open hands, open books',
    description:
      'We are a registered company limited by guarantee. Our objectives, registration, and finances are open to those who support us.',
    icon: 'shield',
  },
  {
    title: 'Collaboration',
    description:
      'No single group can carry this. We work with churches, artists, schools, and organisations who share the burden.',
    icon: 'link',
  },
]

export const milestones: Milestone[] = [
  {
    year: '2023',
    title: 'A movement of musicians and patriots',
    description:
      'Cross-Love Movement was formed by a group of musicians and patriots who wanted music and community engagement to do more than entertain.',
  },
  {
    year: '2023',
    title: 'Registered as a company limited by guarantee',
    description:
      'CLM was formally registered by the Registrar General’s Department on 18 May 2023 under registration number CG041650523.',
  },
  {
    year: 'Ongoing',
    title: 'Cross Sessions in Accra and Bawku',
    description:
      'Our sessions have served The Church of Pentecost, Community 12 District, Paradise Assembly, and the Bawku District, Bakanga Assembly.',
  },
  {
    year: 'Ongoing',
    title: 'Awake With God Devotion',
    description:
      'A continuing devotional gathering where music, prayer, and encouragement meet in the same room.',
  },
  {
    year: 'Next',
    title: 'Annual showcase and trained volunteers',
    description:
      'We are building towards an annual musical showcase for our artistes and a trained volunteer network for recycling education.',
  },
]

export const team: TeamMember[] = [
  {
    name: 'Edward Opoku-Agyemang',
    role: 'Secretary & Executive Director',
    bio: 'Leads Cross-Love Movement’s work with churches, gospel artistes, and community partners across Ghana.',
  },
]

export const governance: { title: string; description: string; icon: IconName }[] = [
  {
    title: 'Registered, not informal',
    description:
      'A company limited by guarantee, registered with the Registrar General’s Department on 18 May 2023 under registration number CG041650523.',
    icon: 'shield',
  },
  {
    title: 'Tax identified',
    description:
      'Cross-Love Movement holds Ghana Revenue Authority TIN C0062926586, so institutional partners can give and report cleanly.',
    icon: 'check',
  },
  {
    title: 'Objectives in writing',
    description:
      'Twelve constitutional aims — from Gospel outreach and artiste development to waste segregation and orphanage support — guide what we accept and decline.',
    icon: 'book',
  },
]
