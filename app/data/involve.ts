import type { DonationOption, IconName, PartnerTier } from '#shared/types/content'

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
      'Help equip a church, fund a young creative’s training, or put a mentor in front of the next generation.',
    to: '/donate',
    cta: 'Donate',
    icon: 'gift',
  },
  {
    title: 'Volunteer',
    description:
      'Mentor a young person, help run Cross Sessions, design a tract, or film the work. There is room for what you already know.',
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
      'Fund a named programme stream — a year of Cross Sessions, a church equipment drive, or the People Like You symposium.',
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
    impact: 'Print CSL evangelism tracts for a community outreach',
  },
  {
    amount: 300,
    label: 'GH₵300',
    impact: 'Help place an instrument in a missionary church',
  },
  {
    amount: 1000,
    label: 'GH₵1,000',
    impact: 'Contribute to a Cross Sessions outreach event',
  },
  {
    amount: 3000,
    label: 'GH₵3,000',
    impact: 'Support a young creative’s training and mentorship',
  },
]

export const givingPriorities: { title: string; description: string; icon: IconName }[] = [
  {
    title: 'Gospel outreach & church support',
    description:
      'Cross Sessions, Awake With God, and practical support for local churches — building materials, seating, or equipment.',
    icon: 'book',
  },
  {
    title: 'Youth empowerment',
    description: 'Power-Point mentoring, CSL Evangelism, and the People Like You symposium.',
    icon: 'sparkles',
  },
  {
    title: 'Community relief',
    description: 'Recovery support after fires and floods, and practical help for neighbours.',
    icon: 'users',
  },
]
