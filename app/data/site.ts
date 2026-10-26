import type { NavLink, SocialLink } from '#shared/types/content'

export const site = {
  name: 'Cross-Love Movement',
  shortName: 'CLM',
  legalName: 'Cross-Love Movement, Limited By Guarantee',
  tagline: 'Faith. Music. Community.',
  description:
    'Cross-Love Movement is a Ghanaian NGO using the power of music and community engagement to share the Gospel of Christ, support gospel artistes, and care for people and the planet.',
  email: 'info@clmnative.com',
  website: 'https://www.clmnative.com',
  phone: '+233 55 175 7842',
  phoneHref: '+233551757842',
  mobile: '+233 26 854 9359',
  mobileHref: '+233268549359',
  address: {
    line1: '28 Waterbird Lane',
    line2: 'Sixth Avenue Street, Tema Community 11',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
  },
  hours: 'Monday – Friday, 9:00 – 17:00 GMT',
  registration: {
    authority: 'Registrar General’s Department',
    number: 'CG041650523',
    tin: 'C0062926586',
    date: '18 May 2023',
  },
} as const

export const primaryNav: NavLink[] = [
  { label: 'About', to: '/about' },
  { label: 'Our Projects', to: '/projects' },
  { label: 'Events', to: '/events' },
  { label: 'News', to: '/news' },
  { label: 'Volunteer', to: '/volunteer' },
  { label: 'Partnership', to: '/partnership' },
  { label: 'Contact', to: '/contact' },
]

export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Organisation',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Our projects', to: '/projects' },
      { label: 'Events', to: '/events' },
      { label: 'News', to: '/news' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Get involved',
    links: [
      { label: 'Volunteer', to: '/volunteer' },
      { label: 'Partner with us', to: '/partnership' },
      { label: 'Donate', to: '/donate' },
    ],
  },
]

export const socials: SocialLink[] = [{ label: 'clmnative.com', href: 'https://www.clmnative.com' }]
