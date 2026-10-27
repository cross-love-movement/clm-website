import type {
  Milestone,
  Pillar,
  Stat,
  TeamMember,
  ValueItem,
  IconName,
} from '#shared/types/content'

/**
 * Organisation copy follows the 2026 Cross-Love Movement profile.
 * Where the profile is silent, the earlier claim is kept and flagged in the
 * README rather than invented.
 */

export const mission =
  'To leverage faith, creativity and inclusion to empower youth in building sustainable societies.'

export const vision =
  'To be a hub that builds a succession of youth empowered to drive transgenerational impact in Ghana and beyond.'

export const introduction =
  'Cross-Love Movement is a Christian, non-denominational nonprofit network of young corporate creatives and youthful advocates. Since 2018 we have used faith, creativity, and inclusion to involve young people in work that outlives them.'

export const stats: Stat[] = [
  { value: '2018', label: 'Serving since', note: 'registered in 2023' },
  { value: '9', label: 'Cross Sessions editions', note: 'annual flagship event' },
  { value: '2', label: 'Programme classes', note: 'CMPs and YEPs' },
  { value: '5', label: 'Core values', note: 'faith, creativity, inclusion, service, impact' },
]

export const pillars: Pillar[] = [
  {
    title: 'Christian Mission Projects',
    description:
      'Church-specific support in communities the state seldom reaches — building materials, seating, equipment, and the practical help that keeps a local congregation serving its neighbours.',
    icon: 'book',
  },
  {
    title: 'Youth Empowerment Programmes',
    description:
      'Capacity-building for young people: peace advocacy, creative mentorship, evangelism in the spaces youth already inhabit, and a career symposium for the next generation.',
    icon: 'sparkles',
  },
  {
    title: 'Cross Sessions',
    description:
      'Our annual flagship creative event, hosted on Easter Sunday, where a cross-denominational network of young creatives performs, exhibits, and raises funds for the projects.',
    icon: 'music',
  },
]

export const values: ValueItem[] = [
  {
    title: 'Faith',
    description:
      'Holding to our Christian values, we ensure our projects are anchored in scripture.',
    icon: 'heart',
  },
  {
    title: 'Creativity',
    description:
      'We use the psychology of creativity as a therapeutic tool to engage the diverse youthful generations of our time and to build initiatives fit for a changing world.',
    icon: 'sparkles',
  },
  {
    title: 'Inclusion',
    description:
      'We create space where all — irrespective of social, cultural, or denominational background — get a fair share of the benefits of our initiatives, while honouring the stakeholders who oversee our themes.',
    icon: 'users',
  },
  {
    title: 'Service',
    description:
      'Faith with sleeves rolled up, where our collaborative actions respond to societal issues.',
    icon: 'activity',
  },
  {
    title: 'Impact',
    description:
      'Ensuring our resources, activities, and efforts drive measurable, practical transformation in society.',
    icon: 'globe',
  },
]

export const milestones: Milestone[] = [
  {
    year: '2018',
    title: 'A question about talent',
    description:
      'Isaac Nkrumah Dadzie, a young mechanical engineer and musician, asked what his gift was for. The answer — that music could serve people rather than earn from them — became Cross-Love Movement.',
  },
  {
    year: '2023',
    title: 'Registered as a company limited by guarantee',
    description:
      'Formally registered by the Registrar General’s Department on 18 May 2023 under registration number CG041650523, after five years of informal community work.',
  },
  {
    year: '2024',
    title: 'Today Is Us peace campaign',
    description:
      'Ahead of the general elections, we composed a peace anthem with musicians from five cultural backgrounds, a youth Muslim community leader, and a children’s orchestra in Tema — taking the message to national television.',
  },
  {
    year: '2025',
    title: 'Power-Point at the 7th Cross Sessions',
    description:
      'The BusStop Boyz shared how young professionals are tackling sanitation in Ghana, challenging the audience to start in their own homes and churches.',
  },
  {
    year: '2026',
    title: 'Power-Point at the 8th Cross Sessions',
    description:
      'Edward Asare of First Baptist Church, Tema, spoke on “Christ, Creatives, Church, and Country”, calling Christian creatives to anchor their work in Christ.',
  },
  {
    year: '2027',
    title: 'People Like You',
    description:
      'A one-day youth empowerment symposium in Tema on 12 June 2027, bringing 700–1,000 young people together with mentors for practical career guidance.',
  },
  {
    year: '2028',
    title: 'Ten years of community engagement',
    description:
      'April 2028 marks a decade of the Movement — the question we are asking is what we can give to the youth of this generation.',
  },
]

export const team: TeamMember[] = [
  {
    name: 'Isaac Nkrumah Dadzie',
    role: 'Founder & Executive Director',
    bio: 'A trained mechanical engineer, musician, and writer who began the Movement in 2018 after asking what his musical gift was for beyond his work.',
  },
  {
    name: 'Edward Opoku-Agyemang',
    role: 'Secretary',
    bio: 'Company secretary, supporting the Movement’s governance, statutory records, and partner relationships.',
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
      'Twelve constitutional aims — from Gospel outreach and youth development to community support — guide what we accept and decline.',
    icon: 'book',
  },
]
