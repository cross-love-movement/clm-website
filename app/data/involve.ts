import type { DonationOption, IconName, PartnerTier, VolunteerRole } from '#shared/types/content'

export const howToHelp: {
  title: string
  description: string
  to: string
  cta: string
  icon: IconName
}[] = [
  {
    title: 'Give',
    description:
      'Help equip a church, train a recycling volunteer, or put a young artiste in a studio for a day.',
    to: '/donate',
    cta: 'Donate',
    icon: 'gift',
  },
  {
    title: 'Volunteer',
    description:
      'Sing, teach, film, sort plastics, or feed a street. There is work for what you already know.',
    to: '/volunteer',
    cta: 'Join the team',
    icon: 'heart',
  },
  {
    title: 'Partner',
    description:
      'Bring your church, company, school, or foundation alongside a programme that needs steady support.',
    to: '/partnership',
    cta: 'Start a partnership',
    icon: 'link',
  },
]

export const volunteerRoles: VolunteerRole[] = [
  {
    title: 'Cross Sessions volunteer',
    commitment: 'Event days · as scheduled',
    description:
      'Help set up, welcome guests, manage the stage, and make sure a host church is supported rather than stretched.',
    requirements: [
      'Available for event days in Accra or Bawku',
      'Comfortable with practical setup and hospitality',
      'Attend a short briefing before the event',
    ],
  },
  {
    title: 'Music mentor',
    commitment: '2–4 hours a month',
    description:
      'Coach an emerging gospel artiste in craft, stage presence, or songwriting as our development programme takes shape.',
    requirements: [
      'Practical experience as a musician, producer, or worship leader',
      'Patience with people who are still finding their voice',
      'Willing to complete a safeguarding briefing',
    ],
  },
  {
    title: 'Recycling educator',
    commitment: '1–2 sessions a month',
    description:
      'Join the creation care team and help teach waste segregation, plastic recovery, and recycling in churches, schools, and markets.',
    requirements: [
      'Willing to complete CLM’s volunteer training',
      'Comfortable speaking to small groups',
      'Genuine interest in environmental care',
    ],
  },
  {
    title: 'Media & content',
    commitment: '4–6 hours a month',
    description:
      'Photograph sessions, record performances, edit short clips, and help us tell the story without exploiting the people in it.',
    requirements: [
      'Photography, video, or editing experience',
      'Own equipment helpful but not essential',
      'Commitment to consent and dignity-first storytelling',
    ],
  },
  {
    title: 'Street outreach volunteer',
    commitment: 'Project days · as scheduled',
    description:
      'Support street feeding days and orphanage visits — preparation, distribution, and respectful presence.',
    requirements: [
      'Able to help with preparation and carrying supplies',
      'Calm, respectful manner with vulnerable people',
      'Attend a safeguarding briefing',
    ],
  },
  {
    title: 'Administrative & prayer support',
    commitment: '3–4 hours a week · remote',
    description:
      'Assist with records, scheduling, donor updates, and hold the work in prayer. Both are real contributions.',
    requirements: [
      'Comfortable with spreadsheets and email',
      'Careful with confidential information',
      'Access to a laptop and reliable internet',
    ],
  },
]

export const volunteerAreas = volunteerRoles.map((role) => role.title)

export const partnerTiers: PartnerTier[] = [
  {
    name: 'Church partner',
    commitment: 'In-kind, venue, or volunteers',
    description:
      'Host a Cross Session, share your space, or mobilise your congregation to serve alongside us.',
    benefits: [
      'A session planned with your leadership',
      'Recognition as a host church',
      'Updates on what the gathering achieved',
    ],
  },
  {
    name: 'Programme partner',
    commitment: 'From GH₵5,000 a year',
    description:
      'Fund a named programme stream — a year of Cross Sessions, a church equipment drive, or a creation care pilot.',
    benefits: [
      'Named programme partnership',
      'Written report on spend and outcomes',
      'Invitation to visit a session or outreach day',
      'Logo placement on programme materials',
    ],
    highlighted: true,
  },
  {
    name: 'Corporate partner',
    commitment: 'Custom CSR programme',
    description:
      'Build employee volunteering, matched giving, or a co-designed community project around your goals.',
    benefits: [
      'Co-designed programme with clear outcomes',
      'Employee volunteering days',
      'Co-branded communications',
      'Executive briefing on community impact',
    ],
  },
  {
    name: 'Institutional partner',
    commitment: 'Grants & multi-year funding',
    description:
      'Foundations and agencies supporting Gospel outreach, artiste development, and environmental education at community level.',
    benefits: [
      'Full proposal and logical framework',
      'Registration and TIN documentation',
      'Monitoring and evaluation data',
      'Joint learning and dissemination',
    ],
  },
]

export const donationOptions: DonationOption[] = [
  {
    amount: 100,
    label: 'GH₵100',
    impact: 'Print recycling education materials for a community session',
  },
  {
    amount: 300,
    label: 'GH₵300',
    impact: 'Help put a working instrument in a missionary church',
  },
  {
    amount: 1000,
    label: 'GH₵1,000',
    impact: 'Contribute to a Cross Sessions outreach event',
  },
  {
    amount: 3000,
    label: 'GH₵3,000',
    impact: 'Support studio time for an emerging gospel artiste',
  },
]

export const givingPriorities: { title: string; description: string; icon: IconName }[] = [
  {
    title: 'Gospel outreach & church support',
    description:
      'Cross Sessions, Awake With God, and instruments or seating for missionary churches.',
    icon: 'book',
  },
  {
    title: 'Artiste development',
    description: 'Skills training, stages, and recording support for upcoming gospel musicians.',
    icon: 'music',
  },
  {
    title: 'Creation care',
    description: 'Training volunteers to teach waste segregation, plastic recovery, and recycling.',
    icon: 'sprout',
  },
  {
    title: 'Compassion in action',
    description: 'Street feeding, orphanage support, and practical help for neighbours.',
    icon: 'users',
  },
]
